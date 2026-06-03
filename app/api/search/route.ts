import { and, desc, eq, like, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import { getPartnerId } from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const parsed = searchQuerySchema.safeParse(searchParams);
	if (!parsed.success) {
		return badRequest("Invalid search query", parsed.error.flatten());
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
		...new Set(myConversations.map((c) => getPartnerId(c, userId))),
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
							or(
								like(user.username, pattern),
								like(user.name, pattern),
								like(user.lastName, pattern),
							),
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
			body: m.body ?? "",
			createdAt: m.createdAt?.getTime() ?? null,
			sender: {
				name: m.senderName,
				username: m.senderUsername,
			},
		})),
	});
}
