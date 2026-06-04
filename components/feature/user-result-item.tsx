"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getAvatarColor } from "@/lib/utils";
import { OnlineIndicator } from "./online-indicator";

interface UserResultItemProps {
	username: string | null;
	name: string;
	image: string | null;
	onClick: () => void;
	className?: string;
	actions?: ReactNode;
	showOnlineIndicator?: boolean;
	isOnline?: boolean;
}

export function UserResultItem({
	username,
	name,
	image,
	onClick,
	className,
	actions,
	showOnlineIndicator = false,
	isOnline = false,
}: UserResultItemProps) {
	const displayName = username || name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<div
			className={cn(
				"flex w-full items-center gap-4 rounded-base border-2 border-border bg-card p-4 shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
				className,
			)}
		>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80 transition-opacity"
			>
				<div className="relative shrink-0">
					<Avatar>
						{image && <AvatarImage src={image} alt={displayName} />}
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
						{name !== displayName ? name : displayName}
					</span>
					{username && (
						<p className="truncate text-xs text-muted-foreground">
							@{username}
						</p>
					)}
				</div>
			</button>
			{actions && <div className="shrink-0">{actions}</div>}
		</div>
	);
}
