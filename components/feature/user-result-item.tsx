"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { FriendStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserResultItemProps {
	username: string | null;
	name: string;
	image: string | null;
	friendStatus?: FriendStatus;
	onClick: () => void;
	className?: string;
}

export function UserResultItem({
	username,
	name,
	image,
	friendStatus,
	onClick,
	className,
}: UserResultItemProps) {
	const displayName = username || name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-3 rounded-md border-2 border-foreground bg-card p-3 text-left shadow-[4px_4px_0px_0px] shadow-foreground transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
				className,
			)}
		>
			<Avatar>
				{image && <AvatarImage src={image} alt={displayName} />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<span className="font-heading text-sm font-semibold">
					{displayName}
				</span>
				{name !== displayName && (
					<p className="truncate text-xs text-muted-foreground">{name}</p>
				)}
			</div>
			{friendStatus === "friends" && <Badge variant="secondary">Friend</Badge>}
			{(friendStatus === "pending_sent" ||
				friendStatus === "pending_received") && (
				<Badge variant="outline">Pending</Badge>
			)}
		</button>
	);
}
