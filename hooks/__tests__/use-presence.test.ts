import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocketEvent } from "@/lib/constants";

const h = vi.hoisted(() => ({
	useSocket: vi.fn(),
}));

vi.mock("@/hooks/use-socket", () => ({ useSocket: h.useSocket }));

import { usePresence } from "@/hooks/use-presence";

type Listener = (data: unknown) => void;

function createFakeSocket() {
	const listeners = new Map<string, Set<Listener>>();
	return {
		on: vi.fn((event: string, cb: Listener) => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)?.add(cb);
		}),
		off: vi.fn((event: string, cb: Listener) => {
			listeners.get(event)?.delete(cb);
		}),
		emit: vi.fn(),
		fire(event: string, data: unknown) {
			for (const cb of listeners.get(event) ?? new Set<Listener>()) {
				cb(data);
			}
		},
	};
}

let socket: ReturnType<typeof createFakeSocket>;

beforeEach(() => {
	socket = createFakeSocket();
	h.useSocket.mockReturnValue({
		socket,
		isConnected: true,
		disconnect: vi.fn(),
	});
});

describe("usePresence", () => {
	it("si sottoscrive alla presence degli utenti indicati", () => {
		renderHook(() => usePresence(["u1", "u2"]));

		expect(socket.emit).toHaveBeenCalledWith(SocketEvent.PRESENCE_SUBSCRIBE, {
			userIds: ["u1", "u2"],
		});
	});

	it("non si sottoscrive se la lista è vuota o il socket non è connesso", () => {
		const { unmount } = renderHook(() => usePresence([]));
		expect(socket.emit).not.toHaveBeenCalled();
		unmount();

		h.useSocket.mockReturnValue({
			socket,
			isConnected: false,
			disconnect: vi.fn(),
		});
		renderHook(() => usePresence(["u1"]));
		expect(socket.emit).not.toHaveBeenCalled();
	});

	it("popola la mappa dallo snapshot iniziale", () => {
		const { result } = renderHook(() => usePresence(["u1", "u2"]));

		act(() => {
			socket.fire(SocketEvent.PRESENCE_SNAPSHOT, {
				u1: "online",
				u2: "offline",
			});
		});

		expect(result.current.get("u1")).toBe(true);
		expect(result.current.get("u2")).toBe(false);
	});

	it("aggiorna la mappa sugli eventi di presence:update", () => {
		const { result } = renderHook(() => usePresence(["u1"]));

		act(() => {
			socket.fire(SocketEvent.PRESENCE_UPDATE, {
				userId: "u1",
				status: "online",
			});
		});
		expect(result.current.get("u1")).toBe(true);

		act(() => {
			socket.fire(SocketEvent.PRESENCE_UPDATE, {
				userId: "u1",
				status: "offline",
			});
		});
		expect(result.current.get("u1")).toBe(false);
	});

	it("non si risottoscrive se cambia solo il riferimento dell'array", () => {
		const { rerender } = renderHook(({ ids }: { ids: string[] }) => usePresence(ids), {
			initialProps: { ids: ["u1", "u2"] },
		});

		// Stesso contenuto (anche in ordine diverso), nuovo riferimento.
		rerender({ ids: ["u2", "u1"] });

		expect(socket.emit).toHaveBeenCalledTimes(1);
	});

	it("rimuove i listener allo smontaggio", () => {
		const { unmount } = renderHook(() => usePresence(["u1"]));
		unmount();

		expect(socket.off).toHaveBeenCalledWith(
			SocketEvent.PRESENCE_SNAPSHOT,
			expect.any(Function),
		);
		expect(socket.off).toHaveBeenCalledWith(
			SocketEvent.PRESENCE_UPDATE,
			expect.any(Function),
		);
	});
});
