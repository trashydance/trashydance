"use client";

import { useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import { useSocket } from "./use-socket";

interface NotificationCount {
	pendingRequests: number;
	unreadChats: number;
}

export function useNotificationCount() {
	const [counts, setCounts] = useState<NotificationCount>({
		pendingRequests: 0,
		unreadChats: 0,
	});
	const { socket } = useSocket();

	useEffect(() => {
		async function fetchCounts() {
			try {
				const res = await fetch("/api/notifications/count");
				if (res.ok) {
					const data = await res.json();
					setCounts({
						pendingRequests: data.pendingRequests ?? 0,
						unreadChats: data.unreadChats ?? 0,
					});
				}
			} catch {
				// Silently fail
			}
		}
		fetchCounts();
	}, []);

	useEffect(() => {
		if (!socket) return;

		function handleCountUpdate(data: NotificationCount) {
			setCounts({
				pendingRequests: data.pendingRequests ?? 0,
				unreadChats: data.unreadChats ?? 0,
			});
		}

		function handleNewFriendRequest() {
			setCounts((prev) => ({
				...prev,
				pendingRequests: prev.pendingRequests + 1,
			}));
		}

		function handleFriendRequestAccepted() {
			setCounts((prev) => ({
				...prev,
				pendingRequests: Math.max(0, prev.pendingRequests - 1),
			}));
		}

		socket.on(SocketEvent.NOTIFICATION_COUNT, handleCountUpdate);
		socket.on(SocketEvent.FRIEND_REQUEST_NEW, handleNewFriendRequest);
		socket.on("friend-request:accepted", handleFriendRequestAccepted);

		return () => {
			socket.off(SocketEvent.NOTIFICATION_COUNT, handleCountUpdate);
			socket.off(SocketEvent.FRIEND_REQUEST_NEW, handleNewFriendRequest);
			socket.off("friend-request:accepted", handleFriendRequestAccepted);
		};
	}, [socket]);

	return {
		pendingRequests: counts.pendingRequests,
		unreadChats: counts.unreadChats,
		total: counts.pendingRequests + counts.unreadChats,
	};
}
