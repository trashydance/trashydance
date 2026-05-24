"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePresence } from "@/hooks/use-presence";
import type { FriendStatus } from "@/lib/types";
import { FriendRequestButton } from "./friend-request-button";
import { OnlineIndicator } from "./online-indicator";

interface ChatHeaderProps {
	partnerId: string;
	partnerUsername: string;
	partnerImage: string | null;
	friendStatus: FriendStatus;
	friendRequestId?: string;
}

export function ChatHeader({
	partnerId,
	partnerUsername,
	partnerImage,
	friendStatus: initialFriendStatus,
	friendRequestId,
}: ChatHeaderProps) {
	const initials = partnerUsername.slice(0, 2).toUpperCase();
	const [currentStatus, setCurrentStatus] = useState(initialFriendStatus);
	const isFriend = currentStatus === "friends";
	const presenceMap = usePresence(isFriend ? [partnerId] : []);
	const isOnline = isFriend && (presenceMap.get(partnerId) ?? false);
	const handleStatusChange = useCallback((s: FriendStatus) => {
		setCurrentStatus(s);
	}, []);

	return (
		<header className="flex items-center gap-3 border-b-2 border-foreground bg-card px-4 py-3 shadow-[0px_4px_0px_0px] shadow-foreground">
			<Button variant="ghost" size="icon-sm" asChild>
				<Link href="/home" aria-label="Back to chats">
					<ArrowLeft className="size-4" />
				</Link>
			</Button>
			<Link
				href={`/profile/${partnerUsername}`}
				className="flex items-center gap-2"
			>
				<div className="relative">
					<Avatar>
						{partnerImage && (
							<AvatarImage src={partnerImage} alt={partnerUsername} />
						)}
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					{isFriend && <OnlineIndicator online={isOnline} />}
				</div>
				<div className="flex flex-col">
					<span className="font-heading text-sm font-semibold">
						{partnerUsername}
					</span>
					{isFriend && (
						<span className="text-xs text-muted-foreground">
							{isOnline ? "online" : "offline"}
						</span>
					)}
				</div>
			</Link>
			<div className="ml-auto">
				<FriendRequestButton
					userId={partnerId}
					initialStatus={initialFriendStatus}
					requestId={friendRequestId}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</header>
	);
}
