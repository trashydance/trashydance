import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useDebouncedValue", () => {
	it("restituisce subito il valore iniziale", () => {
		const { result } = renderHook(() => useDebouncedValue("iniziale", 300));
		expect(result.current).toBe("iniziale");
	});

	it("aggiorna il valore solo dopo il delay", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "b" });
		expect(result.current).toBe("a");

		act(() => {
			vi.advanceTimersByTime(299);
		});
		expect(result.current).toBe("a");

		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(result.current).toBe("b");
	});

	it("riavvia il timer se il valore cambia prima della scadenza", () => {
		const { result, rerender } = renderHook(
			({ value }: { value: string }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "b" });
		act(() => {
			vi.advanceTimersByTime(200);
		});

		// Nuovo cambio prima della scadenza: il timer riparte da zero.
		rerender({ value: "c" });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe("a");

		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current).toBe("c");
	});
});
