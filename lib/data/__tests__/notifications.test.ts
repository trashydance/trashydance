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

describe("getNotificationCounts", () => {
	it("returns zero counts when there are no notifications", async () => {
		setupApiMocks(testDb, "user-1");

		const { getNotificationCounts } = await import("@/lib/data/notifications");

		const counts = await getNotificationCounts("user-1");

		expect(counts.pendingRequests).toBe(0);
		expect(counts.unreadChats).toBe(0);
	});

	it("returns counts with pending requests and unread chats", async () => {
		// Pending friend requests where user-1 is the receiver
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "pending");

		// Conversation with lastMessageAt set but no lastReadAt
		seedConversation(testDb, "conv-1", "user-1", "user-2");

		setupApiMocks(testDb, "user-1");

		const { getNotificationCounts } = await import("@/lib/data/notifications");

		const counts = await getNotificationCounts("user-1");

		expect(counts.pendingRequests).toBe(2);
		expect(counts.unreadChats).toBe(1);
	});
});
