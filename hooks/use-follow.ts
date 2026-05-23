"use client";

import { useCallback, useState } from "react";

export function useFollow(userId: string, initialIsFollowing: boolean) {
	const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
	const [isLoading, setIsLoading] = useState(false);

	const toggleFollow = useCallback(async () => {
		const previous = isFollowing;
		setIsFollowing(!previous);
		setIsLoading(true);

		try {
			const res = await fetch(`/api/users/${userId}/follow`, {
				method: previous ? "DELETE" : "POST",
			});
			if (!res.ok) {
				setIsFollowing(previous);
			}
		} catch {
			setIsFollowing(previous);
		} finally {
			setIsLoading(false);
		}
	}, [userId, isFollowing]);

	return { isFollowing, toggleFollow, isLoading };
}
