"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/feature/empty-state";
import { FriendsList } from "@/components/feature/requests/friends-list";
import { ReceivedRequests } from "@/components/feature/requests/received-requests";
import { SentRequests } from "@/components/feature/requests/sent-requests";
import type { FriendRequestsData } from "@/components/feature/requests/types";
import { useToast } from "@/components/ui/toast";
import { useSocket } from "@/hooks/use-socket";
import {
	removeFriendRequest,
	respondFriendRequest,
} from "@/lib/actions/friends";
import type { ActionResult } from "@/lib/actions/types";
import { SocketEvent } from "@/lib/constants";

interface FriendRequestsClientProps {
	initialData: FriendRequestsData;
}

export function FriendRequestsClient({
	initialData: data,
}: FriendRequestsClientProps) {
	const router = useRouter();
	const { toast } = useToast();
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
		async (run: () => Promise<ActionResult<unknown>>) => {
			try {
				const res = await run();
				if (res.ok) {
					router.refresh();
				} else {
					toast(res.error, "error");
				}
			} catch {
				toast("Something went wrong", "error");
			} finally {
				setActionLoading(null);
			}
		},
		[router, toast],
	);

	const handleAccept = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(() => respondFriendRequest(id, "accept"));
		},
		[performAction],
	);

	const handleReject = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(() => respondFriendRequest(id, "reject"));
		},
		[performAction],
	);

	const handleCancel = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(() => removeFriendRequest(id));
		},
		[performAction],
	);

	const handleUnfriend = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(() => removeFriendRequest(id));
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
					title="No friend requests yet"
					description="When someone sends you a friend request, it will show up here."
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
