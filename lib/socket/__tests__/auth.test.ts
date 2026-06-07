import type { Socket } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();

beforeEach(() => {
	vi.resetModules();
	getSession.mockReset();
	vi.doMock("@/lib/auth", () => ({
		getAuth: () => ({ api: { getSession } }),
	}));
});

type NextFn = (err?: Error) => void;

function createSocket(cookie?: string): Socket {
	return {
		handshake: { headers: cookie ? { cookie } : {} },
		data: {},
	} as unknown as Socket;
}

describe("socketAuthMiddleware", () => {
	it("rejects with an error when no cookie header is present", async () => {
		const { socketAuthMiddleware } = await import("@/lib/socket/auth");
		const socket = createSocket();
		const next: NextFn = vi.fn();

		await socketAuthMiddleware(socket, next);

		expect(getSession).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledTimes(1);
		expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
			Error,
		);
	});

	it("rejects with an error when the session is invalid", async () => {
		getSession.mockResolvedValue(null);
		const { socketAuthMiddleware } = await import("@/lib/socket/auth");
		const socket = createSocket("session=abc");
		const next: NextFn = vi.fn();

		await socketAuthMiddleware(socket, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
			Error,
		);
		expect(socket.data.userId).toBeUndefined();
	});

	it("sets socket.data.userId and calls next() without error on a valid session", async () => {
		getSession.mockResolvedValue({
			session: { id: "session-1" },
			user: { id: "user-1", name: "Alice" },
		});
		const { socketAuthMiddleware } = await import("@/lib/socket/auth");
		const socket = createSocket("session=abc");
		const next: NextFn = vi.fn();

		await socketAuthMiddleware(socket, next);

		expect(socket.data.userId).toBe("user-1");
		expect(socket.data.user).toEqual({ id: "user-1", name: "Alice" });
		expect(next).toHaveBeenCalledTimes(1);
		expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeUndefined();
	});

	it("rejects with an error when getSession throws", async () => {
		getSession.mockRejectedValue(new Error("boom"));
		const { socketAuthMiddleware } = await import("@/lib/socket/auth");
		const socket = createSocket("session=abc");
		const next: NextFn = vi.fn();

		await socketAuthMiddleware(socket, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeInstanceOf(
			Error,
		);
		expect(socket.data.userId).toBeUndefined();
	});
});
