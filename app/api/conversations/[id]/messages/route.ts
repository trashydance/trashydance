import { and, desc, eq, lt, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { cursorPaginationSchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";

/**
 * GET /api/conversations/[id]/messages
 * Paginated messages for a conversation, ordered by createdAt DESC.
 * Query params: ?cursor=<timestamp_ms>&limit=50
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id: conversationId } = await params;

	// Verify the user is a participant of this conversation
	const conv = db
		.select()
		.from(conversation)
		.where(
			and(
				eq(conversation.id, conversationId),
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			),
		)
		.get();

	if (!conv) {
		return Response.json({ error: "Conversation not found" }, { status: 404 });
	}

	// Parse pagination params
	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const pagination = cursorPaginationSchema.safeParse(searchParams);
	if (!pagination.success) {
		return Response.json(
			{ error: "Invalid pagination params" },
			{ status: 400 },
		);
	}

	const { cursor, limit } = pagination.data;

	// Build conditions
	const conditions = [eq(message.conversationId, conversationId)];
	if (cursor !== undefined) {
		conditions.push(lt(message.createdAt, new Date(cursor)));
	}

	const messages = db
		.select({
			id: message.id,
			conversationId: message.conversationId,
			senderId: message.senderId,
			body: message.body,
			createdAt: message.createdAt,
			senderName: user.name,
			senderUsername: user.username,
			senderImage: user.image,
		})
		.from(message)
		.innerJoin(user, eq(message.senderId, user.id))
		.where(and(...conditions))
		.orderBy(desc(message.createdAt))
		.limit(limit + 1) // Fetch one extra to determine if there are more
		.all();

	const hasMore = messages.length > limit;
	const items = hasMore ? messages.slice(0, limit) : messages;

	const nextCursor =
		hasMore && items.length > 0
			? (items[items.length - 1].createdAt?.getTime() ?? null)
			: null;

	return Response.json({
		messages: items.map((m) => ({
			id: m.id,
			conversationId: m.conversationId,
			senderId: m.senderId,
			body: m.body,
			createdAt: m.createdAt?.getTime() ?? null,
			sender: {
				name: m.senderName,
				username: m.senderUsername,
				image: m.senderImage,
			},
		})),
		nextCursor,
		hasMore,
	});
}
