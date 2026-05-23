"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/lib/types";
import { cn, formatRelativeTime, truncateText } from "@/lib/utils";
import { OnlineIndicator } from "./online-indicator";

interface ChatListItemProps {
	conversation: Conversation;
	isOnline?: boolean;
	showOnlineIndicator?: boolean;
}

export function ChatListItem({
	conversation,
	isOnline = false,
	showOnlineIndicator = false,
}: ChatListItemProps) {
	const { partner, lastMessage } = conversation;
	const initials = partner.username.slice(0, 2).toUpperCase();

	return (
		<Link
			href={`/chat/${conversation.id}`}
			className={cn(
				"flex items-center gap-3 rounded-md border-2 border-foreground bg-card p-3 shadow-[4px_4px_0px_0px] shadow-foreground transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
			)}
		>
			<div className="relative shrink-0">
				<Avatar>
					{partner.image && (
						<AvatarImage src={partner.image} alt={partner.username} />
					)}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				{showOnlineIndicator && <OnlineIndicator online={isOnline} />}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<span className="font-heading text-sm font-semibold truncate">
						{partner.username}
					</span>
					{lastMessage && (
						<span className="shrink-0 text-xs text-muted-foreground">
							{formatRelativeTime(lastMessage.createdAt)}
						</span>
					)}
				</div>
				{lastMessage && (
					<p className="truncate text-xs text-muted-foreground">
						{truncateText(lastMessage.body, 60)}
					</p>
				)}
			</div>
		</Link>
	);
}
