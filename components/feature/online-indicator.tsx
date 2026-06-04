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
				"absolute -bottom-1 -left-1 z-10 size-3 rounded-full border-2 border-border",
				online ? "bg-[#2ecc40]" : "bg-muted-foreground",
				className,
			)}
		/>
	);
}
