import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedConversation,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("createConversation", () => {
	it("returns unauthorized when not authenticated", async () => {
		setupApiMocks(testDb, null);

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("user-2");

		expect(res).toEqual({ ok: false, error: "unauthorized" });
	});

	it("returns error for conversation with self", async () => {
		setupApiMocks(testDb, "user-1");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("user-1");

		expect(res).toEqual({
			ok: false,
			error: "Cannot create a conversation with yourself",
		});
	});

	it("returns error for nonexistent user", async () => {
		setupApiMocks(testDb, "user-1");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("nonexistent");

		expect(res).toEqual({ ok: false, error: "User not found" });
	});

	it("returns Invalid input for empty user id", async () => {
		setupApiMocks(testDb, "user-1");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("");

		expect(res).toEqual({ ok: false, error: "Invalid input" });
	});

	it("creates a new conversation", async () => {
		setupApiMocks(testDb, "user-1");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("user-2");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.partner.id).toBe("user-2");
		expect(res.data.created).toBe(true);
	});

	it("returns existing conversation without creating a new one", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("user-2");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.id).toBe("conv-1");
		expect(res.data.created).toBe(false);
	});

	it("normalizes participant order (min/max)", async () => {
		setupApiMocks(testDb, "user-2");

		const { createConversation } = await import("@/lib/actions/conversations");

		const res = await createConversation("user-1");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.partner.id).toBe("user-1");
		expect(res.data.created).toBe(true);
	});
});
