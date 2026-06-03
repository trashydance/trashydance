"use client";

import { useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import { useSocket } from "./use-socket";

export function usePresence(userIds: string[]) {
	const { socket, isConnected } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(
		new Map(),
	);

	useEffect(() => {
		if (!socket || !isConnected || userIds.length === 0) return;

		function handleSnapshot(data: Record<string, "online" | "offline">) {
			setOnlineUsers(() => {
				const next = new Map<string, boolean>();
				for (const [uid, status] of Object.entries(data)) {
					next.set(uid, status === "online");
				}
				return next;
			});
		}

		function handleUpdate(data: { userId: string; status: string }) {
			setOnlineUsers((prev) => {
				const next = new Map(prev);
				next.set(data.userId, data.status === "online");
				return next;
			});
		}

		socket.on(SocketEvent.PRESENCE_SNAPSHOT, handleSnapshot);
		socket.on(SocketEvent.PRESENCE_UPDATE, handleUpdate);
		socket.emit(SocketEvent.PRESENCE_SUBSCRIBE, { userIds });

		return () => {
			socket.off(SocketEvent.PRESENCE_SNAPSHOT, handleSnapshot);
			socket.off(SocketEvent.PRESENCE_UPDATE, handleUpdate);
		};
	}, [socket, isConnected, userIds.length, userIds]);

	return onlineUsers;
}
