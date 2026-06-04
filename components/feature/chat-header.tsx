"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePresence } from "@/hooks/use-presence";
import type { FriendStatus } from "@/lib/types";
import { getAvatarColor } from "@/lib/utils";
import { FriendRequestButton } from "./friend-request-button";
import { OnlineIndicator } from "./online-indicator";

interface ChatHeaderProps {
	partnerId: string;
	partnerUsername: string;
	partnerName?: string;
	partnerImage: string | null;
	friendStatus: FriendStatus;
	friendRequestId?: string;
}

export function ChatHeader({
	partnerId,
	partnerUsername,
	partnerName,
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
		<header className="flex items-center gap-3 border-b-4 border-border bg-background px-4 py-3">
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
						<AvatarFallback
							style={{ backgroundColor: getAvatarColor(partnerUsername) }}
						>
							{initials}
						</AvatarFallback>
					</Avatar>
					{isFriend && <OnlineIndicator online={isOnline} />}
				</div>
				<div className="flex flex-col">
					<span className="text-sm font-bold uppercase tracking-wide">
						{partnerName || partnerUsername}
					</span>
					{isFriend && (
						<span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							<span
								className={
									isOnline
										? "size-1.5 rounded-full bg-[#2ecc40]"
										: "size-1.5 rounded-full bg-muted-foreground"
								}
							/>
							{isOnline ? "Online" : "Offline"}
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
