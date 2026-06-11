import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { conversation, friendRequest } from "@/schema";
import { setupApiMocks } from "@/test/api-helpers";
import {
	createTestDb,
	seedConversation,
	seedFriendRequest,
	seedUsers,
	type TestDb,
} from "@/test/db-helpers";

let testDb: TestDb;

function mockNextCache() {
	vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
}

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

describe("sendFriendRequest", () => {
	it("returns unauthorized when not authenticated", async () => {
		setupApiMocks(testDb, null);
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-2");

		expect(res).toEqual({ ok: false, error: "unauthorized" });
	});

	it("returns error for self-request", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-1");

		expect(res).toEqual({
			ok: false,
			error: "Cannot send a friend request to yourself",
		});
	});

	it("returns error for nonexistent user", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("nonexistent");

		expect(res).toEqual({ ok: false, error: "User not found" });
	});

	it("creates a new friend request", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-2");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.senderId).toBe("user-1");
		expect(res.data.receiverId).toBe("user-2");
		expect(res.data.status).toBe("pending");
	});

	it("returns error when request is already pending", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-2");

		expect(res).toEqual({ ok: false, error: "Friend request already pending" });
	});

	it("returns error when already friends", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-2");

		expect(res).toEqual({ ok: false, error: "Already friends" });
	});

	it("replaces a rejected request with a new one", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "rejected");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { sendFriendRequest } = await import("@/lib/actions/friends");

		const res = await sendFriendRequest("user-2");

		expect(res.ok).toBe(true);

		const old = testDb
			.select()
			.from(friendRequest)
			.where(eq(friendRequest.id, "fr-1"))
			.get();
		expect(old).toBeUndefined();
	});
});

describe("respondFriendRequest", () => {
	it("returns unauthorized when not authenticated", async () => {
		setupApiMocks(testDb, null);
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res).toEqual({ ok: false, error: "unauthorized" });
	});

	it("returns error for nonexistent request", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("nonexistent", "accept");

		expect(res).toEqual({ ok: false, error: "Friend request not found" });
	});

	it("returns error when sender tries to accept", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res).toEqual({
			ok: false,
			error: "Only the receiver can accept or reject",
		});
	});

	it("accepts a pending request as receiver", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.status).toBe("accepted");

		const row = testDb
			.select()
			.from(friendRequest)
			.where(eq(friendRequest.id, "fr-1"))
			.get();
		expect(row?.status).toBe("accepted");
	});

	it("rejects a pending request as receiver", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "reject");

		expect(res.ok).toBe(true);
		if (!res.ok) return;
		expect(res.data.status).toBe("rejected");
	});

	it("returns error for non-pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "accepted");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res).toEqual({ ok: false, error: "Friend request is not pending" });
	});

	it("creates an empty conversation when accepting", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res.ok).toBe(true);

		// Normalized pair: user-1 < user-2
		const conv = testDb
			.select()
			.from(conversation)
			.where(
				and(
					eq(conversation.userAId, "user-1"),
					eq(conversation.userBId, "user-2"),
				),
			)
			.get();
		expect(conv).toBeDefined();
	});

	it("does not duplicate an existing conversation when accepting", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "accept");

		expect(res.ok).toBe(true);

		const convs = testDb.select().from(conversation).all();
		expect(convs).toHaveLength(1);
	});

	it("does not create a conversation when rejecting", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { respondFriendRequest } = await import("@/lib/actions/friends");

		const res = await respondFriendRequest("fr-1", "reject");

		expect(res.ok).toBe(true);

		const convs = testDb.select().from(conversation).all();
		expect(convs).toHaveLength(0);
	});
});

describe("removeFriendRequest", () => {
	it("returns unauthorized when not authenticated", async () => {
		setupApiMocks(testDb, null);
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("fr-1");

		expect(res).toEqual({ ok: false, error: "unauthorized" });
	});

	it("returns error for nonexistent request", async () => {
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("nonexistent");

		expect(res).toEqual({ ok: false, error: "Friend request not found" });
	});

	it("allows sender to cancel a pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("fr-1");

		expect(res.ok).toBe(true);

		const row = testDb
			.select()
			.from(friendRequest)
			.where(eq(friendRequest.id, "fr-1"))
			.get();
		expect(row).toBeUndefined();
	});

	it("prevents receiver from canceling a pending request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "pending");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("fr-1");

		expect(res).toEqual({
			ok: false,
			error: "Only the sender can cancel a pending request",
		});
	});

	it("allows either party to unfriend an accepted request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-2", "user-1", "accepted");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("fr-1");

		expect(res.ok).toBe(true);
	});

	it("returns error for a rejected request", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "rejected");
		setupApiMocks(testDb, "user-1");
		mockNextCache();

		const { removeFriendRequest } = await import("@/lib/actions/friends");

		const res = await removeFriendRequest("fr-1");

		expect(res).toEqual({
			ok: false,
			error: "Cannot delete a rejected request",
		});
	});
});
