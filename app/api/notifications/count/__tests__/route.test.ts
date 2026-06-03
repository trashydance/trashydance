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

describe("GET /api/notifications/count", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { GET } = await import("@/app/api/notifications/count/route");
		const res = await GET();
		expect(res.status).toBe(401);
	});

	it("returns zero counts when there are no notifications", async () => {
		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/notifications/count/route");
		const res = await GET();
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.pendingRequests).toBe(0);
		expect(data.unreadChats).toBe(0);
	});

	it("returns counts with pending requests and unread chats", async () => {
		// Create a pending friend request where user-1 is the receiver
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "pending");

		// Create a conversation with a message (lastMessageAt is set but no lastReadAt)
		seedConversation(testDb, "conv-1", "user-1", "user-2");

		setupApiMocks(testDb, "user-1");
		const { GET } = await import("@/app/api/notifications/count/route");
		const res = await GET();
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.pendingRequests).toBe(2);
		expect(data.unreadChats).toBe(1);
	});
});
