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
	/** Text-only style (no icons, "Cancel" for pending requests), used on the search page */
	textOnly?: boolean;
}

export function FriendRequestButton({
	userId,
	initialStatus,
	requestId: initialRequestId,
	className,
	onStatusChange,
	textOnly = false,
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
				{!textOnly && <UserPlus className="size-4" />}
				Follow
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
				className={cn(!textOnly && "opacity-70", className)}
				title={textOnly ? undefined : "Request sent — click to cancel"}
				aria-label={textOnly ? "Cancel request" : "Request sent. Click to cancel"}
			>
				{!textOnly && <Clock className="size-4" />}
				{textOnly ? "Cancel" : "Pending"}
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
					{!textOnly && <Check className="size-4" />}
					Accept
				</Button>
				<Button
					variant="destructive"
					size="sm"
					onClick={rejectRequest}
					disabled={isLoading}
					className="bg-accent text-accent-foreground"
				>
					{!textOnly && <X className="size-4" />}
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
			{!textOnly && <UserMinus className="size-4" />}
			Unfollow
		</Button>
	);
}
