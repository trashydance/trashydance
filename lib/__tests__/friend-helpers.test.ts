import { beforeEach, describe, expect, it, vi } from "vitest";
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
	vi.doMock("@/lib/db", () => ({ default: testDb }));
});

describe("getFriendStatus", () => {
	it("returns 'none' when no friend request exists", async () => {
		const { getFriendStatus } = await import("@/lib/friend-helpers");
		expect(getFriendStatus("user-1", "user-2")).toBe("none");
	});

	it("returns 'friends' for accepted request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		const { getFriendStatus } = await import("@/lib/friend-helpers");
		expect(getFriendStatus("user-1", "user-2")).toBe("friends");
		expect(getFriendStatus("user-2", "user-1")).toBe("friends");
	});

	it("returns 'pending_sent' for sender of pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		const { getFriendStatus } = await import("@/lib/friend-helpers");
		expect(getFriendStatus("user-1", "user-2")).toBe("pending_sent");
	});

	it("returns 'pending_received' for receiver of pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		const { getFriendStatus } = await import("@/lib/friend-helpers");
		expect(getFriendStatus("user-2", "user-1")).toBe("pending_received");
	});

	it("returns 'none' for rejected request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "rejected");
		const { getFriendStatus } = await import("@/lib/friend-helpers");
		expect(getFriendStatus("user-1", "user-2")).toBe("none");
	});
});

describe("getFriendRequestInfo", () => {
	it("returns status and requestId for accepted request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		const { getFriendRequestInfo } = await import("@/lib/friend-helpers");
		const result = getFriendRequestInfo("user-1", "user-2");
		expect(result.status).toBe("friends");
		expect(result.requestId).toBe("fr-1");
	});

	it("returns null requestId when no request exists", async () => {
		const { getFriendRequestInfo } = await import("@/lib/friend-helpers");
		const result = getFriendRequestInfo("user-1", "user-2");
		expect(result.status).toBe("none");
		expect(result.requestId).toBeNull();
	});
});

describe("isFriend", () => {
	it("returns true for accepted friend request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		const { isFriend } = await import("@/lib/friend-helpers");
		expect(isFriend("user-1", "user-2")).toBe(true);
	});

	it("returns false for pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		const { isFriend } = await import("@/lib/friend-helpers");
		expect(isFriend("user-1", "user-2")).toBe(false);
	});

	it("returns false for no request", async () => {
		const { isFriend } = await import("@/lib/friend-helpers");
		expect(isFriend("user-1", "user-2")).toBe(false);
	});
});

describe("getFriendIds", () => {
	it("returns friend IDs for accepted requests", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "accepted");
		const { getFriendIds } = await import("@/lib/friend-helpers");
		const ids = getFriendIds("user-1");
		expect(ids).toHaveLength(2);
		expect(ids).toContain("user-2");
		expect(ids).toContain("user-3");
	});

	it("does not include pending requests", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "accepted");
		const { getFriendIds } = await import("@/lib/friend-helpers");
		const ids = getFriendIds("user-1");
		expect(ids).toHaveLength(1);
		expect(ids).toContain("user-3");
	});

	it("returns empty array when no friends", async () => {
		const { getFriendIds } = await import("@/lib/friend-helpers");
		expect(getFriendIds("user-1")).toEqual([]);
	});
});
