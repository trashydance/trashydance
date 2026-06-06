import "server-only";

import { and, count, desc, eq, gt, or, sql } from "drizzle-orm";
import {
	findConversationForParticipant,
	getPartnerId,
	getUserLastReadAt,
} from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendIds, getFriendRequestInfo } from "@/lib/friend-helpers";
import type { Conversation, FriendStatus, Message } from "@/lib/types";
import { conversation, message, user } from "@/schema";

export interface ConversationGroups {
	friends: Conversation[];
	others: Conversation[];
}

/**
 * Conversation list for the home page: partner info, last message and
 * unread count per conversation, grouped into friends/others (others
 * only when a message exists).
 */
export async function getConversationList(
	userId: string,
): Promise<ConversationGroups> {
	const conversations = db
		.select({
			id: conversation.id,
			userAId: conversation.userAId,
			userBId: conversation.userBId,
			createdAt: conversation.createdAt,
			lastMessageAt: conversation.lastMessageAt,
			userALastReadAt: conversation.userALastReadAt,
			userBLastReadAt: conversation.userBLastReadAt,
		})
		.from(conversation)
		.where(
			or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
		)
		.orderBy(desc(conversation.lastMessageAt))
		.all();

	const partnerIds = conversations.map((c) => getPartnerId(c, userId));

	if (partnerIds.length === 0) {
		return { friends: [], others: [] };
	}

	const partners = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(or(...partnerIds.map((pid) => eq(user.id, pid))))
		.all();

	const partnerMap = new Map(partners.map((p) => [p.id, p]));

	const friendIds = getFriendIds(userId);
	const friendSet = new Set(friendIds);

	const conversationIds = conversations.map((c) => c.id);

	// Single query: last message per conversation via correlated subquery
	const lastMessages = db
		.select({
			conversationId: message.conversationId,
			body: message.body,
			senderId: message.senderId,
			createdAt: message.createdAt,
		})
		.from(message)
		.where(
			and(
				or(...conversationIds.map((cid) => eq(message.conversationId, cid))),
				sql`${message.createdAt} = (
					SELECT MAX(m2.created_at) FROM message m2
					WHERE m2.conversation_id = ${message.conversationId}
				)`,
			),
		)
		.all();

	const lastMessageMap = new Map(
		lastMessages.map((m) => [m.conversationId, m]),
	);

	// Single query: unread counts for ALL conversations at once
	const unreadConditions = conversations.map((c) => {
		const partnerId = getPartnerId(c, userId);
		const lastReadAt = getUserLastReadAt(c, userId);
		const conds = [
			eq(message.conversationId, c.id),
			eq(message.senderId, partnerId),
		];
		if (lastReadAt) {
			conds.push(gt(message.createdAt, lastReadAt));
		}
		return and(...conds);
	});

	const unreadResults = db
		.select({
			conversationId: message.conversationId,
			value: count(),
		})
		.from(message)
		.where(or(...unreadConditions))
		.groupBy(message.conversationId)
		.all();

	const unreadMap = new Map(
		unreadResults.map((r) => [r.conversationId, r.value]),
	);

	const results: Conversation[] = [];

	for (const c of conversations) {
		const partnerId = getPartnerId(c, userId);
		const partner = partnerMap.get(partnerId);
		// FK constraints make a missing partner impossible in practice
		if (!partner) continue;

		const lastMsg = lastMessageMap.get(c.id);

		results.push({
			id: c.id,
			partner: {
				id: partner.id,
				name: partner.name,
				username: partner.username,
				image: partner.image,
			},
			lastMessage: lastMsg
				? {
						body: lastMsg.body ?? "",
						senderId: lastMsg.senderId,
						createdAt: lastMsg.createdAt?.getTime() ?? null,
					}
				: null,
			lastMessageAt: c.lastMessageAt?.getTime() ?? null,
			isFriend: friendSet.has(partnerId),
			unreadCount: unreadMap.get(c.id) ?? 0,
		});
	}

	return {
		friends: results.filter((item) => item.isFriend),
		others: results.filter(
			(item) => !item.isFriend && item.lastMessage !== null,
		),
	};
}

export interface ConversationMeta {
	id: string;
	partner: {
		id: string;
		name: string;
		username: string;
		image: string | null;
	};
	friendStatus: FriendStatus;
	friendRequestId: string | null;
	currentUserId: string;
	createdAt: number | null;
	lastMessageAt: number | null;
}

/**
 * Conversation metadata for the chat page header. Returns null when the
 * conversation does not exist and "forbidden" when the user is not a
 * participant.
 */
export async function getConversationMeta(
	userId: string,
	conversationId: string,
): Promise<ConversationMeta | "forbidden" | null> {
	const conv = db
		.select()
		.from(conversation)
		.where(eq(conversation.id, conversationId))
		.get();

	if (!conv) return null;

	if (conv.userAId !== userId && conv.userBId !== userId) {
		return "forbidden";
	}

	const partnerId = getPartnerId(conv, userId);

	const partner = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, partnerId))
		.get();

	if (!partner) return null;

	const { status: friendStatus, requestId: friendRequestId } =
		getFriendRequestInfo(userId, partnerId);

	return {
		id: conv.id,
		partner: {
			id: partner.id,
			name: partner.name,
			username: partner.username ?? partner.name,
			image: partner.image,
		},
		friendStatus,
		friendRequestId,
		currentUserId: userId,
		createdAt: conv.createdAt?.getTime() ?? null,
		lastMessageAt: conv.lastMessageAt?.getTime() ?? null,
	};
}

type ChatMessage = Message & {
	sender: {
		name: string;
		username: string | null;
		image: string | null;
	};
};

export interface InitialMessages {
	messages: ChatMessage[];
	nextCursor: number | null;
	hasMore: boolean;
}

/**
 * First page of messages for the chat page, same query as the cursor
 * pagination GET route but without a cursor. Messages are returned in
 * ASCENDING order, ready to render (the route returns them descending
 * and the client used to reverse them).
 * Returns null when the conversation is missing or the user is not a
 * participant.
 */
export async function getInitialMessages(
	userId: string,
	conversationId: string,
	limit = 50,
): Promise<InitialMessages | null> {
	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return null;

	const rows = db
		.select({
			id: message.id,
			conversationId: message.conversationId,
			senderId: message.senderId,
			body: message.body,
			fileName: message.fileName,
			fileUrl: message.fileUrl,
			fileType: message.fileType,
			fileSize: message.fileSize,
			createdAt: message.createdAt,
			senderName: user.name,
			senderUsername: user.username,
			senderImage: user.image,
		})
		.from(message)
		.innerJoin(user, eq(message.senderId, user.id))
		.where(and(eq(message.conversationId, conversationId)))
		.orderBy(desc(message.createdAt))
		.limit(limit + 1)
		.all();

	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;

	const nextCursor =
		hasMore && items.length > 0
			? (items[items.length - 1].createdAt?.getTime() ?? null)
			: null;

	const messages = items
		.map((m) => ({
			id: m.id,
			conversationId: m.conversationId,
			senderId: m.senderId,
			body: m.body ?? "",
			fileName: m.fileName ?? undefined,
			fileUrl: m.fileUrl ?? undefined,
			fileType: m.fileType ?? undefined,
			fileSize: m.fileSize ?? undefined,
			createdAt: m.createdAt?.getTime() ?? null,
			sender: {
				name: m.senderName,
				username: m.senderUsername,
				image: m.senderImage,
			},
		}))
		.reverse();

	return { messages, nextCursor, hasMore };
}
