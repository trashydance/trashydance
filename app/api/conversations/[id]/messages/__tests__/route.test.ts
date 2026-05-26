import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest, setupApiMocks } from "@/test/api-helpers";
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

function makeParams(id: string) {
	return { params: Promise.resolve({ id }) };
}

describe("GET /api/conversations/[id]/messages", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { GET } = await import("@/app/api/conversations/[id]/messages/route");
		const req = new NextRequest(
			"http://localhost:3000/api/conversations/conv-1/messages",
		);
		const res = await GET(req, makeParams("conv-1"));
		expect(res.status).toBe(401);
	});

	it("returns 404 when conversation is not found", async () => {
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/conversations/[id]/messages/route");
		const req = new NextRequest(
			"http://localhost:3000/api/conversations/nonexistent/messages",
		);
		const res = await GET(req, makeParams("nonexistent"));
		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data.error).toBe("Conversation not found");
	});

	it("returns 200 with messages and pagination info", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		const baseTime = Date.now();
		seedMessage(
			testDb,
			"msg-1",
			"conv-1",
			"user-1",
			"First message",
			new Date(baseTime - 2000),
		);
		seedMessage(
			testDb,
			"msg-2",
			"conv-1",
			"user-2",
			"Second message",
			new Date(baseTime - 1000),
		);
		seedMessage(
			testDb,
			"msg-3",
			"conv-1",
			"user-1",
			"Third message",
			new Date(baseTime),
		);

		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/conversations/[id]/messages/route");
		const req = new NextRequest(
			"http://localhost:3000/api/conversations/conv-1/messages?limit=2",
		);
		const res = await GET(req, makeParams("conv-1"));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.messages).toHaveLength(2);
		expect(data.hasMore).toBe(true);
		expect(data.nextCursor).toBeTypeOf("number");
		// Messages are ordered desc by createdAt
		expect(data.messages[0].body).toBe("Third message");
		expect(data.messages[1].body).toBe("Second message");
		// Each message has sender info
		expect(data.messages[0].sender.name).toBe("Alice");
	});
});

describe("POST /api/conversations/[id]/messages", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { POST } = await import(
			"@/app/api/conversations/[id]/messages/route"
		);
		const req = createJsonRequest("POST", { body: "Hello" });
		const res = await POST(req, makeParams("conv-1"));
		expect(res.status).toBe(401);
	});

	it("returns 404 when conversation is not found", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import(
			"@/app/api/conversations/[id]/messages/route"
		);
		const req = createJsonRequest("POST", { body: "Hello" });
		const res = await POST(req, makeParams("nonexistent"));
		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data.error).toBe("Conversation not found");
	});

	it("returns 400 for invalid message (empty body and no file)", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import(
			"@/app/api/conversations/[id]/messages/route"
		);
		const req = createJsonRequest("POST", { body: "   " });
		const res = await POST(req, makeParams("conv-1"));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Invalid message");
	});

	it("returns 201 and creates a new message", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import(
			"@/app/api/conversations/[id]/messages/route"
		);
		const req = createJsonRequest("POST", { body: "Hello there!" });
		const res = await POST(req, makeParams("conv-1"));
		expect(res.status).toBe(201);

		const data = await res.json();
		expect(data.id).toBeTypeOf("string");
		expect(data.conversationId).toBe("conv-1");
		expect(data.senderId).toBe("user-1");
		expect(data.body).toBe("Hello there!");
		expect(data.createdAt).toBeTypeOf("number");
	});
});
