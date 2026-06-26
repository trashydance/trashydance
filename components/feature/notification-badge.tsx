"use client";

import { CountBadge } from "./count-badge";

interface NotificationBadgeProps {
	count: number;
	className?: string;
	title?: string;
}

export function NotificationBadge({
	count,
	className,
	title,
}: NotificationBadgeProps) {
	if (count <= 0) return null;

	return (
		<CountBadge variant="accent" className={className} title={title}>
			{count > 99 ? "99+" : count}
		</CountBadge>
	);
}
