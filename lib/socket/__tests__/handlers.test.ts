import type { Socket, Server as SocketIOServer } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocketEvent } from "@/lib/constants";

// Mock di tutte le dipendenze con side effect (db, helper, presence, emit):
// i test esercitano solo la logica di orchestrazione di handlers.ts.
const h = vi.hoisted(() => ({
	rateLimit: vi.fn(),
	findConversationForParticipant: vi.fn(),
	createAndDispatchMessage: vi.fn(),
	getFriendIds: vi.fn(),
	emitToUser: vi.fn(),
	socketAuthMiddleware: vi.fn(),
	addSocket: vi.fn(),
	removeSocket: vi.fn(),
	getOnlineUsers: vi.fn(),
	dbUpdate: vi.fn(),
	dbSet: vi.fn(),
	dbWhere: vi.fn(),
	dbRun: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: h.rateLimit }));
vi.mock("@/lib/conversation-helpers", () => ({
	findConversationForParticipant: h.findConversationForParticipant,
	createAndDispatchMessage: h.createAndDispatchMessage,
}));
vi.mock("@/lib/friend-helpers", () => ({ getFriendIds: h.getFriendIds }));
vi.mock("@/lib/socket/emit", () => ({ emitToUser: h.emitToUser }));
vi.mock("@/lib/socket/auth", () => ({
	socketAuthMiddleware: h.socketAuthMiddleware,
}));
vi.mock("@/lib/socket/presence", () => ({
	presence: {
		addSocket: h.addSocket,
		removeSocket: h.removeSocket,
		getOnlineUsers: h.getOnlineUsers,
	},
}));
vi.mock("@/lib/db", () => ({ default: { update: h.dbUpdate } }));

import { setupSocketHandlers } from "@/lib/socket/handlers";

type Listener = (...args: unknown[]) => unknown;

function createIo() {
	let connectionHandler: Listener = () => {};
	const io = {
		use: vi.fn(),
		on: vi.fn((event: string, cb: Listener) => {
			if (event === "connection") connectionHandler = cb;
		}),
	};
	return {
		io: io as unknown as SocketIOServer,
		useMock: io.use,
		connect: (socket: unknown) => connectionHandler(socket),
	};
}

function createSocket(userId: string, id = "socket-1") {
	const listeners = new Map<string, Listener>();
	const socket = {
		id,
		data: { userId },
		on: (event: string, cb: Listener) => {
			listeners.set(event, cb);
		},
		emit: vi.fn(),
	};
	return {
		socket: socket as unknown as Socket,
		emitMock: socket.emit,
		listeners,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	// Default: rate limit ok, nessun amico, socket non prima/non ultima.
	h.rateLimit.mockReturnValue(true);
	h.getFriendIds.mockReturnValue([]);
	h.addSocket.mockReturnValue(false);
	h.removeSocket.mockReturnValue(false);
	h.getOnlineUsers.mockReturnValue([]);
	h.dbUpdate.mockReturnValue({ set: h.dbSet });
	h.dbSet.mockReturnValue({ where: h.dbWhere });
	h.dbWhere.mockReturnValue({ run: h.dbRun });
});

describe("setupSocketHandlers", () => {
	it("registra il middleware di autenticazione", () => {
		const { io, useMock } = createIo();
		setupSocketHandlers(io);
		expect(useMock).toHaveBeenCalledWith(h.socketAuthMiddleware);
	});
});

describe("connection", () => {
	it("annuncia 'online' agli amici solo alla prima socket dell'utente", () => {
		const { io, connect } = createIo();
		setupSocketHandlers(io);
		h.addSocket.mockReturnValue(true);
		h.getFriendIds.mockReturnValue(["friend-1", "friend-2"]);

		connect(createSocket("user-1").socket);

		expect(h.addSocket).toHaveBeenCalledWith("user-1", "socket-1");
		expect(h.emitToUser).toHaveBeenCalledTimes(2);
		expect(h.emitToUser).toHaveBeenCalledWith(
			io,
			"friend-1",
			SocketEvent.PRESENCE_UPDATE,
			{ userId: "user-1", status: "online" },
		);
		expect(h.emitToUser).toHaveBeenCalledWith(
			io,
			"friend-2",
			SocketEvent.PRESENCE_UPDATE,
			{ userId: "user-1", status: "online" },
		);
	});

	it("non annuncia nulla per le socket successive dello stesso utente", () => {
		const { io, connect } = createIo();
		setupSocketHandlers(io);
		h.addSocket.mockReturnValue(false);

		connect(createSocket("user-1", "socket-2").socket);

		expect(h.emitToUser).not.toHaveBeenCalled();
	});
});

describe("message:send", () => {
	function connectAndGetHandler() {
		const { io, connect } = createIo();
		setupSocketHandlers(io);
		const { socket, listeners } = createSocket("user-1");
		connect(socket);
		const handler = listeners.get(SocketEvent.MESSAGE_SEND);
		if (!handler) throw new Error("handler message:send non registrato");
		return { io, handler };
	}

	it("risponde con errore quando il rate limit è superato", async () => {
		const { handler } = connectAndGetHandler();
		h.rateLimit.mockReturnValue(false);
		const ack = vi.fn();

		await handler({ conversationId: "conv-1", body: "ciao" }, ack);

		expect(ack).toHaveBeenCalledWith({
			error: "Too many messages. Please slow down.",
		});
		expect(h.createAndDispatchMessage).not.toHaveBeenCalled();
	});

	it("rifiuta un payload non valido (né testo né file)", async () => {
		const { handler } = connectAndGetHandler();
		const ack = vi.fn();

		await handler({ conversationId: "conv-1", body: "   " }, ack);

		expect(ack).toHaveBeenCalledWith({ error: "Invalid message" });
	});

	it("richiede il conversationId", async () => {
		const { handler } = connectAndGetHandler();
		const ack = vi.fn();

		await handler({ body: "ciao" }, ack);

		expect(ack).toHaveBeenCalledWith({ error: "conversationId is required" });
	});

	it("rifiuta se la conversazione non esiste o l'utente non vi partecipa", async () => {
		const { handler } = connectAndGetHandler();
		h.findConversationForParticipant.mockReturnValue(undefined);
		const ack = vi.fn();

		await handler({ conversationId: "conv-1", body: "ciao" }, ack);

		expect(h.findConversationForParticipant).toHaveBeenCalledWith(
			"conv-1",
			"user-1",
		);
		expect(ack).toHaveBeenCalledWith({ error: "Conversation not found" });
	});

	it("rifiuta un fileUrl che appartiene a un'altra conversazione", async () => {
		const { handler } = connectAndGetHandler();
		h.findConversationForParticipant.mockReturnValue({
			id: "conv-1",
			userAId: "user-1",
			userBId: "user-2",
		});
		const ack = vi.fn();

		await handler(
			{
				conversationId: "conv-1",
				fileName: "foto.png",
				fileUrl: "/api/uploads/conv-OTHER/foto.png",
				fileType: "image/png",
				fileSize: 100,
			},
			ack,
		);

		expect(ack).toHaveBeenCalledWith({
			error: "fileUrl does not belong to this conversation",
		});
		expect(h.createAndDispatchMessage).not.toHaveBeenCalled();
	});

	it("crea e smista il messaggio rispondendo con ok", async () => {
		const { io, handler } = connectAndGetHandler();
		const conv = { id: "conv-1", userAId: "user-1", userBId: "user-2" };
		const message = { id: "msg-1", body: "ciao" };
		h.findConversationForParticipant.mockReturnValue(conv);
		h.createAndDispatchMessage.mockReturnValue(message);
		const ack = vi.fn();

		await handler({ conversationId: "conv-1", body: " ciao " }, ack);

		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			conv,
			"user-1",
			// Il body arriva già trimmato dalla validazione Zod.
			expect.objectContaining({ body: "ciao" }),
		);
		expect(ack).toHaveBeenCalledWith({ ok: true, message });
	});

	it("risponde con errore generico se un helper lancia un'eccezione", async () => {
		const { handler } = connectAndGetHandler();
		h.findConversationForParticipant.mockImplementation(() => {
			throw new Error("db down");
		});
		const ack = vi.fn();

		await handler({ conversationId: "conv-1", body: "ciao" }, ack);

		expect(ack).toHaveBeenCalledWith({ error: "Internal server error" });
	});

	it("non esplode senza callback di ack", async () => {
		const { handler } = connectAndGetHandler();
		h.rateLimit.mockReturnValue(false);

		await expect(
			handler({ conversationId: "conv-1", body: "ciao" }),
		).resolves.toBeUndefined();
	});
});

describe("presence:subscribe", () => {
	function connectAndGetHandler() {
		const { io, connect } = createIo();
		setupSocketHandlers(io);
		const created = createSocket("user-1");
		connect(created.socket);
		const handler = created.listeners.get(SocketEvent.PRESENCE_SUBSCRIBE);
		if (!handler) throw new Error("handler presence:subscribe non registrato");
		return { handler, emitMock: created.emitMock };
	}

	it("ignora i payload malformati", () => {
		const { handler, emitMock } = connectAndGetHandler();

		handler(null);
		handler("not-an-object");
		handler({});
		handler({ userIds: "not-an-array" });

		expect(emitMock).not.toHaveBeenCalled();
	});

	it("risponde con lo snapshot online/offline filtrando gli id non stringa", () => {
		const { handler, emitMock } = connectAndGetHandler();
		h.getOnlineUsers.mockReturnValue(["user-2"]);

		handler({ userIds: ["user-2", "user-3", 42] });

		expect(h.getOnlineUsers).toHaveBeenCalledWith(["user-2", "user-3"]);
		expect(emitMock).toHaveBeenCalledWith(SocketEvent.PRESENCE_SNAPSHOT, {
			"user-2": "online",
			"user-3": "offline",
		});
	});
});

describe("disconnect", () => {
	function connectAndGetHandler(socketId = "socket-1") {
		const { io, connect } = createIo();
		setupSocketHandlers(io);
		const created = createSocket("user-1", socketId);
		connect(created.socket);
		const handler = created.listeners.get("disconnect");
		if (!handler) throw new Error("handler disconnect non registrato");
		return { io, handler };
	}

	it("alla chiusura dell'ultima socket annuncia 'offline' e aggiorna lastSeenAt", () => {
		const { io, handler } = connectAndGetHandler();
		h.removeSocket.mockReturnValue(true);
		h.getFriendIds.mockReturnValue(["friend-1"]);

		handler();

		expect(h.removeSocket).toHaveBeenCalledWith("user-1", "socket-1");
		expect(h.emitToUser).toHaveBeenCalledWith(
			io,
			"friend-1",
			SocketEvent.PRESENCE_UPDATE,
			{ userId: "user-1", status: "offline" },
		);
		expect(h.dbUpdate).toHaveBeenCalledTimes(1);
		expect(h.dbSet).toHaveBeenCalledWith({ lastSeenAt: expect.any(Date) });
		expect(h.dbRun).toHaveBeenCalledTimes(1);
	});

	it("non fa nulla se l'utente ha ancora altre socket attive", () => {
		const { handler } = connectAndGetHandler("socket-2");
		h.removeSocket.mockReturnValue(false);

		handler();

		expect(h.emitToUser).not.toHaveBeenCalled();
		expect(h.dbUpdate).not.toHaveBeenCalled();
	});
});
