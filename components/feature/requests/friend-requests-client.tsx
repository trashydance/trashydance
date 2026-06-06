"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { FriendsList } from "@/components/feature/requests/friends-list";
import { ReceivedRequests } from "@/components/feature/requests/received-requests";
import { SentRequests } from "@/components/feature/requests/sent-requests";
import type { FriendRequestsData } from "@/components/feature/requests/types";
import { useSocket } from "@/hooks/use-socket";
import { SocketEvent } from "@/lib/constants";

interface FriendRequestsClientProps {
	initialData: FriendRequestsData;
}

export function FriendRequestsClient({
	initialData: data,
}: FriendRequestsClientProps) {
	const router = useRouter();
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const { socket } = useSocket();

	// Live updates: re-run the server component query so fresh data
	// flows back in as props — no client-side refetch needed.
	useEffect(() => {
		if (!socket) return;
		const onUpdate = () => router.refresh();
		socket.on(SocketEvent.FRIEND_REQUEST_NEW, onUpdate);
		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, onUpdate);
		socket.on(SocketEvent.NOTIFICATION_COUNT, onUpdate);
		return () => {
			socket.off(SocketEvent.FRIEND_REQUEST_NEW, onUpdate);
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, onUpdate);
			socket.off(SocketEvent.NOTIFICATION_COUNT, onUpdate);
		};
	}, [socket, router]);

	const performAction = useCallback(
		async (url: string, options?: RequestInit) => {
			try {
				const res = await fetch(url, options);
				if (res.ok) router.refresh();
			} catch {
				// Network error
			} finally {
				setActionLoading(null);
			}
		},
		[router],
	);

	const handleAccept = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "accept" }),
			});
		},
		[performAction],
	);

	const handleReject = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "reject" }),
			});
		},
		[performAction],
	);

	const handleCancel = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, { method: "DELETE" });
		},
		[performAction],
	);

	const handleUnfriend = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(`/api/friend-requests/${id}`, { method: "DELETE" });
		},
		[performAction],
	);

	const isEmpty =
		data.received.length === 0 &&
		data.sent.length === 0 &&
		data.accepted.length === 0;

	return (
		<>
			{isEmpty && (
				<EmptyState
					icon={Users}
					title="No requests yet"
					description="When someone sends you a follow request, it will show up here."
				/>
			)}

			<ReceivedRequests
				requests={data.received}
				onAccept={handleAccept}
				onReject={handleReject}
				loadingId={actionLoading}
			/>
			<SentRequests
				requests={data.sent}
				onCancel={handleCancel}
				loadingId={actionLoading}
			/>
			<FriendsList
				friends={data.accepted}
				onUnfriend={handleUnfriend}
				loadingId={actionLoading}
			/>
		</>
	);
}
