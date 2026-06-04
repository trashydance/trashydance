import { and, desc, eq, like, ne, or } from "drizzle-orm";
import { getPartnerId } from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import { conversation, message, user } from "@/schema/auth";

export function searchConversationsAndMessages(
	userId: string,
	q: string,
): {
	users: Array<Record<string, unknown>>;
	messages: Array<Record<string, unknown>>;
} {
	const pattern = `%${q}%`;

	// Get all conversation IDs for the current user
	const myConversations = db
		.select({
			id: conversation.id,
			userAId: conversation.userAId,
			userBId: conversation.userBId,
		})
		.from(conversation)
		.where(
			or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
		)
		.all();

	if (myConversations.length === 0) {
		return { users: [], messages: [] };
	}

	// Get partner IDs
	const partnerIds = [
		...new Set(myConversations.map((c) => getPartnerId(c, userId))),
	];
	const convIds = myConversations.map((c) => c.id);

	// Search users by username among my conversation partners
	const matchedUsers =
		partnerIds.length > 0
			? db
					.select({
						id: user.id,
						name: user.name,
						username: user.username,
						image: user.image,
					})
					.from(user)
					.where(
						and(
							or(
								like(user.username, pattern),
								like(user.name, pattern),
								like(user.lastName, pattern),
							),
							or(...partnerIds.map((pid) => eq(user.id, pid))),
						),
					)
					.limit(20)
					.all()
			: [];

	// Search messages by body in my conversations
	const matchedMessages =
		convIds.length > 0
			? db
					.select({
						id: message.id,
						conversationId: message.conversationId,
						senderId: message.senderId,
						body: message.body,
						createdAt: message.createdAt,
						senderName: user.name,
						senderUsername: user.username,
					})
					.from(message)
					.innerJoin(user, eq(message.senderId, user.id))
					.where(
						and(
							like(message.body, pattern),
							or(...convIds.map((cid) => eq(message.conversationId, cid))),
						),
					)
					.orderBy(desc(message.createdAt))
					.limit(20)
					.all()
			: [];

	return {
		users: matchedUsers,
		messages: matchedMessages.map((m) => ({
			id: m.id,
			conversationId: m.conversationId,
			senderId: m.senderId,
			body: m.body ?? "",
			createdAt: m.createdAt?.getTime() ?? null,
			sender: {
				name: m.senderName,
				username: m.senderUsername,
			},
		})),
	};
}

export function searchUsers(
	userId: string,
	q: string,
): {
	friends: Array<Record<string, unknown>>;
	others: Array<Record<string, unknown>>;
} {
	const users = q.trim()
		? db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				})
				.from(user)
				.where(
					and(
						ne(user.id, userId),
						or(
							like(user.username, `%${q}%`),
							like(user.name, `%${q}%`),
							like(user.lastName, `%${q}%`),
						),
					),
				)
				.limit(50)
				.all()
		: db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				})
				.from(user)
				.where(ne(user.id, userId))
				.limit(50)
				.all();

	if (users.length === 0) {
		return { friends: [], others: [] };
	}

	const enriched = users.map((u) => {
		const info = getFriendRequestInfo(userId, u.id);
		return {
			...u,
			friendStatus: info.status,
			friendRequestId: info.requestId,
		};
	});

	const friends = enriched.filter((u) => u.friendStatus === "friends");
	const others = enriched.filter((u) => u.friendStatus !== "friends");

	return { friends, others };
}
