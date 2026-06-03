import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest, setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedFriendRequest,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

function makeParams(id: string) {
	return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("PATCH /api/friend-requests/[id]", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "accept" });
		const res = await PATCH(req, makeParams("fr-1"));
		expect(res.status).toBe(401);
	});

	it("returns 404 for nonexistent request", async () => {
		setupApiMocks(testDb, "user-1");
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "accept" });
		const res = await PATCH(req, makeParams("nonexistent"));
		expect(res.status).toBe(404);
	});

	it("returns 403 when sender tries to accept", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "accept" });
		const res = await PATCH(req, makeParams("fr-1"));
		expect(res.status).toBe(403);
	});

	it("accepts a pending request as receiver", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-2");
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "accept" });
		const res = await PATCH(req, makeParams("fr-1"));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.status).toBe("accepted");
	});

	it("rejects a pending request as receiver", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-2");
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "reject" });
		const res = await PATCH(req, makeParams("fr-1"));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.status).toBe("rejected");
	});

	it("returns 400 for non-pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-2");
		const { PATCH } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("PATCH", { action: "reject" });
		const res = await PATCH(req, makeParams("fr-1"));
		expect(res.status).toBe(400);
	});
});

describe("DELETE /api/friend-requests/[id]", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("fr-1"));
		expect(res.status).toBe(401);
	});

	it("returns 404 for nonexistent request", async () => {
		setupApiMocks(testDb, "user-1");
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("nonexistent"));
		expect(res.status).toBe(404);
	});

	it("allows sender to cancel pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("fr-1"));
		expect(res.status).toBe(200);
	});

	it("prevents receiver from canceling pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-2");
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("fr-1"));
		expect(res.status).toBe(403);
	});

	it("allows either party to unfriend (accepted)", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-2");
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("fr-1"));
		expect(res.status).toBe(200);
	});

	it("returns 400 for rejected request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "rejected");
		setupApiMocks(testDb, "user-1");
		const { DELETE } = await import("@/app/api/friend-requests/[id]/route");
		const req = createJsonRequest("DELETE");
		const res = await DELETE(req, makeParams("fr-1"));
		expect(res.status).toBe(400);
	});
});
