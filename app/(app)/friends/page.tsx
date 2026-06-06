"use client";

import { Users } from "lucide-react";
import { EmptyState } from "@/components/feature/empty-state";
import { FriendsList } from "@/components/feature/requests/friends-list";
import { ReceivedRequests } from "@/components/feature/requests/received-requests";
import { SentRequests } from "@/components/feature/requests/sent-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { useFriendRequests } from "@/hooks/use-friend-requests";

export default function FriendsPage() {
	const {
		data,
		isLoading,
		actionLoading,
		handleAccept,
		handleReject,
		handleCancel,
		handleUnfriend,
	} = useFriendRequests();

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
