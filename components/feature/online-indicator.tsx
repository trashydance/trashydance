"use client";

import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
	online: boolean;
	className?: string;
}

export function OnlineIndicator({ online, className }: OnlineIndicatorProps) {
	return (
		<span
			role="status"
			aria-label={online ? "Online" : "Offline"}
			className={cn(
				"absolute right-0 bottom-0 z-10 size-3 rounded-full border-2 border-background",
				online ? "bg-green-500" : "bg-muted-foreground/40",
				className,
			)}
		/>
	);
}
