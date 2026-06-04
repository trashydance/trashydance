import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
	io: vi.fn(),
}));

vi.mock("socket.io-client", () => ({ io: h.io }));

type Listener = (...args: unknown[]) => void;

function createFakeSocket() {
	const listeners = new Map<string, Set<Listener>>();
	return {
		connected: false,
		on: vi.fn((event: string, cb: Listener) => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)?.add(cb);
		}),
		off: vi.fn((event: string, cb: Listener) => {
			listeners.get(event)?.delete(cb);
		}),
		connect: vi.fn(),
		disconnect: vi.fn(),
		fire(event: string) {
			for (const cb of listeners.get(event) ?? new Set<Listener>()) {
				cb();
			}
		},
	};
}

let fakeSocket: ReturnType<typeof createFakeSocket>;

// Il singleton `globalSocket` vive a livello di modulo: ogni test reimporta
// l'hook con vi.resetModules() per partire da uno stato pulito.
async function importUseSocket() {
	const mod = await import("@/hooks/use-socket");
	return mod.useSocket;
}

beforeEach(() => {
	vi.resetModules();
	fakeSocket = createFakeSocket();
	h.io.mockReset();
	h.io.mockReturnValue(fakeSocket);
});

describe("useSocket", () => {
	it("crea il socket con le opzioni attese e avvia la connessione", async () => {
		const useSocket = await importUseSocket();
		const { result } = renderHook(() => useSocket());

		expect(h.io).toHaveBeenCalledTimes(1);
		expect(h.io).toHaveBeenCalledWith(
			expect.objectContaining({
				path: "/socket.io",
				withCredentials: true,
				autoConnect: true,
			}),
		);
		expect(fakeSocket.connect).toHaveBeenCalledTimes(1);
		expect(result.current.isConnected).toBe(false);
	});

	it("aggiorna isConnected sugli eventi connect/disconnect", async () => {
		const useSocket = await importUseSocket();
		const { result } = renderHook(() => useSocket());

		act(() => {
			fakeSocket.fire("connect");
		});
		expect(result.current.isConnected).toBe(true);

		act(() => {
			fakeSocket.fire("disconnect");
		});
		expect(result.current.isConnected).toBe(false);
	});

	it("è subito connesso se il socket condiviso lo è già", async () => {
		const useSocket = await importUseSocket();
		fakeSocket.connected = true;

		const { result } = renderHook(() => useSocket());

		expect(result.current.isConnected).toBe(true);
		expect(fakeSocket.connect).not.toHaveBeenCalled();
	});

	it("riusa lo stesso socket tra mount multipli (singleton)", async () => {
		const useSocket = await importUseSocket();

		const first = renderHook(() => useSocket());
		first.unmount();
		renderHook(() => useSocket());

		expect(h.io).toHaveBeenCalledTimes(1);
	});

	it("lo smontaggio rimuove i listener ma NON distrugge il singleton", async () => {
		const useSocket = await importUseSocket();
		const { unmount } = renderHook(() => useSocket());

		unmount();

		expect(fakeSocket.off).toHaveBeenCalledWith(
			"connect",
			expect.any(Function),
		);
		expect(fakeSocket.off).toHaveBeenCalledWith(
			"disconnect",
			expect.any(Function),
		);
		expect(fakeSocket.disconnect).not.toHaveBeenCalled();
	});

	it("disconnect() esplicito chiude il socket e azzera il singleton", async () => {
		const useSocket = await importUseSocket();
		const { result } = renderHook(() => useSocket());

		act(() => {
			result.current.disconnect();
		});

		expect(fakeSocket.disconnect).toHaveBeenCalledTimes(1);
		expect(result.current.isConnected).toBe(false);
		expect(result.current.socket).toBeNull();

		// Il mount successivo deve creare un socket nuovo.
		renderHook(() => useSocket());
		expect(h.io).toHaveBeenCalledTimes(2);
	});
});
