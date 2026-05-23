"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./use-socket";

export function usePresence(userIds: string[]) {
	const { socket } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(
		new Map(),
	);

	useEffect(() => {
		if (!socket || userIds.length === 0) return;

		socket.emit("presence:subscribe", userIds);

		function handlePresenceUpdate(data: { userId: string; online: boolean }) {
			setOnlineUsers((prev) => {
				const next = new Map(prev);
				next.set(data.userId, data.online);
				return next;
			});
		}

		function handlePresenceBulk(
			data: Array<{ userId: string; online: boolean }>,
		) {
			setOnlineUsers((prev) => {
				const next = new Map(prev);
				for (const entry of data) {
					next.set(entry.userId, entry.online);
				}
				return next;
			});
		}

		socket.on("presence:update", handlePresenceUpdate);
		socket.on("presence:bulk", handlePresenceBulk);

		return () => {
			socket.off("presence:update", handlePresenceUpdate);
			socket.off("presence:bulk", handlePresenceBulk);
		};
	}, [socket, userIds]);

	return onlineUsers;
}
