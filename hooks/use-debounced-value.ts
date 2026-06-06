"use client";

import { useEffect, useState } from "react";

/**
 * Restituisce `value` ritardato di `delayMs`: si aggiorna solo quando il
 * valore resta stabile per l'intervallo indicato.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delayMs);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delayMs]);

	return debouncedValue;
}
