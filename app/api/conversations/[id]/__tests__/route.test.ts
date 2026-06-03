import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedConversation,
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

function makeParams(id: string) {
	return { params: Promise.resolve({ id }) };
}

describe("GET /api/conversations/[id]", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { GET } = await import("@/app/api/conversations/[id]/route");
		const req = new Request("http://localhost:3000/api/conversations/conv-1");
		const res = await GET(req, makeParams("conv-1"));
		expect(res.status).toBe(401);
	});

	it("returns 404 when conversation is not found", async () => {
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/conversations/[id]/route");
		const req = new Request(
			"http://localhost:3000/api/conversations/nonexistent",
		);
		const res = await GET(req, makeParams("nonexistent"));
		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data.error).toBe("Conversation not found");
	});

	it("returns 403 when user is not a participant", async () => {
		seedConversation(testDb, "conv-1", "user-2", "user-3");
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/conversations/[id]/route");
		const req = new Request("http://localhost:3000/api/conversations/conv-1");
		const res = await GET(req, makeParams("conv-1"));
		expect(res.status).toBe(403);
		const data = await res.json();
		expect(data.error).toBe("Forbidden");
	});

	it("returns 200 with conversation and partner info", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/conversations/[id]/route");
		const req = new Request("http://localhost:3000/api/conversations/conv-1");
		const res = await GET(req, makeParams("conv-1"));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.id).toBe("conv-1");
		expect(data.partner.id).toBe("user-2");
		expect(data.partner.name).toBe("Bob");
		expect(data.partner.username).toBe("bob");
		expect(data.friendStatus).toBe("friends");
		expect(data.friendRequestId).toBe("fr-1");
		expect(data.currentUserId).toBe("user-1");
		expect(data.createdAt).toBeTypeOf("number");
		expect(data.lastMessageAt).toBeTypeOf("number");
	});
});
