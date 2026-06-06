import { and, count, desc, eq, gt, or, sql } from "drizzle-orm";
import type { Server as SocketIOServer } from "socket.io";
import { SocketEvent } from "@/lib/constants";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { emitNotificationCount, emitToUser } from "@/lib/socket/emit";
import type { MessageInput } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema";

export function getPartnerId(
	conv: { userAId: string; userBId: string },
	userId: string,
): string {
	return conv.userAId === userId ? conv.userBId : conv.userAId;
}

export function isParticipant(
	conv: { userAId: string; userBId: string },
	userId: string,
): boolean {
	return conv.userAId === userId || conv.userBId === userId;
}

export function getUserLastReadAt(
	conv: {
		userAId: string;
		userBId: string;
		userALastReadAt: Date | null;
		userBLastReadAt: Date | null;
	},
	userId: string,
): Date | null {
	return conv.userAId === userId ? conv.userALastReadAt : conv.userBLastReadAt;
}

export function findConversationForParticipant(
	conversationId: string,
	userId: string,
) {
	return db
		.select()
		.from(conversation)
		.where(
			and(
				eq(conversation.id, conversationId),
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			),
		)
		.get();
}

/**
 * Single write-path for new messages, shared by the REST route and the
 * Socket.IO handler: transactional insert + lastMessageAt update, then
 * real-time fan-out to the partner when a socket server is available.
 */
export function createAndDispatchMessage(
	io: SocketIOServer | null,
	conv: { id: string; userAId: string; userBId: string },
	senderId: string,
	data: MessageInput,
) {
	const id = crypto.randomUUID();
	const now = new Date();

	db.transaction((tx) => {
		tx.insert(message)
			.values({
				id,
				conversationId: conv.id,
				senderId,
				body: data.body || "",
				fileName: data.fileName ?? null,
				fileUrl: data.fileUrl ?? null,
				fileType: data.fileType ?? null,
				fileSize: data.fileSize ?? null,
				createdAt: now,
			})
			.run();

		tx.update(conversation)
			.set({ lastMessageAt: now })
			.where(eq(conversation.id, conv.id))
			.run();
	});

	const newMessage = {
		id,
		conversationId: conv.id,
		senderId,
		body: data.body || "",
		fileName: data.fileName,
		fileUrl: data.fileUrl,
		fileType: data.fileType,
		fileSize: data.fileSize,
		createdAt: now.getTime(),
	};

	if (io) {
		const partnerId = getPartnerId(conv, senderId);
		emitToUser(io, partnerId, SocketEvent.MESSAGE_NEW, newMessage);
		emitNotificationCount(io, partnerId);
	}

	return newMessage;
}

export function getConversationsForUser(userId: string): {
	friends: Array<Record<string, unknown>>;
	others: Array<Record<string, unknown>>;
} {
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

	const results = conversations.map((c) => {
		const partnerId = getPartnerId(c, userId);
		const partner = partnerMap.get(partnerId);
		const lastMsg = lastMessageMap.get(c.id);
		const isFriend = friendSet.has(partnerId);
		const unreadCount = unreadMap.get(c.id) ?? 0;

		return {
			id: c.id,
			partner: partner
				? {
						id: partner.id,
						name: partner.name,
						username: partner.username,
						image: partner.image,
					}
				: null,
			lastMessage: lastMsg
				? {
						body: lastMsg.body ?? "",
						senderId: lastMsg.senderId,
						createdAt: lastMsg.createdAt?.getTime() ?? null,
					}
				: null,
			lastMessageAt: c.lastMessageAt?.getTime() ?? null,
			isFriend,
			unreadCount,
		};
	});

	const friends = results.filter((item) => item.isFriend);
	const others = results.filter(
		(item) => !item.isFriend && item.lastMessage !== null,
	);

	return { friends, others };
}

type ConversationPartner = {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
};

export type GetOrCreateConversationResult =
	| { error: "self" | "user_not_found" }
	| {
			ok: true;
			created: boolean;
			conversation: {
				id: string;
				partner: ConversationPartner;
				createdAt: Date | null;
				lastMessageAt: Date | null;
			};
	  };

export function getOrCreateConversation(
	userId: string,
	otherUserId: string,
): GetOrCreateConversationResult {
	if (otherUserId === userId) {
		return { error: "self" };
	}

	const otherUser = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, otherUserId))
		.get();

	if (!otherUser) {
		return { error: "user_not_found" };
	}

	const userAId = userId < otherUserId ? userId : otherUserId;
	const userBId = userId < otherUserId ? otherUserId : userId;

	const existing = db
		.select()
		.from(conversation)
		.where(
			and(eq(conversation.userAId, userAId), eq(conversation.userBId, userBId)),
		)
		.get();

	if (existing) {
		return {
			ok: true,
			created: false,
			conversation: {
				id: existing.id,
				partner: otherUser,
				createdAt: existing.createdAt,
				lastMessageAt: existing.lastMessageAt,
			},
		};
	}

	const newId = crypto.randomUUID();
	const now = new Date();

	// conversation_pair_idx is unique: a concurrent POST may have created the
	// pair between our select and this insert. Fall back to the winner's row.
	const inserted = db
		.insert(conversation)
		.values({
			id: newId,
			userAId,
			userBId,
			createdAt: now,
			lastMessageAt: now,
		})
		.onConflictDoNothing()
		.run();

	if (inserted.changes === 0) {
		const raced = db
			.select()
			.from(conversation)
			.where(
				and(
					eq(conversation.userAId, userAId),
					eq(conversation.userBId, userBId),
				),
			)
			.get();
		if (raced) {
			return {
				ok: true,
				created: false,
				conversation: {
					id: raced.id,
					partner: otherUser,
					createdAt: raced.createdAt,
					lastMessageAt: raced.lastMessageAt,
				},
			};
		}
	}

	return {
		ok: true,
		created: true,
		conversation: {
			id: newId,
			partner: otherUser,
			createdAt: now,
			lastMessageAt: now,
		},
	};
}
