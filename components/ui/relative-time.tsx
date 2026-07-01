"use client";

import { useRelativeTime } from "@/hooks/use-relative-time";

interface RelativeTimeProps {
	createdAt: string | number | null | undefined;
	className?: string;
}

export function RelativeTime({ createdAt, className }: RelativeTimeProps) {
	const relativeTime = useRelativeTime(createdAt);
	return (
		<span className={className} suppressHydrationWarning>
			{relativeTime}
		</span>
	);
}
