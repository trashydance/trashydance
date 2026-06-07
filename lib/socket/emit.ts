import type { Server as SocketIOServer } from "socket.io";
import { SocketEvent } from "@/lib/constants";
import { getNotificationCount } from "@/lib/notification-helpers";
import { presence } from "./presence";

export function emitToUser(
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
