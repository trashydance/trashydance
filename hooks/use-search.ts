"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FriendStatus, User } from "@/lib/types";

interface SearchResult extends User {
	friendStatus: FriendStatus;
}

export function useSearch() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchResults = useCallback(async (searchQuery: string) => {
		if (abortRef.current) {
			abortRef.current.abort();
		}

		if (!searchQuery.trim()) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);

		try {
			const res = await fetch(
				`/api/users/search?q=${encodeURIComponent(searchQuery)}`,
				{ signal: controller.signal },
			);
			if (res.ok) {
				const data = await res.json();
				const friends = (data.friends ?? data.following ?? []).map(
					(u: User) => ({
						...u,
						friendStatus: "friends" as FriendStatus,
					}),
				);
				const others = (data.others ?? data.notFollowing ?? []).map(
					(u: User) => ({
						...u,
						friendStatus: "none" as FriendStatus,
					}),
				);
				setResults([...friends, ...others]);
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") {
				return;
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = setTimeout(() => {
			fetchResults(query);
		}, 300);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [query, fetchResults]);

	return { query, setQuery, results, isLoading };
}
