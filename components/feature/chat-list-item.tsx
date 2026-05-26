"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/lib/types";
import { cn, formatRelativeTime, truncateText } from "@/lib/utils";
import { OnlineIndicator } from "./online-indicator";

interface ChatListItemProps {
	conversation: Conversation & { unreadCount?: number };
	isOnline?: boolean;
	showOnlineIndicator?: boolean;
}

export function ChatListItem({
	conversation,
	isOnline = false,
	showOnlineIndicator = false,
}: ChatListItemProps) {
	const { partner, lastMessage } = conversation;
	const unread = conversation.unreadCount ?? 0;
	const displayName = partner.username || partner.name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<Link
			href={`/chat/${conversation.id}`}
			className={cn(
				"relative flex items-center gap-3 rounded-md border-2 border-border bg-background p-3 shadow-[4px_4px_0px_0px] shadow-border transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
			)}
		>
			{unread > 0 && (
				<span className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full border-2 border-background bg-sky-500 text-[10px] font-bold text-white">
					{unread > 99 ? "99+" : unread}
				</span>
			)}
			<div className="relative shrink-0">
				<Avatar>
					{partner.image && (
						<AvatarImage src={partner.image} alt={displayName} />
					)}
					<AvatarFallback>{initials}</AvatarFallback>
				</Avatar>
				{showOnlineIndicator && <OnlineIndicator online={isOnline} />}
			</div>
			<div className="min-w-0 flex-1">
				<span className="font-heading text-sm font-semibold truncate block">
					{displayName}
				</span>
				{lastMessage && (
					<p className="truncate text-xs text-muted-foreground">
						{truncateText(lastMessage.body, 60)}
					</p>
				)}
			</div>
			{lastMessage && (
				<span className="shrink-0 self-end text-xs text-muted-foreground whitespace-nowrap">
					{formatRelativeTime(lastMessage.createdAt)}
				</span>
			)}
		</Link>
	);
}
