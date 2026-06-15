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

describe("getInitialUserList", () => {
	it("excludes the current user from the list", async () => {
		setupApiMocks(testDb, "user-1");

		const { getInitialUserList } = await import("@/lib/data/users");

		const { friends, others } = await getInitialUserList("user-1");
		const ids = [...friends, ...others].map((u) => u.id);

		expect(ids).not.toContain("user-1");
		expect(ids).toHaveLength(2);
	});

	it("groups users by friend status", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		seedFriendRequest(testDb, "fr-2", "user-3", "user-1", "pending");

		setupApiMocks(testDb, "user-1");

		const { getInitialUserList } = await import("@/lib/data/users");

		const { friends, others } = await getInitialUserList("user-1");

		expect(friends).toHaveLength(1);
		expect(friends[0].id).toBe("user-2");
		expect(friends[0].friendStatus).toBe("friends");
		expect(friends[0].friendRequestId).toBe("fr-1");

		expect(others).toHaveLength(1);
		expect(others[0].id).toBe("user-3");
		expect(others[0].friendStatus).toBe("pending_received");
		expect(others[0].friendRequestId).toBe("fr-2");
	});
});
