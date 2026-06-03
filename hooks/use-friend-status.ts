"use client";

import { useCallback, useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import type { FriendStatus } from "@/lib/types";
import { useSocket } from "./use-socket";

export function useFriendStatus(
	userId: string,
	initialStatus: FriendStatus,
	initialRequestId?: string,
	onStatusChange?: (status: FriendStatus) => void,
) {
	const [friendStatus, setFriendStatusRaw] =
		useState<FriendStatus>(initialStatus);
	const [requestId, setRequestId] = useState<string | undefined>(
		initialRequestId,
	);
	const [isLoading, setIsLoading] = useState(false);
	const { socket } = useSocket();

	useEffect(() => {
		if (!socket) return;

		function handleUpdate(data: {
			id: string;
			senderId: string;
			receiverId: string;
			status: string;
		}) {
			if (data.senderId !== userId && data.receiverId !== userId) return;

			if (data.status === "accepted") {
				setFriendStatusRaw("friends");
				setRequestId(data.id);
				onStatusChange?.("friends");
			} else if (data.status === "rejected" || data.status === "none") {
				setFriendStatusRaw("none");
				setRequestId(undefined);
				onStatusChange?.("none");
			}
		}

		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, handleUpdate);
		return () => {
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, handleUpdate);
		};
	}, [socket, userId, onStatusChange]);

	const setFriendStatus = useCallback(
		(status: FriendStatus) => {
			setFriendStatusRaw(status);
			onStatusChange?.(status);
		},
		[onStatusChange],
	);

	const sendRequest = useCallback(async () => {
		const prevStatus = friendStatus;
		setFriendStatus("pending_sent");
		setIsLoading(true);

		try {
			const res = await fetch("/api/friend-requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ receiverId: userId }),
			});
			if (res.ok) {
				const data = await res.json();
				setRequestId(data.id);
			} else {
				setFriendStatus(prevStatus);
			}
		} catch {
			setFriendStatus(prevStatus);
		} finally {
			setIsLoading(false);
		}
	}, [userId, friendStatus, setFriendStatus]);

	const cancelRequest = useCallback(async () => {
		if (!requestId) return;
		const prevStatus = friendStatus;
		const prevRequestId = requestId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await fetch(`/api/friend-requests/${prevRequestId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [requestId, friendStatus, setFriendStatus]);

	const acceptRequest = useCallback(async () => {
		if (!requestId) return;
		const prevStatus = friendStatus;
		setFriendStatus("friends");
		setIsLoading(true);

		try {
			const res = await fetch(`/api/friend-requests/${requestId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "accept" }),
			});
			if (!res.ok) {
				setFriendStatus(prevStatus);
			}
		} catch {
			setFriendStatus(prevStatus);
		} finally {
			setIsLoading(false);
		}
	}, [requestId, friendStatus, setFriendStatus]);

	const rejectRequest = useCallback(async () => {
		if (!requestId) return;
		const prevStatus = friendStatus;
		const prevRequestId = requestId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await fetch(`/api/friend-requests/${prevRequestId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "reject" }),
			});
			if (!res.ok) {
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [requestId, friendStatus, setFriendStatus]);

	const unfriend = useCallback(async () => {
		if (!requestId) return;
		const prevStatus = friendStatus;
		const prevRequestId = requestId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await fetch(`/api/friend-requests/${prevRequestId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [requestId, friendStatus, setFriendStatus]);

	return {
		friendStatus,
		requestId,
		sendRequest,
		cancelRequest,
		acceptRequest,
		rejectRequest,
		unfriend,
		isLoading,
	};
}
