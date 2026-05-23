import { and, desc, eq, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { createConversationSchema } from "@/lib/validation/schemas";
import { conversation, follow, message, user } from "@/schema/auth";

/**
 * GET /api/conversations
 * List all conversations for the current user, ordered by lastMessageAt DESC.
 * Includes partner info, last message preview, and whether the user follows the partner.
 */
export async function GET() {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	// Fetch all conversations where the current user is a participant
	const conversations = db
		.select({
			id: conversation.id,
			userAId: conversation.userAId,
			userBId: conversation.userBId,
			createdAt: conversation.createdAt,
			lastMessageAt: conversation.lastMessageAt,
		})
		.from(conversation)
		.where(
			or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
		)
		.orderBy(desc(conversation.lastMessageAt))
		.all();

	// Get partner IDs
	const partnerIds = conversations.map((c) =>
		c.userAId === userId ? c.userBId : c.userAId,
	);

	if (partnerIds.length === 0) {
		return Response.json({ friends: [], others: [] });
	}

	// Fetch partner user info
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

	// Fetch follow status (who I follow)
	const myFollows = db
		.select({ followedId: follow.followedId })
		.from(follow)
		.where(
			and(
				eq(follow.followerId, userId),
				or(...partnerIds.map((pid) => eq(follow.followedId, pid))),
			),
		)
		.all();

	const followedSet = new Set(myFollows.map((f) => f.followedId));

	// Fetch last message for each conversation using a subquery approach
	const lastMessages = db
		.select({
			conversationId: message.conversationId,
			body: message.body,
			senderId: message.senderId,
			createdAt: message.createdAt,
		})
		.from(message)
		.where(or(...conversations.map((c) => eq(message.conversationId, c.id))))
		.orderBy(desc(message.createdAt))
		.all();

	// Group by conversationId, take the first (latest) for each
	const lastMessageMap = new Map<
		string,
		{ body: string; senderId: string; createdAt: Date | null }
	>();
	for (const msg of lastMessages) {
		if (!lastMessageMap.has(msg.conversationId)) {
			lastMessageMap.set(msg.conversationId, msg);
		}
	}

	// Build results
	const friends: typeof results = [];
	const others: typeof results = [];

	const results = conversations.map((c) => {
		const partnerId = c.userAId === userId ? c.userBId : c.userAId;
		const partner = partnerMap.get(partnerId);
		const lastMsg = lastMessageMap.get(c.id);
		const isFollowed = followedSet.has(partnerId);

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
						body: lastMsg.body,
						senderId: lastMsg.senderId,
						createdAt: lastMsg.createdAt?.getTime() ?? null,
					}
				: null,
			lastMessageAt: c.lastMessageAt?.getTime() ?? null,
			isFollowed,
		};
	});

	for (const item of results) {
		if (item.isFollowed) {
			friends.push(item);
		} else {
			others.push(item);
		}
	}

	return Response.json({ friends, others });
}

/**
 * POST /api/conversations
 * Create or get an existing conversation with another user.
 * Body: { otherUserId: string }
 * Normalizes participant order: userAId = min(id1, id2), userBId = max(id1, id2).
 */
export async function POST(request: Request) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const body: unknown = await request.json();
	const parsed = createConversationSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid input", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { otherUserId } = parsed.data;

	if (otherUserId === userId) {
		return Response.json(
			{ error: "Cannot create a conversation with yourself" },
			{ status: 400 },
		);
	}

	// Verify the other user exists
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
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// Normalize order
	const userAId = userId < otherUserId ? userId : otherUserId;
	const userBId = userId < otherUserId ? otherUserId : userId;

	// Try to find existing conversation
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

	// Create new conversation
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
