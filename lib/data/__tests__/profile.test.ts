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

describe("getProfileByUsername", () => {
	it("returns null when user is not found", async () => {
		setupApiMocks(testDb, "user-1");

		const { getProfileByUsername } = await import("@/lib/data/profile");

		const profile = await getProfileByUsername("user-1", "nonexistent");

		expect(profile).toBeNull();
	});

	it("returns profile and friend status for another user", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");

		const { getProfileByUsername } = await import("@/lib/data/profile");

		const profile = await getProfileByUsername("user-1", "bob");

		expect(profile?.id).toBe("user-2");
		expect(profile?.name).toBe("Bob");
		expect(profile?.username).toBe("bob");
		expect(profile?.friendCount).toBe(1);
		expect(profile?.friendStatus).toBe("friends");
		expect(profile?.friendRequestId).toBe("fr-1");
		expect(profile?.isOwnProfile).toBe(false);
	});

	it('returns own profile when username is "me"', async () => {
		setupApiMocks(testDb, "user-1");

		const { getProfileByUsername } = await import("@/lib/data/profile");

		const profile = await getProfileByUsername("user-1", "me");

		expect(profile?.id).toBe("user-1");
		expect(profile?.name).toBe("Alice");
		expect(profile?.username).toBe("alice");
		expect(profile?.friendStatus).toBe("none");
		expect(profile?.friendRequestId).toBeNull();
		expect(profile?.isOwnProfile).toBe(true);
	});
});
