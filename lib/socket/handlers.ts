import { and, eq, or } from "drizzle-orm";
import type { Server as SocketIOServer } from "socket.io";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { getNotificationCount } from "@/lib/notification-helpers";
import { messageSchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";
import { socketAuthMiddleware } from "./auth";
import { presence } from "./presence";

/**
 * Wire up all Socket.IO event handlers on the given server instance.
 */
export function setupSocketHandlers(io: SocketIOServer): void {
	// Authenticate every incoming connection
	io.use(socketAuthMiddleware);

	io.on("connection", (socket) => {
		const userId: string = socket.data.userId;
		console.log(`[socket] connected: ${userId} (${socket.id})`);

		// ── Presence: user comes online ────────────────────────────────
		const justCameOnline = presence.addSocket(userId, socket.id);
		if (justCameOnline) {
			broadcastPresence(io, userId, "online");
		}

		// ── message:send ───────────────────────────────────────────────
		socket.on(
			"message:send",
			async (payload: unknown, ack?: (res: unknown) => void) => {
				try {
					const parsed = messageSchema.safeParse(payload);
					if (!parsed.success) {
						console.log(
							"[socket] message:send validation failed:",
							JSON.stringify(parsed.error.flatten()),
							"payload:",
							JSON.stringify(payload),
						);
						ack?.({ error: "Invalid message" });
						return;
					}
					console.log(
						"[socket] message:send parsed:",
						JSON.stringify(parsed.data),
					);

					const data = payload as {
						conversationId?: string;
						body?: string;
						fileName?: string;
						fileUrl?: string;
						fileType?: string;
						fileSize?: number;
					};
					const conversationId =
						typeof data.conversationId === "string" ? data.conversationId : "";

					if (!conversationId) {
						ack?.({ error: "conversationId is required" });
						return;
					}

					// Verify the user is a participant of this conversation
					const conv = db
						.select()
						.from(conversation)
						.where(
							and(
								eq(conversation.id, conversationId),
								or(
									eq(conversation.userAId, userId),
									eq(conversation.userBId, userId),
								),
							),
						)
						.get();

					if (!conv) {
						ack?.({ error: "Conversation not found" });
						return;
					}

					const now = new Date();
					const messageId = crypto.randomUUID();

					// Persist message + update conversation.lastMessageAt in a transaction
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

					// Emit only to the partner (sender gets the message via ack)
					const partnerId =
						conv.userAId === userId ? conv.userBId : conv.userAId;

					const partnerSockets = presence.getSocketIds(partnerId);
					for (const sid of partnerSockets) {
						io.to(sid).emit("message:new", newMessage);
					}

					// Emit notification:count to the receiver (partner)
					const partnerCounts = getNotificationCount(partnerId);
					for (const sid of partnerSockets) {
						io.to(sid).emit("notification:count", partnerCounts);
					}

					ack?.({ ok: true, message: newMessage });
				} catch {
					ack?.({ error: "Internal server error" });
				}
			},
		);

		// ── presence:subscribe ─────────────────────────────────────────
		socket.on("presence:subscribe", (payload: unknown) => {
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
			socket.emit("presence:snapshot", snapshot);
		});

		// ── Disconnect ─────────────────────────────────────────────────
		socket.on("disconnect", () => {
			const wentOffline = presence.removeSocket(userId, socket.id);
			if (wentOffline) {
				broadcastPresence(io, userId, "offline");

				// Update user.lastSeenAt in the database
				db.update(user)
					.set({ lastSeenAt: new Date() })
					.where(eq(user.id, userId))
					.run();
			}
		});
	});
}

/**
 * Broadcast a presence update to all friends of the given user.
 */
function broadcastPresence(
	io: SocketIOServer,
	userId: string,
	status: "online" | "offline",
): void {
	// Find all friends of this user (accepted friend requests in either direction)
	const friendIds = getFriendIds(userId);

	for (const friendId of friendIds) {
		for (const sid of presence.getSocketIds(friendId)) {
			io.to(sid).emit("presence:update", { userId, status });
		}
	}
}
