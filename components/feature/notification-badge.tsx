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
				"inline-flex size-5 items-center justify-center rounded-full border-2 border-foreground bg-destructive text-[10px] font-bold text-white shadow-[2px_2px_0px_0px] shadow-foreground",
				className,
			)}
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}
