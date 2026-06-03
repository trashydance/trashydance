import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedConversation,
	seedMessage,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("GET /api/search", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { GET } = await import("@/app/api/search/route");
		const req = new NextRequest("http://localhost:3000/api/search?q=test");
		const res = await GET(req);
		expect(res.status).toBe(401);
	});

	it("returns empty results when user has no conversations", async () => {
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/search/route");
		const req = new NextRequest("http://localhost:3000/api/search?q=bob");
		const res = await GET(req);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.users).toEqual([]);
		expect(data.messages).toEqual([]);
	});

	it("returns matched users and messages", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedMessage(testDb, "msg-1", "conv-1", "user-2", "Hello world");
		seedMessage(testDb, "msg-2", "conv-1", "user-1", "Goodbye");

		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/search/route");

		// Search for "bob" should match user Bob
		const reqUsers = new NextRequest("http://localhost:3000/api/search?q=bob");
		const resUsers = await GET(reqUsers);
		expect(resUsers.status).toBe(200);
		const dataUsers = await resUsers.json();
		expect(dataUsers.users).toHaveLength(1);
		expect(dataUsers.users[0].id).toBe("user-2");
		expect(dataUsers.users[0].name).toBe("Bob");

		// Need fresh import for second call due to module mocking
		vi.resetModules();
		setupApiMocks(testDb, "user-1");
		const { GET: GET2 } = await import("@/app/api/search/route");

		// Search for "Hello" should match message
		const reqMsg = new NextRequest("http://localhost:3000/api/search?q=Hello");
		const resMsg = await GET2(reqMsg);
		expect(resMsg.status).toBe(200);
		const dataMsg = await resMsg.json();
		expect(dataMsg.messages).toHaveLength(1);
		expect(dataMsg.messages[0].body).toBe("Hello world");
		expect(dataMsg.messages[0].sender.name).toBe("Bob");
	});
});
