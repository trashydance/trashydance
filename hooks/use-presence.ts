"use client";

import { useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import { useSocket } from "./use-socket";

export function usePresence(userIds: string[]) {
	const { socket, isConnected } = useSocket();
	const [onlineUsers, setOnlineUsers] = useState<Map<string, boolean>>(
		new Map(),
	);

	// Stable dependency: a new `userIds` array reference on every render would
	// otherwise force a continuous unsubscribe/resubscribe cycle.
	const userIdsKey = [...userIds].sort().join(",");

	useEffect(() => {
		const ids = userIdsKey ? userIdsKey.split(",") : [];
		if (!socket || !isConnected || ids.length === 0) return;

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
		socket.emit(SocketEvent.PRESENCE_SUBSCRIBE, { userIds: ids });

		return () => {
			socket.off(SocketEvent.PRESENCE_SNAPSHOT, handleSnapshot);
			socket.off(SocketEvent.PRESENCE_UPDATE, handleUpdate);
		};
	}, [socket, isConnected, userIdsKey]);

	return onlineUsers;
}
