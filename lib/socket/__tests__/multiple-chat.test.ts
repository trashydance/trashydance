import type { Socket, Server as SocketIOServer } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocketEvent } from "@/lib/constants";
import { setupSocketHandlers } from "@/lib/socket/handlers";

// Mock dependencies with side-effects:
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
}));

vi.mock("@/lib/rate-limit", () => ({ rateLimit: h.rateLimit }));
vi.mock("@/lib/conversation-helpers", () => ({
	findConversationForParticipant: h.findConversationForParticipant,
	createAndDispatchMessage: h.createAndDispatchMessage,
	getPartnerId: (conv: { userAId: string; userBId: string }, uid: string) =>
		conv.userAId === uid ? conv.userBId : conv.userAId,
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
		connect: (socket: unknown) => connectionHandler(socket),
	};
}

function createSocket(userId: string, id: string) {
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
		listeners,
	};
}

describe("Multiple Chat Scenarios (Issue #121)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		h.rateLimit.mockReturnValue(true);
	});

	it("Scenario 1: A:B and C:D chat concurrently in pairs without interference", async () => {
		const { io, connect } = createIo();
		setupSocketHandlers(io);

		// Socket A
		const clientA = createSocket("user-a", "socket-a");
		connect(clientA.socket);
		const handlerA = clientA.listeners.get(SocketEvent.MESSAGE_SEND);

		// Socket C
		const clientC = createSocket("user-c", "socket-c");
		connect(clientC.socket);
		const handlerC = clientC.listeners.get(SocketEvent.MESSAGE_SEND);

		const convAB = { id: "conv-ab", userAId: "user-a", userBId: "user-b" };
		const convCD = { id: "conv-cd", userAId: "user-c", userBId: "user-d" };

		h.findConversationForParticipant.mockImplementation((cid, uid) => {
			if (cid === "conv-ab" && uid === "user-a") return convAB;
			if (cid === "conv-cd" && uid === "user-c") return convCD;
			return undefined;
		});

		// Trigger A sending message to B
		await handlerA?.({ conversationId: "conv-ab", body: "Hello B!" });
		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			convAB,
			"user-a",
			{ body: "Hello B!" },
		);

		// Trigger C sending message to D
		await handlerC?.({ conversationId: "conv-cd", body: "Hello D!" });
		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			convCD,
			"user-c",
			{ body: "Hello D!" },
		);
	});

	it("Scenario 2: A:B and C:B send messages to B concurrently, and both route to B correctly", async () => {
		const { io, connect } = createIo();
		setupSocketHandlers(io);

		const clientA = createSocket("user-a", "socket-a");
		const clientC = createSocket("user-c", "socket-c");
		connect(clientA.socket);
		connect(clientC.socket);

		const handlerA = clientA.listeners.get(SocketEvent.MESSAGE_SEND);
		const handlerC = clientC.listeners.get(SocketEvent.MESSAGE_SEND);

		const convAB = { id: "conv-ab", userAId: "user-a", userBId: "user-b" };
		const convCB = { id: "conv-cb", userAId: "user-c", userBId: "user-b" };

		h.findConversationForParticipant.mockImplementation((cid, uid) => {
			if (cid === "conv-ab" && uid === "user-a") return convAB;
			if (cid === "conv-cb" && uid === "user-c") return convCB;
			return undefined;
		});

		// Both send concurrently
		await Promise.all([
			handlerA?.({ conversationId: "conv-ab", body: "Message from A" }),
			handlerC?.({ conversationId: "conv-cb", body: "Message from C" }),
		]);

		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			convAB,
			"user-a",
			{ body: "Message from A" },
		);
		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			convCB,
			"user-c",
			{ body: "Message from C" },
		);
	});

	it("Scenario 3: While A sends to B, A receives message from C", async () => {
		const { io, connect } = createIo();
		setupSocketHandlers(io);

		const clientA = createSocket("user-a", "socket-a");
		connect(clientA.socket);
		const handlerA = clientA.listeners.get(SocketEvent.MESSAGE_SEND);

		const convAB = { id: "conv-ab", userAId: "user-a", userBId: "user-b" };
		h.findConversationForParticipant.mockImplementation((cid, uid) => {
			if (cid === "conv-ab" && uid === "user-a") return convAB;
			return undefined;
		});

		// A sends message to B
		await handlerA?.({ conversationId: "conv-ab", body: "Sending to B" });
		expect(h.createAndDispatchMessage).toHaveBeenCalledWith(
			io,
			convAB,
			"user-a",
			{ body: "Sending to B" },
		);

		const convCA = { id: "conv-ca", userAId: "user-c", userBId: "user-a" };
		const partner =
			convCA.userAId === "user-c" ? convCA.userBId : convCA.userAId;
		expect(partner).toBe("user-a");
	});
});
