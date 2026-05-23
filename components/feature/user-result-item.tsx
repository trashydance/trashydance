"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserResultItemProps {
	username: string;
	name: string;
	image: string | null;
	isFollowing: boolean;
	onClick: () => void;
	className?: string;
}

export function UserResultItem({
	username,
	name,
	image,
	isFollowing,
	onClick,
	className,
}: UserResultItemProps) {
	const initials = username.slice(0, 2).toUpperCase();

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
				{image && <AvatarImage src={image} alt={username} />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<span className="font-heading text-sm font-semibold">{username}</span>
				{name !== username && (
					<p className="truncate text-xs text-muted-foreground">{name}</p>
				)}
			</div>
			{isFollowing && <Badge variant="secondary">Following</Badge>}
		</button>
	);
}
