import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
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

describe("getFriendRequestsData", () => {
	it("returns empty arrays when no requests", async () => {
		setupApiMocks(testDb, "user-1");

		const { getFriendRequestsData } = await import("@/lib/data/friends");

		const data = await getFriendRequestsData("user-1");

		expect(data.received).toEqual([]);
		expect(data.sent).toEqual([]);
		expect(data.accepted).toEqual([]);
	});

	it("categorizes requests correctly", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		seedFriendRequest(testDb, "fr-2", "user-1", "user-3", "pending");
		seedFriendRequest(testDb, "fr-3", "user-1", "user-2", "accepted");

		setupApiMocks(testDb, "user-1");

		const { getFriendRequestsData } = await import("@/lib/data/friends");

		const data = await getFriendRequestsData("user-1");

		expect(data.received).toHaveLength(1);
		expect(data.received[0].id).toBe("fr-1");
		expect(data.received[0].sender.id).toBe("user-2");
		expect(data.sent).toHaveLength(1);
		expect(data.sent[0].id).toBe("fr-2");
		expect(data.sent[0].receiver.id).toBe("user-3");
		expect(data.accepted).toHaveLength(1);
		expect(data.accepted[0].id).toBe("fr-3");
		expect(data.accepted[0].friend.id).toBe("user-2");
	});
});
