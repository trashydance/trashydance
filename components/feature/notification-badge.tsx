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
				"inline-flex size-4 items-center justify-center rounded-none bg-accent text-[10px] font-bold text-accent-foreground",
				className,
			)}
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}
