import { eq } from "drizzle-orm";
import type { Server as SocketIOServer } from "socket.io";
import { RATE_LIMIT, SocketEvent } from "@/lib/constants";
import {
	createAndDispatchMessage,
	findConversationForParticipant,
} from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { messageSchema } from "@/lib/validation/schemas";
import { user } from "@/schema/auth";
import { socketAuthMiddleware } from "./auth";
import { emitToUser } from "./emit";
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

					if (
						parsed.data.fileUrl &&
						!parsed.data.fileUrl.startsWith(`/api/uploads/${conversationId}/`)
					) {
						ack?.({ error: "fileUrl does not belong to this conversation" });
						return;
					}

					const newMessage = createAndDispatchMessage(
						io,
						conv,
						userId,
						parsed.data,
					);

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
