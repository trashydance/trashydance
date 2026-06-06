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

	/**
	 * Runs an action with an optimistic status update.
	 * Sets `nextStatus` immediately, runs `requestFn`, and rolls back to the
	 * previous status/requestId if the request fails or throws.
	 * `requestFn` receives the previous requestId and returns the fetch Response.
	 */
	const runOptimistic = useCallback(
		async (
			nextStatus: FriendStatus,
			requestFn: (prevRequestId?: string) => Promise<Response>,
			options?: { clearRequestId?: boolean },
		) => {
			const prevStatus = friendStatus;
			const prevRequestId = requestId;
			setFriendStatus(nextStatus);
			if (options?.clearRequestId) setRequestId(undefined);
			setIsLoading(true);

			try {
				const res = await requestFn(prevRequestId);
				if (res.ok) return res;
				setFriendStatus(prevStatus);
				if (options?.clearRequestId) setRequestId(prevRequestId);
				return undefined;
			} catch {
				setFriendStatus(prevStatus);
				if (options?.clearRequestId) setRequestId(prevRequestId);
				return undefined;
			} finally {
				setIsLoading(false);
			}
		},
		[friendStatus, requestId, setFriendStatus],
	);

	const sendRequest = useCallback(async () => {
		const res = await runOptimistic("pending_sent", () =>
			fetch("/api/friend-requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ receiverId: userId }),
			}),
		);
		if (res) {
			const data = await res.json();
			setRequestId(data.id);
		}
	}, [userId, runOptimistic]);

	const acceptRequest = useCallback(async () => {
		if (!requestId) return;
		await runOptimistic("friends", (id) =>
			fetch(`/api/friend-requests/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "accept" }),
			}),
		);
	}, [requestId, runOptimistic]);

	const rejectRequest = useCallback(async () => {
		if (!requestId) return;
		await runOptimistic(
			"none",
			(id) =>
				fetch(`/api/friend-requests/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "reject" }),
				}),
			{ clearRequestId: true },
		);
	}, [requestId, runOptimistic]);

	// cancelRequest and unfriend issue the same DELETE; unified internally,
	// both names kept because different components call each.
	const deleteRequest = useCallback(async () => {
		if (!requestId) return;
		await runOptimistic(
			"none",
			(id) => fetch(`/api/friend-requests/${id}`, { method: "DELETE" }),
			{ clearRequestId: true },
		);
	}, [requestId, runOptimistic]);

	const cancelRequest = deleteRequest;
	const unfriend = deleteRequest;

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
