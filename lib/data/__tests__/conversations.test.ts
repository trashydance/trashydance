import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
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
});

describe("getConversationList", () => {
	it("returns empty groups when user has no conversations", async () => {
		setupApiMocks(testDb, "user-1");

		const { getConversationList } = await import("@/lib/data/conversations");

		const data = await getConversationList("user-1");

		expect(data.friends).toEqual([]);
		expect(data.others).toEqual([]);
	});

	it("returns conversations with partner info, last message and unread count", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedMessage(testDb, "msg-1", "conv-1", "user-2", "Hello!");

		setupApiMocks(testDb, "user-1");

		const { getConversationList } = await import("@/lib/data/conversations");

		const data = await getConversationList("user-1");
		const allConvos = [...data.friends, ...data.others];

		expect(allConvos).toHaveLength(1);
		expect(allConvos[0].partner.id).toBe("user-2");
		expect(allConvos[0].lastMessage?.body).toBe("Hello!");
		expect(allConvos[0].unreadCount).toBe(1);
	});

	it("groups friends separately from others", async () => {
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedConversation(testDb, "conv-2", "user-1", "user-3");
		seedMessage(testDb, "msg-1", "conv-2", "user-3", "Hi from a stranger");

		setupApiMocks(testDb, "user-1");

		const { getConversationList } = await import("@/lib/data/conversations");

		const data = await getConversationList("user-1");

		expect(data.friends).toHaveLength(1);
		expect(data.friends[0].partner.id).toBe("user-2");
		expect(data.others).toHaveLength(1);
		expect(data.others[0].partner.id).toBe("user-3");
	});
});

describe("getConversationMeta", () => {
	it("returns null when conversation is not found", async () => {
		setupApiMocks(testDb, "user-1");

		const { getConversationMeta } = await import("@/lib/data/conversations");

		const meta = await getConversationMeta("user-1", "nonexistent");

		expect(meta).toBeNull();
	});

	it('returns "forbidden" when user is not a participant', async () => {
		seedConversation(testDb, "conv-1", "user-2", "user-3");
		setupApiMocks(testDb, "user-1");

		const { getConversationMeta } = await import("@/lib/data/conversations");

		const meta = await getConversationMeta("user-1", "conv-1");

		expect(meta).toBe("forbidden");
	});

	it("returns conversation and partner info", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedFriendRequest(testDb, "fr-1", "user-1", "user-2", "accepted");
		setupApiMocks(testDb, "user-1");

		const { getConversationMeta } = await import("@/lib/data/conversations");

		const meta = await getConversationMeta("user-1", "conv-1");

		expect(meta).not.toBeNull();
		expect(meta).not.toBe("forbidden");
		if (meta === null || meta === "forbidden") return;

		expect(meta.id).toBe("conv-1");
		expect(meta.partner.id).toBe("user-2");
		expect(meta.partner.name).toBe("Bob");
		expect(meta.partner.username).toBe("bob");
		expect(meta.friendStatus).toBe("friends");
		expect(meta.friendRequestId).toBe("fr-1");
		expect(meta.currentUserId).toBe("user-1");
		expect(meta.createdAt).toBeTypeOf("number");
		expect(meta.lastMessageAt).toBeTypeOf("number");
	});
});

describe("getInitialMessages", () => {
	it("returns null when user is not a participant", async () => {
		seedConversation(testDb, "conv-1", "user-2", "user-3");
		setupApiMocks(testDb, "user-1");

		const { getInitialMessages } = await import("@/lib/data/conversations");

		const initial = await getInitialMessages("user-1", "conv-1");

		expect(initial).toBeNull();
	});

	it("returns messages in ascending order with sender info", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		seedMessage(testDb, "msg-1", "conv-1", "user-1", "First", new Date(1000));
		seedMessage(testDb, "msg-2", "conv-1", "user-2", "Second", new Date(2000));

		setupApiMocks(testDb, "user-1");

		const { getInitialMessages } = await import("@/lib/data/conversations");

		const initial = await getInitialMessages("user-1", "conv-1");

		expect(initial).not.toBeNull();
		expect(initial?.messages).toHaveLength(2);
		expect(initial?.messages[0].id).toBe("msg-1");
		expect(initial?.messages[0].createdAt).toBe(1000);
		expect(initial?.messages[1].id).toBe("msg-2");
		expect(initial?.messages[1].sender.username).toBe("bob");
		expect(initial?.hasMore).toBe(false);
		expect(initial?.nextCursor).toBeNull();
	});

	it("paginates with hasMore and nextCursor when over the limit", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		for (let i = 1; i <= 3; i++) {
			seedMessage(
				testDb,
				`msg-${i}`,
				"conv-1",
				"user-2",
				`Message ${i}`,
				new Date(i * 1000),
			);
		}

		setupApiMocks(testDb, "user-1");

		const { getInitialMessages } = await import("@/lib/data/conversations");

		const initial = await getInitialMessages("user-1", "conv-1", 2);

		expect(initial?.messages).toHaveLength(2);
		// Newest two messages, ascending
		expect(initial?.messages.map((m) => m.id)).toEqual(["msg-2", "msg-3"]);
		expect(initial?.hasMore).toBe(true);
		expect(initial?.nextCursor).toBe(2000);
	});
});
