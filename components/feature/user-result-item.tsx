"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OnlineIndicator } from "./online-indicator";
import { UserAvatar } from "./user-avatar";

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

	return (
		<div
			className={cn(
				"flex w-full items-center gap-4 rounded-base border-4 border-border bg-card p-4 shadow-shadow transition-all hover:brutal-press-hover",
				className,
			)}
		>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80 transition-opacity"
			>
				<div className="relative shrink-0">
					<UserAvatar name={displayName} image={image} />
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
