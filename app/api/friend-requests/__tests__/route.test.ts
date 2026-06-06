import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest, setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedFriendRequest,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("POST /api/friend-requests", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(401);
	});

	it("returns 400 for self-request", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-1" });
		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("returns 404 for nonexistent user", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "nonexistent" });
		const res = await POST(req);
		expect(res.status).toBe(404);
	});

	it("creates a new friend request and returns 201", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(201);

		const data = await res.json();
		expect(data.senderId).toBe("user-1");
		expect(data.receiverId).toBe("user-2");
		expect(data.status).toBe("pending");
	});

	it("returns 409 when request is already pending", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(409);
	});

	it("returns 409 when already friends", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(409);
	});

	it("replaces a rejected request with a new one", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "rejected");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/friend-requests/route");
		const req = createJsonRequest("POST", { receiverId: "user-2" });
		const res = await POST(req);
		expect(res.status).toBe(201);
	});
});
