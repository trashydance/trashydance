"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./use-socket";

export function usePresence(userIds: string[]) {
	const { socket, isConnected } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(
		new Map(),
	);

	useEffect(() => {
		if (!socket || !isConnected || userIds.length === 0) return;

		function handleSnapshot(data: Record<string, string>) {
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

		socket.on("presence:snapshot", handleSnapshot);
		socket.on("presence:update", handleUpdate);
		socket.emit("presence:subscribe", { userIds });

		return () => {
			socket.off("presence:snapshot", handleSnapshot);
			socket.off("presence:update", handleUpdate);
		};
	}, [socket, isConnected, userIds.length, userIds]);

	return onlineUsers;
}
