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

// Next.js route handler context (params non deve essere Promise)
function makeParams(username: string) {
	return {
		params: Promise.resolve({ username }),
	};
}

describe("GET /api/profile/[username]", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);

		const { GET } = await import("@/app/api/profile/[username]/route");

		const req = new Request("http://localhost:3000/api/profile/alice");

		const res = await GET(req, await makeParams("alice"));

		expect(res.status).toBe(401);
	});

	it("returns 404 when user is not found", async () => {
		setupApiMocks(testDb, "user-1");

		const { GET } = await import("@/app/api/profile/[username]/route");

		const req = new Request("http://localhost:3000/api/profile/nonexistent");

		const res = await GET(req, await makeParams("nonexistent"));

		expect(res.status).toBe(404);

		const data = await res.json();
		expect(data.error).toBe("User not found");
	});

	it("returns 200 with profile and friend status", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");

		const { GET } = await import("@/app/api/profile/[username]/route");

		const req = new Request("http://localhost:3000/api/profile/bob");

		const res = await GET(req, await makeParams("bob"));

		expect(res.status).toBe(200);

		const data = await res.json();

		expect(data.id).toBe("user-2");
		expect(data.name).toBe("Bob");
		expect(data.username).toBe("bob");
		expect(data.friendCount).toBe(1);
		expect(data.friendStatus).toBe("friends");
		expect(data.friendRequestId).toBe("fr-1");
		expect(data.isOwnProfile).toBe(false);
	});

	it('returns 200 with own profile when username is "me"', async () => {
		setupApiMocks(testDb, "user-1");

		const { GET } = await import("@/app/api/profile/[username]/route");

		const req = new Request("http://localhost:3000/api/profile/me");

		const res = await GET(req, await makeParams("me"));

		expect(res.status).toBe(200);

		const data = await res.json();

		expect(data.id).toBe("user-1");
		expect(data.name).toBe("Alice");
		expect(data.username).toBe("alice");
		expect(data.friendStatus).toBe("none");
		expect(data.friendRequestId).toBeNull();
		expect(data.isOwnProfile).toBe(true);
	});
});
