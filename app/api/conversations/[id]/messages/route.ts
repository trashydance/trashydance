import { and, desc, eq, lt, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import {
	cursorPaginationSchema,
	messageSchema,
} from "@/lib/validation/schemas";
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
			fileName: message.fileName,
			fileUrl: message.fileUrl,
			fileType: message.fileType,
			fileSize: message.fileSize,
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
			body: m.body ?? "",
			fileName: m.fileName ?? undefined,
			fileUrl: m.fileUrl ?? undefined,
			fileType: m.fileType ?? undefined,
			fileSize: m.fileSize ?? undefined,
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

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id: conversationId } = await params;

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

	const body: unknown = await request.json();
	const parsed = messageSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: "Invalid message" }, { status: 400 });
	}

	const newId = crypto.randomUUID();
	const now = new Date();

	db.insert(message)
		.values({
			id: newId,
			conversationId,
			senderId: userId,
			body: parsed.data.body || "",
			fileName: parsed.data.fileName ?? null,
			fileUrl: parsed.data.fileUrl ?? null,
			fileType: parsed.data.fileType ?? null,
			fileSize: parsed.data.fileSize ?? null,
			createdAt: now,
		})
		.run();

	db.update(conversation)
		.set({ lastMessageAt: now })
		.where(eq(conversation.id, conversationId))
		.run();

	const newMessage = {
		id: newId,
		conversationId,
		senderId: userId,
		body: parsed.data.body || "",
		fileName: parsed.data.fileName,
		fileUrl: parsed.data.fileUrl,
		fileType: parsed.data.fileType,
		fileSize: parsed.data.fileSize,
		createdAt: now.getTime(),
	};

	const io = getIO();
	if (io) {
		const partnerId = conv.userAId === userId ? conv.userBId : conv.userAId;
		for (const sid of presence.getSocketIds(partnerId)) {
			io.to(sid).emit("message:new", newMessage);
		}
	}

	return Response.json(newMessage, { status: 201 });
}
