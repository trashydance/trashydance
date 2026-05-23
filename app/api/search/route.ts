import { and, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";

/**
 * GET /api/search?q=...
 * Global search across the user's conversations:
 * - Users: by username among conversation partners
 * - Messages: by body content in user's conversations
 */
export async function GET(request: NextRequest) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const parsed = searchQuerySchema.safeParse(searchParams);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid search query", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { q } = parsed.data;
	const pattern = `%${q}%`;

	// Get all conversation IDs for the current user
	const myConversations = db
		.select({
			id: conversation.id,
			userAId: conversation.userAId,
			userBId: conversation.userBId,
		})
		.from(conversation)
		.where(
			or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
		)
		.all();

	if (myConversations.length === 0) {
		return Response.json({ users: [], messages: [] });
	}

	// Get partner IDs
	const partnerIds = [
		...new Set(
			myConversations.map((c) =>
				c.userAId === userId ? c.userBId : c.userAId,
			),
		),
	];
	const convIds = myConversations.map((c) => c.id);

	// Search users by username among my conversation partners
	const matchedUsers =
		partnerIds.length > 0
			? db
					.select({
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					})
					.from(user)
					.where(
						and(
							like(user.username, pattern),
							or(...partnerIds.map((pid) => eq(user.id, pid))),
						),
					)
					.limit(20)
					.all()
			: [];

	// Search messages by body in my conversations
	const matchedMessages =
		convIds.length > 0
			? db
					.select({
						id: message.id,
						conversationId: message.conversationId,
						senderId: message.senderId,
						body: message.body,
						createdAt: message.createdAt,
						senderName: user.name,
						senderUsername: user.username,
					})
					.from(message)
					.innerJoin(user, eq(message.senderId, user.id))
					.where(
						and(
							like(message.body, pattern),
							or(...convIds.map((cid) => eq(message.conversationId, cid))),
						),
					)
					.orderBy(desc(message.createdAt))
					.limit(20)
					.all()
			: [];

	return Response.json({
		users: matchedUsers,
		messages: matchedMessages.map((m) => ({
			id: m.id,
			conversationId: m.conversationId,
			senderId: m.senderId,
			body: m.body,
			createdAt: m.createdAt?.getTime() ?? null,
			sender: {
				name: m.senderName,
				username: m.senderUsername,
			},
		})),
	});
}
