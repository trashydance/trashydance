import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest, setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedConversation,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("POST /api/conversations", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(401);
	});

	it("returns 400 for conversation with self", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "user-1" });
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("returns 404 for nonexistent user", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "nonexistent" });
		const res = await POST(req);
		expect(res.status).toBe(404);
	});

	it("creates a new conversation and returns 201", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(201);

		const data = await res.json();
		expect(data.partner.id).toBe("user-2");
		expect(data.created).toBe(true);
	});

	it("returns existing conversation without creating a new one", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.id).toBe("conv-1");
		expect(data.created).toBe(false);
	});

	it("normalizes participant order (min/max)", async () => {
		setupApiMocks(testDb, "user-2");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "user-1" });
		const res = await POST(req);
		expect(res.status).toBe(201);

		const data = await res.json();
		expect(data.partner.id).toBe("user-1");
	});

	it("returns 400 for invalid input", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/conversations/route");
		const req = createJsonRequest("POST", { otherUserId: "" });
		const res = await POST(req);
		expect(res.status).toBe(400);
	});
});
