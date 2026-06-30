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
import { useI18n } from "@/lib/i18n/i18n-context";

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
	const { t } = useI18n();

	const [friends, setFriends] = useState(data.accepted);
	const [received, setReceived] = useState(data.received);
	const [sent, setSent] = useState(data.sent);

	useEffect(() => {
		setFriends(data.accepted);
		setReceived(data.received);
		setSent(data.sent);
	}, [data]);

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
				return res;
			} catch {
				toast("Something went wrong", "error");
				return { ok: false, error: "Something went wrong" };
			} finally {
				setActionLoading(null);
			}
		},
		[router, toast],
	);

	const handleAccept = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(async () => {
				const res = await respondFriendRequest(id, "accept");
				if (res.ok) {
					setReceived((prev) => prev.filter((r) => r.id !== id));
				}
				return res;
			});
		},
		[performAction],
	);

	const handleReject = useCallback(
		(id: string) => {
			setActionLoading(id);
			performAction(async () => {
				const res = await respondFriendRequest(id, "reject");
				if (res.ok) {
					setReceived((prev) => prev.filter((r) => r.id !== id));
				}
				return res;
			});
		},
		[performAction],
	);

	const handleCancel = useCallback(
		(id: string) => {
			if (!window.confirm("Do you want to withdraw this friend request?"))
				return;
			setActionLoading(id);
			performAction(async () => {
				const res = await removeFriendRequest(id);
				if (res.ok) {
					setSent((prev) => prev.filter((r) => r.id !== id));
				}
				return res;
			});
		},
		[performAction],
	);

	const handleUnfriend = useCallback(
		(id: string) => {
			if (!window.confirm("Are you sure you want to remove this friend?"))
				return;
			setActionLoading(id);
			performAction(async () => {
				const res = await removeFriendRequest(id);
				if (res.ok) {
					setFriends((prev) => prev.filter((f) => f.id !== id));
				}
				return res;
			});
		},
		[performAction],
	);

	const isEmpty =
		received.length === 0 && sent.length === 0 && friends.length === 0;

	return (
		<>
			<h1 className="font-heading text-5xl mb-8">{t("friends")}</h1>
			{isEmpty && (
				<EmptyState
					icon={Users}
					title={t("noFriendRequests")}
					description={t("noFriendRequestsDesc")}
				/>
			)}

			<ReceivedRequests
				requests={received}
				onAccept={handleAccept}
				onReject={handleReject}
				loadingId={actionLoading}
			/>
			<SentRequests
				requests={sent}
				onCancel={handleCancel}
				loadingId={actionLoading}
			/>
			<FriendsList
				friends={friends}
				onUnfriend={handleUnfriend}
				loadingId={actionLoading}
			/>
		</>
	);
}
