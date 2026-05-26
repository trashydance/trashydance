"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserResultItemProps {
	username: string | null;
	name: string;
	image: string | null;
	onClick: () => void;
	className?: string;
	actions?: ReactNode;
}

export function UserResultItem({
	username,
	name,
	image,
	onClick,
	className,
	actions,
}: UserResultItemProps) {
	const displayName = username || name;
	const initials = displayName.slice(0, 2).toUpperCase();

	return (
		<div
			className={cn(
				"flex w-full items-center gap-3 rounded-md border-2 border-border bg-background p-3 shadow-[4px_4px_0px_0px] shadow-border transition-all",
				className,
			)}
		>
			<button
				type="button"
				onClick={onClick}
				className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80 transition-opacity"
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
			</button>
			{actions && <div className="shrink-0">{actions}</div>}
		</div>
	);
}
