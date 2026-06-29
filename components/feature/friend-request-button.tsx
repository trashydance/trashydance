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
				Add Friend
			</Button>
		);
	}

	if (friendStatus === "pending_sent") {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={() => {
					if (window.confirm("Do you want to withdraw this friend request?")) {
						cancelRequest();
					}
				}}
				disabled={isLoading}
				className={cn(
					"group transition-all duration-200 hover:border-destructive hover:text-destructive hover:bg-destructive/10",
					!textOnly && "opacity-70 hover:opacity-100",
					className,
				)}
				title={textOnly ? undefined : "Friend request sent — click to cancel"}
				aria-label={
					textOnly
						? "Cancel friend request"
						: "Friend request sent. Click to cancel"
				}
			>
				{!textOnly && (
					<>
						<Clock className="size-4 group-hover:hidden" />
						<X className="size-4 hidden group-hover:inline text-destructive" />
					</>
				)}
				{textOnly ? (
					"Cancel"
				) : (
					<>
						<span className="group-hover:hidden">Pending</span>
						<span className="hidden group-hover:inline">Cancel</span>
					</>
				)}
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
					title="Accept friend request"
					aria-label="Accept friend request"
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
					title="Reject friend request"
					aria-label="Reject friend request"
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
			Unfriend
		</Button>
	);
}
