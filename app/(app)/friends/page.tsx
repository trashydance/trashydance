"use client";

import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { FriendsList } from "@/components/feature/requests/friends-list";
import { ReceivedRequests } from "@/components/feature/requests/received-requests";
import { SentRequests } from "@/components/feature/requests/sent-requests";
import type { FriendRequestsData } from "@/components/feature/requests/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/use-socket";
import { SocketEvent } from "@/lib/constants";

export default function FriendsPage() {
	const [data, setData] = useState<FriendRequestsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

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

	const { socket } = useSocket();

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

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={`req-skel-${i.toString()}`} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!data) {
		return (
			<EmptyState
				icon={Users}
				title="Could not load requests"
				description="Something went wrong. Please try again later."
			/>
		);
	}

	const isEmpty =
		data.received.length === 0 &&
		data.sent.length === 0 &&
		data.accepted.length === 0;

	return (
		<div className="space-y-8">
			<h1 className="font-heading text-5xl">Friends.</h1>

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
		</div>
	);
}
