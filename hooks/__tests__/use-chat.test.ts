import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocketEvent } from "@/lib/constants";
import type { Message } from "@/lib/types";

const h = vi.hoisted(() => ({
	useSocket: vi.fn(),
}));

vi.mock("@/hooks/use-socket", () => ({ useSocket: h.useSocket }));

import { useChat } from "@/hooks/use-chat";

type Listener = (data: unknown) => void;
type Ack = (res: { ok?: boolean; message?: Message; error?: string }) => void;

function createFakeSocket() {
	const listeners = new Map<string, Set<Listener>>();
	return {
		connected: true,
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

function msg(id: string, overrides: Partial<Message> = {}): Message {
	return {
		id,
		conversationId: "c1",
		senderId: "u1",
		body: `body-${id}`,
		createdAt: "2026-01-01T00:00:00.000Z",
		...overrides,
	};
}

let socket: ReturnType<typeof createFakeSocket>;
let fetchMock: ReturnType<typeof vi.fn>;
// Coda di risposte per le GET dei messaggi (caricamento iniziale + loadMore).
let getResponses: unknown[];
// Risposta per la POST di fallback HTTP a /messages.
let postMessageResponse: { ok: boolean; data?: unknown };

beforeEach(() => {
	socket = createFakeSocket();
	h.useSocket.mockReturnValue({
		socket,
		isConnected: true,
		disconnect: vi.fn(),
	});

	getResponses = [];
	postMessageResponse = { ok: true, data: {} };
	fetchMock = vi.fn(async (input: unknown, init?: RequestInit) => {
		const url = String(input);
		if (url.endsWith("/read")) {
			return { ok: true, json: async () => ({}) };
		}
		if (init?.method === "POST") {
			return {
				ok: postMessageResponse.ok,
				json: async () => postMessageResponse.data,
			};
		}
		const next = getResponses.shift() ?? { messages: [], hasMore: false };
		return { ok: true, json: async () => next };
	});
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

async function renderChat(conversationId = "c1") {
	const utils = renderHook(() => useChat(conversationId));
	await waitFor(() => expect(utils.result.current.isLoading).toBe(false));
	return utils;
}

// Recupera il callback di ack dell'ultima emit di MESSAGE_SEND.
function lastAck(): Ack {
	const call = socket.emit.mock.calls
		.filter((c) => c[0] === SocketEvent.MESSAGE_SEND)
		.at(-1);
	expect(call).toBeDefined();
	return call?.[2] as Ack;
}

describe("useChat", () => {
	it("carica i messaggi iniziali invertendo l'ordine e legge hasMore/cursor", async () => {
		getResponses.push({
			messages: [msg("m2"), msg("m1")],
			hasMore: true,
			nextCursor: "cur1",
		});

		const { result } = await renderChat();

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/conversations/c1/messages?limit=50",
		);
		expect(result.current.messages.map((m: Message) => m.id)).toEqual([
			"m1",
			"m2",
		]);
		expect(result.current.hasMore).toBe(true);
	});

	it("fallisce silenziosamente se il caricamento iniziale va in errore", async () => {
		fetchMock.mockRejectedValueOnce(new Error("network"));

		const { result } = await renderChat();

		expect(result.current.messages).toEqual([]);
	});

	it("aggiunge i messaggi in arrivo solo per la conversazione corrente", async () => {
		const { result } = await renderChat();

		act(() => {
			socket.fire(SocketEvent.MESSAGE_NEW, msg("m1"));
			socket.fire(
				SocketEvent.MESSAGE_NEW,
				msg("altro", { conversationId: "c2" }),
			);
		});

		expect(result.current.messages.map((m: Message) => m.id)).toEqual(["m1"]);
	});

	it("non duplica un messaggio in arrivo con id già presente", async () => {
		const { result } = await renderChat();

		act(() => {
			socket.fire(SocketEvent.MESSAGE_NEW, msg("m1"));
			socket.fire(SocketEvent.MESSAGE_NEW, msg("m1"));
		});

		expect(result.current.messages).toHaveLength(1);
	});

	it("loadMore usa il cursore e prepende i messaggi più vecchi", async () => {
		getResponses.push({
			messages: [msg("m2"), msg("m1")],
			hasMore: true,
			nextCursor: "cur1",
		});
		getResponses.push({ messages: [msg("m0")], hasMore: false });

		const { result } = await renderChat();

		await act(async () => {
			await result.current.loadMore();
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/conversations/c1/messages?limit=50&cursor=cur1",
		);
		expect(result.current.messages.map((m: Message) => m.id)).toEqual([
			"m0",
			"m1",
			"m2",
		]);
		expect(result.current.hasMore).toBe(false);
	});

	it("loadMore è un no-op quando hasMore è false", async () => {
		getResponses.push({ messages: [msg("m1")], hasMore: false });

		const { result } = await renderChat();

		await act(async () => {
			await result.current.loadMore();
		});

		// Solo la fetch del caricamento iniziale.
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("invia via socket: messaggio ottimistico, poi sostituito dall'ack ok", async () => {
		const { result } = await renderChat();

		await act(async () => {
			await result.current.sendMessage("ciao");
		});

		// Messaggio ottimistico in stato "sending".
		const optimistic = result.current.messages.at(-1);
		expect(optimistic?.id).toMatch(/^temp-/);
		expect(optimistic?.body).toBe("ciao");
		expect(optimistic?.status).toBe("sending");

		// Segna la conversazione come letta.
		expect(fetchMock).toHaveBeenCalledWith("/api/conversations/c1/read", {
			method: "POST",
		});
		expect(socket.emit).toHaveBeenCalledWith(
			SocketEvent.MESSAGE_SEND,
			{ conversationId: "c1", body: "ciao" },
			expect.any(Function),
		);

		act(() => {
			lastAck()({ ok: true, message: msg("srv1", { body: "ciao" }) });
		});

		const sent = result.current.messages.at(-1);
		expect(sent?.id).toBe("srv1");
		expect(sent?.status).toBe("sent");
	});

	it("marca il messaggio come errore se l'ack fallisce", async () => {
		const { result } = await renderChat();

		await act(async () => {
			await result.current.sendMessage("ciao");
		});
		act(() => {
			lastAck()({ ok: false, error: "boom" });
		});

		expect(result.current.messages.at(-1)?.status).toBe("error");
	});

	it("marca il messaggio come errore se l'ack non arriva entro il timeout", async () => {
		vi.useFakeTimers();
		const { result } = renderHook(() => useChat("c1"));
		// Flush del caricamento iniziale (solo microtask, niente timer).
		await act(async () => {
			await Promise.resolve();
		});

		await act(async () => {
			await result.current.sendMessage("ciao");
		});
		expect(result.current.messages.at(-1)?.status).toBe("sending");

		act(() => {
			vi.advanceTimersByTime(10_000);
		});

		expect(result.current.messages.at(-1)?.status).toBe("error");
	});

	it("usa il fallback HTTP quando il socket non è connesso", async () => {
		socket.connected = false;
		postMessageResponse = { ok: true, data: msg("srv2", { body: "ciao" }) };

		const { result } = await renderChat();

		await act(async () => {
			await result.current.sendMessage("ciao");
		});

		expect(socket.emit).not.toHaveBeenCalledWith(
			SocketEvent.MESSAGE_SEND,
			expect.anything(),
			expect.anything(),
		);
		expect(fetchMock).toHaveBeenCalledWith("/api/conversations/c1/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ conversationId: "c1", body: "ciao" }),
		});
		const sent = result.current.messages.at(-1);
		expect(sent?.id).toBe("srv2");
		expect(sent?.status).toBe("sent");
	});

	it("marca il messaggio come errore se il fallback HTTP fallisce", async () => {
		socket.connected = false;
		postMessageResponse = { ok: false };

		const { result } = await renderChat();

		await act(async () => {
			await result.current.sendMessage("ciao");
		});

		expect(result.current.messages.at(-1)?.status).toBe("error");
	});

	it("retryMessage rimuove il messaggio in errore e lo reinvia", async () => {
		const { result } = await renderChat();

		await act(async () => {
			await result.current.sendMessage("ciao");
		});
		act(() => {
			lastAck()({ ok: false });
		});
		const failedId = result.current.messages.at(-1)?.id as string;
		expect(result.current.messages.at(-1)?.status).toBe("error");

		await act(async () => {
			result.current.retryMessage(failedId);
		});

		const retried = result.current.messages.at(-1);
		expect(result.current.messages).toHaveLength(1);
		expect(retried?.id).not.toBe(failedId);
		expect(retried?.body).toBe("ciao");
		expect(retried?.status).toBe("sending");
		expect(
			socket.emit.mock.calls.filter((c) => c[0] === SocketEvent.MESSAGE_SEND),
		).toHaveLength(2);
	});

	it("rimuove il listener dei messaggi allo smontaggio", async () => {
		const { unmount } = await renderChat();
		unmount();

		expect(socket.off).toHaveBeenCalledWith(
			SocketEvent.MESSAGE_NEW,
			expect.any(Function),
		);
	});
});
