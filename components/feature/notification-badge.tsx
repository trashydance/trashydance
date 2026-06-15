"use client";

import { CountBadge } from "./count-badge";

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
		<CountBadge variant="accent" className={className}>
			{count > 99 ? "99+" : count}
		</CountBadge>
	);
}
