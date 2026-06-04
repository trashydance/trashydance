import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSearch } from "@/hooks/use-search";
import { DEBOUNCE_MS } from "@/lib/constants";

const fetchMock = vi.fn();

beforeEach(() => {
	vi.useFakeTimers();
	vi.stubGlobal("fetch", fetchMock);
	fetchMock.mockReset();
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

function okResponse(payload: unknown) {
	return { ok: true, json: async () => payload };
}

/** Fa scadere il debounce e attende il completamento della fetch. */
async function flushDebounce() {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
	});
}

describe("useSearch", () => {
	it("parte senza risultati e senza chiamate di rete", async () => {
		const { result } = renderHook(() => useSearch());

		await flushDebounce();

		expect(result.current.results).toEqual([]);
		expect(result.current.isLoading).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("esegue la ricerca dopo il debounce e assegna il friendStatus", async () => {
		fetchMock.mockResolvedValue(
			okResponse({
				friends: [{ id: "u1", username: "alice", name: "Alice", image: null }],
				others: [{ id: "u2", username: "bob", name: "Bob", image: null }],
			}),
		);
		const { result } = renderHook(() => useSearch());

		act(() => {
			result.current.setQuery("ali");
		});
		expect(fetchMock).not.toHaveBeenCalled();

		await flushDebounce();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/users/search?q=ali",
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
		expect(result.current.results).toEqual([
			expect.objectContaining({ id: "u1", friendStatus: "friends" }),
			expect.objectContaining({ id: "u2", friendStatus: "none" }),
		]);
		expect(result.current.isLoading).toBe(false);
	});

	it("non esegue fetch per query di soli spazi e azzera i risultati", async () => {
		fetchMock.mockResolvedValue(
			okResponse({
				friends: [{ id: "u1", username: "alice", name: "Alice", image: null }],
				others: [],
			}),
		);
		const { result } = renderHook(() => useSearch());

		act(() => {
			result.current.setQuery("ali");
		});
		await flushDebounce();
		expect(result.current.results).toHaveLength(1);

		act(() => {
			result.current.setQuery("   ");
		});
		await flushDebounce();

		expect(result.current.results).toEqual([]);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("lascia i risultati invariati su risposta non ok", async () => {
		fetchMock.mockResolvedValue({ ok: false });
		const { result } = renderHook(() => useSearch());

		act(() => {
			result.current.setQuery("ali");
		});
		await flushDebounce();

		expect(result.current.results).toEqual([]);
		expect(result.current.isLoading).toBe(false);
	});
});
