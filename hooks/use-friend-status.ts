"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
	removeFriendRequest,
	respondFriendRequest,
	sendFriendRequest,
} from "@/lib/actions/friends";
import { SocketEvent } from "@/lib/constants";
import type { FriendStatus } from "@/lib/types";
import { useSocket } from "./use-socket";

export function useFriendStatus(
	userId: string,
	initialStatus: FriendStatus,
	initialRequestId?: string,
	onStatusChange?: (status: FriendStatus, requestId?: string) => void,
) {
	const [friendStatus, setFriendStatusRaw] =
		useState<FriendStatus>(initialStatus);
	const [requestId, setRequestIdRaw] = useState<string | undefined>(
		initialRequestId,
	);
	const requestIdRef = useRef<string | undefined>(initialRequestId);

	const setRequestId = useCallback((id: string | undefined) => {
		requestIdRef.current = id;
		setRequestIdRaw(id);
	}, []);

	// Synchronize state and ref with initialRequestId prop changes
	useEffect(() => {
		requestIdRef.current = initialRequestId;
		setRequestIdRaw(initialRequestId);
	}, [initialRequestId]);

	const [isLoading, setIsLoading] = useState(false);
	const { socket } = useSocket();
	const { toast } = useToast();

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

		// Incoming request from THIS user while the button is mounted:
		// switch to Accept/Reject live (the server emits FRIEND_REQUEST_NEW
		// only to the receiver).
		function handleNew(data: {
			id: string;
			senderId: string;
			receiverId: string;
		}) {
			if (data.senderId !== userId) return;
			setFriendStatusRaw("pending_received");
			setRequestId(data.id);
			onStatusChange?.("pending_received");
		}

		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, handleUpdate);
		socket.on(SocketEvent.FRIEND_REQUEST_NEW, handleNew);
		return () => {
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, handleUpdate);
			socket.off(SocketEvent.FRIEND_REQUEST_NEW, handleNew);
		};
	}, [socket, userId, onStatusChange, setRequestId]);

	const setFriendStatus = useCallback(
		(status: FriendStatus, reqId?: string) => {
			setFriendStatusRaw(status);
			onStatusChange?.(status, reqId);
		},
		[onStatusChange],
	);

	const sendRequest = useCallback(async () => {
		const prevStatus = friendStatus;
		setFriendStatus("pending_sent");
		setIsLoading(true);

		try {
			const res = await sendFriendRequest(userId);
			if (res.ok) {
				setRequestId(res.data.id);
				setFriendStatus("pending_sent", res.data.id);
			} else {
				toast(res.error, "error");
				setFriendStatus(prevStatus);
			}
		} catch {
			toast("Something went wrong", "error");
			setFriendStatus(prevStatus);
		} finally {
			setIsLoading(false);
		}
	}, [userId, friendStatus, setFriendStatus, toast, setRequestId]);

	const cancelRequest = useCallback(async () => {
		const currentId = requestIdRef.current;
		if (!currentId) return;
		const prevStatus = friendStatus;
		const prevRequestId = currentId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await removeFriendRequest(prevRequestId);
			if (!res.ok) {
				toast(res.error, "error");
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			toast("Something went wrong", "error");
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [friendStatus, setFriendStatus, setRequestId, toast]);

	const acceptRequest = useCallback(async () => {
		const currentId = requestIdRef.current;
		if (!currentId) return;
		const prevStatus = friendStatus;
		setFriendStatus("friends");
		setIsLoading(true);

		try {
			const res = await respondFriendRequest(currentId, "accept");
			if (!res.ok) {
				toast(res.error, "error");
				setFriendStatus(prevStatus);
			}
		} catch {
			toast("Something went wrong", "error");
			setFriendStatus(prevStatus);
		} finally {
			setIsLoading(false);
		}
	}, [friendStatus, setFriendStatus, toast]);

	const rejectRequest = useCallback(async () => {
		const currentId = requestIdRef.current;
		if (!currentId) return;
		const prevStatus = friendStatus;
		const prevRequestId = currentId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await respondFriendRequest(prevRequestId, "reject");
			if (!res.ok) {
				toast(res.error, "error");
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			toast("Something went wrong", "error");
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [friendStatus, setFriendStatus, setRequestId, toast]);

	const unfriend = useCallback(async () => {
		const currentId = requestIdRef.current;
		if (!currentId) return;
		const prevStatus = friendStatus;
		const prevRequestId = currentId;
		setFriendStatus("none");
		setRequestId(undefined);
		setIsLoading(true);

		try {
			const res = await removeFriendRequest(prevRequestId);
			if (!res.ok) {
				toast(res.error, "error");
				setFriendStatus(prevStatus);
				setRequestId(prevRequestId);
			}
		} catch {
			toast("Something went wrong", "error");
			setFriendStatus(prevStatus);
			setRequestId(prevRequestId);
		} finally {
			setIsLoading(false);
		}
	}, [friendStatus, setFriendStatus, setRequestId, toast]);

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
