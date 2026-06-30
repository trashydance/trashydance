"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatRelativeTime } from "@/lib/utils";

export function useRelativeTime(
	createdAt: string | number | null | undefined,
): string {
	const { language } = useI18n();
	const [relativeTime, setRelativeTime] = useState(() =>
		createdAt ? formatRelativeTime(createdAt, language) : "",
	);

	useEffect(() => {
		if (!createdAt) {
			setRelativeTime("");
			return;
		}

		setRelativeTime(formatRelativeTime(createdAt, language));

		// Schedule a 30-second interval to update the relative time
		const intervalId = setInterval(() => {
			setRelativeTime(formatRelativeTime(createdAt, language));
		}, 30000);

		return () => clearInterval(intervalId);
	}, [createdAt, language]);

	return relativeTime;
}
