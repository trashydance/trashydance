"use client";

import { Check, Clock, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFriendStatus } from "@/hooks/use-friend-status";
import type { FriendStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FriendRequestButtonProps {
	userId: string;
	initialStatus: FriendStatus;
	requestId?: string;
	className?: string;
	onStatusChange?: (status: FriendStatus) => void;
}

export function FriendRequestButton({
	userId,
	initialStatus,
	requestId: initialRequestId,
	className,
	onStatusChange,
}: FriendRequestButtonProps) {
	const {
		friendStatus,
		sendRequest,
		cancelRequest,
		acceptRequest,
		rejectRequest,
		unfriend,
		isLoading,
	} = useFriendStatus(userId, initialStatus, initialRequestId, onStatusChange);

	if (friendStatus === "none") {
		return (
			<Button
				variant="default"
				size="sm"
				onClick={sendRequest}
				disabled={isLoading}
				className={className}
			>
				<UserPlus className="size-4" />
				Add Friend
			</Button>
		);
	}

	if (friendStatus === "pending_sent") {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={cancelRequest}
				disabled={isLoading}
				className={cn("opacity-70", className)}
			>
				<Clock className="size-4" />
				Pending...
			</Button>
		);
	}

	if (friendStatus === "pending_received") {
		return (
			<div className={cn("flex gap-2", className)}>
				<Button
					variant="default"
					size="sm"
					onClick={acceptRequest}
					disabled={isLoading}
				>
					<Check className="size-4" />
					Accept
				</Button>
				<Button
					variant="destructive"
					size="sm"
					onClick={rejectRequest}
					disabled={isLoading}
				>
					<X className="size-4" />
					Reject
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={unfriend}
			disabled={isLoading}
			className={className}
		>
			<UserMinus className="size-4" />
			Unfriend
		</Button>
	);
}
