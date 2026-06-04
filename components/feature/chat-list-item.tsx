"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "@/lib/types";
import {
	cn,
	formatRelativeTime,
	getAvatarColor,
	truncateText,
} from "@/lib/utils";
import { NotificationBadge } from "./notification-badge";
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
	const displayName = partner.name || partner.username;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<Link
			href={`/chat/${conversation.id}`}
			className={cn(
				"relative flex items-center gap-4 rounded-base border-4 border-border bg-card p-4 shadow-shadow transition-all hover:brutal-press-hover",
			)}
		>
			<div className="relative shrink-0">
				<Avatar>
					{partner.image && (
						<AvatarImage src={partner.image} alt={displayName} />
					)}
					<AvatarFallback
						style={{ backgroundColor: getAvatarColor(displayName) }}
					>
						{initials}
					</AvatarFallback>
				</Avatar>
				{showOnlineIndicator && <OnlineIndicator online={isOnline} />}
			</div>
			<div className="min-w-0 flex-1">
				<span className="block truncate text-sm font-bold uppercase tracking-wide">
					{displayName}
				</span>
				{lastMessage && (
					<p className="truncate text-sm text-muted-foreground">
						{truncateText(lastMessage.body, 60)}
					</p>
				)}
			</div>
			<div className="flex shrink-0 flex-col items-end gap-1 self-start">
				{lastMessage && (
					<span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
						{formatRelativeTime(lastMessage.createdAt)}
					</span>
				)}
				{unread > 0 && <NotificationBadge count={unread} />}
			</div>
		</Link>
	);
}
