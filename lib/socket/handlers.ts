import { eq } from "drizzle-orm";
import type { Server as SocketIOServer } from "socket.io";
import { RATE_LIMIT, SocketEvent } from "@/lib/constants";
import {
	findConversationForParticipant,
	getPartnerId,
} from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { getNotificationCount } from "@/lib/notification-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { messageSchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";
import { socketAuthMiddleware } from "./auth";
import { presence } from "./presence";

export function setupSocketHandlers(io: SocketIOServer): void {
	io.use(socketAuthMiddleware);

	io.on("connection", (socket) => {
		const userId: string = socket.data.userId;

		const justCameOnline = presence.addSocket(userId, socket.id);
		if (justCameOnline) {
			broadcastPresence(io, userId, "online");
		}

		socket.on(
			SocketEvent.MESSAGE_SEND,
			async (payload: unknown, ack?: (res: unknown) => void) => {
				try {
					if (
						!rateLimit(
							`msg:${userId}`,
							RATE_LIMIT.MESSAGE_MAX,
							RATE_LIMIT.MESSAGE_WINDOW_MS,
						)
					) {
						ack?.({ error: "Too many messages. Please slow down." });
						return;
					}

					const parsed = messageSchema.safeParse(payload);
					if (!parsed.success) {
						ack?.({ error: "Invalid message" });
						return;
					}

					const data = payload as { conversationId?: string };
					const conversationId =
						typeof data.conversationId === "string" ? data.conversationId : "";

					if (!conversationId) {
						ack?.({ error: "conversationId is required" });
						return;
					}

					const conv = findConversationForParticipant(conversationId, userId);
					if (!conv) {
						ack?.({ error: "Conversation not found" });
						return;
					}

					const now = new Date();
					const messageId = crypto.randomUUID();

					db.transaction((tx) => {
						tx.insert(message)
							.values({
								id: messageId,
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

						tx.update(conversation)
							.set({ lastMessageAt: now })
							.where(eq(conversation.id, conversationId))
							.run();
					});

					const newMessage = {
						id: messageId,
						conversationId,
						senderId: userId,
						body: parsed.data.body || "",
						fileName: parsed.data.fileName,
						fileUrl: parsed.data.fileUrl,
						fileType: parsed.data.fileType,
						fileSize: parsed.data.fileSize,
						createdAt: now.getTime(),
					};

					const partnerId = getPartnerId(conv, userId);
					emitToUser(io, partnerId, SocketEvent.MESSAGE_NEW, newMessage);
					emitNotificationCount(io, partnerId);

					ack?.({ ok: true, message: newMessage });
				} catch {
					ack?.({ error: "Internal server error" });
				}
			},
		);

		socket.on(SocketEvent.PRESENCE_SUBSCRIBE, (payload: unknown) => {
			if (
				!payload ||
				typeof payload !== "object" ||
				!("userIds" in payload) ||
				!Array.isArray((payload as { userIds: unknown }).userIds)
			) {
				return;
			}
			const userIds = (payload as { userIds: string[] }).userIds.filter(
				(id): id is string => typeof id === "string",
			);
			const onlineIds = presence.getOnlineUsers(userIds);
			const snapshot = Object.fromEntries(
				userIds.map((id) => [
					id,
					onlineIds.includes(id) ? "online" : "offline",
				]),
			);
			socket.emit(SocketEvent.PRESENCE_SNAPSHOT, snapshot);
		});

		socket.on("disconnect", () => {
			const wentOffline = presence.removeSocket(userId, socket.id);
			if (wentOffline) {
				broadcastPresence(io, userId, "offline");
				db.update(user)
					.set({ lastSeenAt: new Date() })
					.where(eq(user.id, userId))
					.run();
			}
		});
	});
}

function emitToUser(
	io: SocketIOServer,
	userId: string,
	event: string,
	data: unknown,
): void {
	for (const sid of presence.getSocketIds(userId)) {
		io.to(sid).emit(event, data);
	}
}

export function emitNotificationCount(
	io: SocketIOServer,
	userId: string,
): void {
	const counts = getNotificationCount(userId);
	emitToUser(io, userId, SocketEvent.NOTIFICATION_COUNT, counts);
}

function broadcastPresence(
	io: SocketIOServer,
	userId: string,
	status: "online" | "offline",
): void {
	const friendIds = getFriendIds(userId);
	for (const friendId of friendIds) {
		emitToUser(io, friendId, SocketEvent.PRESENCE_UPDATE, { userId, status });
	}
}
