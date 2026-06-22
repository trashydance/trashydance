"use client";

import Link from "next/link";
import { RelativeTime } from "@/components/ui/relative-time";
import type { Conversation } from "@/lib/types";
import { cn, truncateText } from "@/lib/utils";
import { NotificationBadge } from "./notification-badge";
import { OnlineIndicator } from "./online-indicator";
import { UserAvatar } from "./user-avatar";

interface ChatListItemProps {
	conversation: Conversation & { unreadCount?: number };
	isOnline?: boolean;
	showOnlineIndicator?: boolean;
	/** For friends without a conversation yet (id ""): start the chat on click */
	onStartChat?: () => void;
}

const itemClassName =
	"relative flex w-full items-center gap-4 rounded-base border-2 border-border bg-card p-4 text-left transition-all hover:brutal-lift-hover";

export function ChatListItem({
	conversation,
	isOnline = false,
	showOnlineIndicator = false,
	onStartChat,
}: ChatListItemProps) {
	const { partner, lastMessage } = conversation;
	const unread = conversation.unreadCount ?? 0;
	const displayName = partner.name || partner.username || "?";

	const content = (
		<>
			<div className="relative shrink-0">
				<UserAvatar
					name={partner.name}
					username={partner.username}
					image={partner.image}
				/>
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
					<RelativeTime
						createdAt={lastMessage.createdAt}
						className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
					/>
				)}
				{unread > 0 && <NotificationBadge count={unread} />}
			</div>
		</>
	);

	// Friend without a conversation yet: clicking creates the chat
	if (!conversation.id && onStartChat) {
		return (
			<button type="button" onClick={onStartChat} className={cn(itemClassName)}>
				{content}
			</button>
		);
	}

	return (
		<Link href={`/chat/${conversation.id}`} className={cn(itemClassName)}>
			{content}
		</Link>
	);
}
