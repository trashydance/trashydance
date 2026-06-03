import { beforeEach, describe, expect, it, vi } from "vitest";
import { createJsonRequest, setupApiMocks } from "@/test/api-helpers";
import { createTestDb, seedUsers, type TestDb } from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("PATCH /api/profile", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { PATCH } = await import("@/app/api/profile/route");
		const req = createJsonRequest("PATCH", {
			image: "https://example.com/img.png",
		});
		const res = await PATCH(req);
		expect(res.status).toBe(401);
	});

	it("returns 400 when no fields to update", async () => {
		setupApiMocks(testDb, "user-1");
		const { PATCH } = await import("@/app/api/profile/route");
		const req = createJsonRequest("PATCH", {});
		const res = await PATCH(req);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("No fields to update");
	});

	it("returns 400 for invalid input", async () => {
		setupApiMocks(testDb, "user-1");
		const { PATCH } = await import("@/app/api/profile/route");
		const req = createJsonRequest("PATCH", { image: 123 });
		const res = await PATCH(req);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Invalid input");
	});

	it("returns 200 and updates image successfully", async () => {
		setupApiMocks(testDb, "user-1");
		const { PATCH } = await import("@/app/api/profile/route");
		const req = createJsonRequest("PATCH", {
			image: "https://example.com/new-avatar.png",
		});
		const res = await PATCH(req);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.ok).toBe(true);
	});
});
