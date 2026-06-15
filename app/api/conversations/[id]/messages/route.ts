import { and, desc, eq, lt } from "drizzle-orm";
import type { NextRequest } from "next/server";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { RATE_LIMIT } from "@/lib/constants";
import {
	createAndDispatchMessage,
	findConversationForParticipant,
} from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getIO } from "@/lib/socket/io-instance";
import {
	cursorPaginationSchema,
	messageSchema,
} from "@/lib/validation/schemas";
import { message, user } from "@/schema";

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

	// Same key as the Socket.IO path: the budget is shared across channels.
	if (
		!rateLimit(
			`msg:${userId}`,
			RATE_LIMIT.MESSAGE_MAX,
			RATE_LIMIT.MESSAGE_WINDOW_MS,
		)
	) {
		return rateLimitResponse();
	}

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const body: unknown = await request.json();
	const parsed = messageSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid message");
	}

	if (
		parsed.data.fileUrl &&
		!parsed.data.fileUrl.startsWith(`/api/uploads/${conversationId}/`)
	) {
		return badRequest("fileUrl does not belong to this conversation");
	}

	const newMessage = createAndDispatchMessage(
		getIO(),
		conv,
		userId,
		parsed.data,
	);

	return Response.json(newMessage, { status: 201 });
}
