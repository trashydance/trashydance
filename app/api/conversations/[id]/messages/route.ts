import { and, desc, eq, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { SocketEvent } from "@/lib/constants";
import {
	findConversationForParticipant,
	getPartnerId,
} from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { emitNotificationCount } from "@/lib/socket/handlers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import {
	cursorPaginationSchema,
	messageSchema,
} from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id: conversationId } = await params;

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const pagination = cursorPaginationSchema.safeParse(searchParams);
	if (!pagination.success) {
		return badRequest("Invalid pagination params");
	}

	const { cursor, limit } = pagination.data;

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
		.limit(limit + 1)
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
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id: conversationId } = await params;

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const body: unknown = await request.json();
	const parsed = messageSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid message");
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
		const partnerId = getPartnerId(conv, userId);
		for (const sid of presence.getSocketIds(partnerId)) {
			io.to(sid).emit(SocketEvent.MESSAGE_NEW, newMessage);
		}
		emitNotificationCount(io, partnerId);
	}

	return Response.json(newMessage, { status: 201 });
}
