import { vi } from "vitest";
import type { TestDb } from "./db-helpers";

export function mockAuthSession(userId: string | null) {
	return vi.fn().mockResolvedValue(
		userId
			? {
					user: { id: userId, name: "Test User", email: "test@test.com" },
					session: { id: "session-1", token: "tok", expiresAt: new Date() },
				}
			: null,
	);
}

export function setupApiMocks(testDb: TestDb, userId: string | null) {
	vi.doMock("@/lib/db", () => ({ default: testDb }));
	vi.doMock("@/lib/auth-session", () => ({
		getAuthSession: mockAuthSession(userId),
	}));
	vi.doMock("@/lib/socket/io-instance", () => ({
		getIO: vi.fn().mockReturnValue(null),
		setIO: vi.fn(),
	}));
	vi.doMock("@/lib/socket/presence", () => ({
		presence: {
			getSocketIds: vi.fn().mockReturnValue(new Set()),
			add: vi.fn(),
			remove: vi.fn(),
			isOnline: vi.fn().mockReturnValue(false),
		},
	}));
}

export function createJsonRequest(method: string, body?: unknown): Request {
	const init: RequestInit = { method };
	if (body !== undefined) {
		init.body = JSON.stringify(body);
		init.headers = { "Content-Type": "application/json" };
	}
	return new Request("http://localhost:3000/api/test", init);
}
