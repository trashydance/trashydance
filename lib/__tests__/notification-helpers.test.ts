import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createTestDb,
	seedConversation,
	seedFriendRequest,
	seedMessage,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
	vi.doMock("@/lib/db", () => ({ default: testDb }));
});

describe("getNotificationCount", () => {
	it("returns zero counts when no notifications", async () => {
		const { getNotificationCount } = await import("@/lib/notification-helpers");
		const result = getNotificationCount("user-1");
		expect(result.pendingRequests).toBe(0);
		expect(result.unreadChats).toBe(0);
	});

	it("counts pending friend requests received", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "pending");
		const { getNotificationCount } = await import("@/lib/notification-helpers");
		const result = getNotificationCount("user-1");
		expect(result.pendingRequests).toBe(2);
	});

	it("does not count sent pending requests", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		const { getNotificationCount } = await import("@/lib/notification-helpers");
		const result = getNotificationCount("user-1");
		expect(result.pendingRequests).toBe(0);
	});

	it("does not count accepted requests", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "accepted");
		const { getNotificationCount } = await import("@/lib/notification-helpers");
		const result = getNotificationCount("user-1");
		expect(result.pendingRequests).toBe(0);
	});

	it("counts unread conversations where lastReadAt is null", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedMessage(testDb, "msg-1", "conv-1", "user-2", "Hello");
		const { getNotificationCount } = await import("@/lib/notification-helpers");
		const result = getNotificationCount("user-1");
		expect(result.unreadChats).toBe(1);
	});
});
