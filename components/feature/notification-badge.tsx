"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
	count: number;
	className?: string;
}

export function NotificationBadge({
	count,
	className,
}: NotificationBadgeProps) {
	if (count <= 0) return null;

	return (
		<span
			className={cn(
				"inline-flex h-[26px] min-w-[26px] items-center justify-center rounded-none border-2 border-border bg-accent px-1.5 text-sm font-bold text-accent-foreground",
				className,
			)}
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}
