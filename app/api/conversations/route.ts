import { and, count, desc, eq, gt, or, sql } from "drizzle-orm";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { getPartnerId, getUserLastReadAt } from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { createConversationSchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema/auth";

export async function GET() {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

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
		return Response.json({ friends: [], others: [] });
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

	return Response.json({ friends, others });
}

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const body: unknown = await request.json();
	const parsed = createConversationSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const { otherUserId } = parsed.data;

	if (otherUserId === userId) {
		return badRequest("Cannot create a conversation with yourself");
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
		return notFound("User");
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
		return Response.json({
			id: existing.id,
			partner: otherUser,
			createdAt: existing.createdAt?.getTime() ?? null,
			lastMessageAt: existing.lastMessageAt?.getTime() ?? null,
			created: false,
		});
	}

	const newId = crypto.randomUUID();
	const now = new Date();

	db.insert(conversation)
		.values({
			id: newId,
			userAId,
			userBId,
			createdAt: now,
			lastMessageAt: now,
		})
		.run();

	return Response.json(
		{
			id: newId,
			partner: otherUser,
			createdAt: now.getTime(),
			lastMessageAt: now.getTime(),
			created: true,
		},
		{ status: 201 },
	);
}
