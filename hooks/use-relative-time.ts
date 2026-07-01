"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

export function useRelativeTime(
	createdAt: string | number | null | undefined,
): string {
	const [relativeTime, setRelativeTime] = useState(() =>
		createdAt ? formatRelativeTime(createdAt) : "",
	);

	useEffect(() => {
		if (!createdAt) {
			setRelativeTime("");
			return;
		}

		setRelativeTime(formatRelativeTime(createdAt));

		// Schedule a 30-second interval to update the relative time
		const intervalId = setInterval(() => {
			setRelativeTime(formatRelativeTime(createdAt));
		}, 30000);

		return () => clearInterval(intervalId);
	}, [createdAt]);

	return relativeTime;
}
