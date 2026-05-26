"use client";

import { useCallback, useState } from "react";

interface ApiActionState {
	isLoading: boolean;
	error: string | null;
}

export function useApiAction() {
	const [state, setState] = useState<ApiActionState>({
		isLoading: false,
		error: null,
	});

	const execute = useCallback(
		async <T = unknown>(
			url: string,
			options?: RequestInit,
		): Promise<{ data: T | null; ok: boolean }> => {
			setState({ isLoading: true, error: null });
			try {
				const res = await fetch(url, options);
				if (res.ok) {
					const data = (await res.json()) as T;
					setState({ isLoading: false, error: null });
					return { data, ok: true };
				}
				const err = await res.json().catch(() => ({ error: "Request failed" }));
				setState({ isLoading: false, error: err.error ?? "Request failed" });
				return { data: null, ok: false };
			} catch {
				setState({ isLoading: false, error: "Network error" });
				return { data: null, ok: false };
			}
		},
		[],
	);

	return { execute, ...state };
}
