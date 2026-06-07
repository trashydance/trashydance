"use client";

import { useCallback, useEffect, useState } from "react";
import type { FriendRequestsData } from "@/components/feature/requests/types";
import { SocketEvent } from "@/lib/constants";
import { useSocket } from "./use-socket";

export function useFriendRequests() {
	const [data, setData] = useState<FriendRequestsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const { socket } = useSocket();

	const fetchRequests = useCallback(async () => {
		try {
			const res = await fetch("/api/friend-requests");
			if (res.ok) {
				setData(await res.json());
			}
		} catch {
			// Network error
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

	useEffect(() => {
		if (!socket) return;
		const onUpdate = () => fetchRequests();
		socket.on(SocketEvent.FRIEND_REQUEST_NEW, onUpdate);
		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, onUpdate);
		socket.on(SocketEvent.NOTIFICATION_COUNT, onUpdate);
		return () => {
			socket.off(SocketEvent.FRIEND_REQUEST_NEW, onUpdate);
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, onUpdate);
			socket.off(SocketEvent.NOTIFICATION_COUNT, onUpdate);
		};
	}, [socket, fetchRequests]);

	const performAction = useCallback(
		async (url: string, options?: RequestInit) => {
			try {
				const res = await fetch(url, options);
				if (res.ok) fetchRequests();
			} catch {
				// Network error
			} finally {
				setActionLoading(null);
			}
		},
		[fetchRequests],
	);

	const respondToRequest = useCallback(
		(id: string, action: "accept" | "reject") => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			});
		},
		[performAction],
	);

	const handleAccept = useCallback(
		(id: string) => respondToRequest(id, "accept"),
		[respondToRequest],
	);

	const handleReject = useCallback(
		(id: string) => respondToRequest(id, "reject"),
		[respondToRequest],
	);

	// cancel (sent request) and unfriend (accepted) are the same DELETE call.
	const removeRelationship = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, { method: "DELETE" });
		},
		[performAction],
	);

	return {
		data,
		isLoading,
		actionLoading,
		handleAccept,
		handleReject,
		handleCancel: removeRelationship,
		handleUnfriend: removeRelationship,
	};
}
