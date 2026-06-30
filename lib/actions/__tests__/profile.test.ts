import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { user } from "@/schema";
import { setupApiMocks } from "@/test/api-helpers";
import { createTestDb, seedUsers, type TestDb } from "@/test/db-helpers";

let testDb: TestDb;

function mockNextCache() {
	vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
}

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("updateProfile", () => {
	it("returns unauthorized when not authenticated", async () => {
		setupApiMocks(testDb, null);
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const res = await updateProfile({ name: "New Name" });

		expect(res).toEqual({ ok: false, error: "unauthorized" });
	});

	it("returns error when no fields to update", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const res = await updateProfile({});

		expect(res).toEqual({ ok: false, error: "No fields to update" });
	});

	it("clears optional fields when null is passed", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const set = await updateProfile({ bio: "hello", lastName: "Smith" });
		expect(set.ok).toBe(true);

		const res = await updateProfile({ bio: null, lastName: null });
		expect(res.ok).toBe(true);

		const row = testDb
			.select({ bio: user.bio, lastName: user.lastName })
			.from(user)
			.where(eq(user.id, "user-1"))
			.get();
		expect(row?.bio).toBe("");
		expect(row?.lastName).toBe("");
	});

	it("treats null name as not provided", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const res = await updateProfile({ name: null });

		expect(res).toEqual({ ok: false, error: "No fields to update" });
	});

	it("returns Invalid input for wrong types", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const res = await updateProfile({
			name: 123 as unknown as string,
		});

		expect(res).toEqual({ ok: false, error: "Invalid input" });
	});

	it("updates the profile successfully", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { updateProfile } = await import("@/lib/actions/profile");

		const res = await updateProfile({
			name: "Alice Updated",
			lastName: "Smith",
		});

		expect(res.ok).toBe(true);

		const row = testDb
			.select({ name: user.name, lastName: user.lastName })
			.from(user)
			.where(eq(user.id, "user-1"))
			.get();
		expect(row?.name).toBe("Alice Updated");
		expect(row?.lastName).toBe("Smith");
	});
});
