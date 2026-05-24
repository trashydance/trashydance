import { and, eq, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getNotificationCount } from "@/lib/notification-helpers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import { friendRequestSchema } from "@/lib/validation/schemas";
import { friendRequest, user } from "@/schema/auth";

/**
 * POST /api/friend-requests
 * Send a friend request. Body: { receiverId: string }
 */
export async function POST(request: Request) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const body: unknown = await request.json();
	const parsed = friendRequestSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid input", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { receiverId } = parsed.data;

	if (receiverId === userId) {
		return Response.json(
			{ error: "Cannot send a friend request to yourself" },
			{ status: 400 },
		);
	}

	// Verify the receiver exists
	const receiver = db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, receiverId))
		.get();

	if (!receiver) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// Check no existing request in either direction
	const existing = db
		.select()
		.from(friendRequest)
		.where(
			or(
				and(
					eq(friendRequest.senderId, userId),
					eq(friendRequest.receiverId, receiverId),
				),
				and(
					eq(friendRequest.senderId, receiverId),
					eq(friendRequest.receiverId, userId),
				),
			),
		)
		.get();

	if (existing) {
		if (existing.status === "rejected") {
			db.delete(friendRequest).where(eq(friendRequest.id, existing.id)).run();
		} else if (existing.status === "accepted") {
			return Response.json({ error: "Already friends" }, { status: 409 });
		} else {
			return Response.json(
				{ error: "Friend request already pending" },
				{ status: 409 },
			);
		}
	}

	const id = crypto.randomUUID();
	const now = new Date();

	db.insert(friendRequest)
		.values({
			id,
			senderId: userId,
			receiverId,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		})
		.run();

	// Emit socket events to receiver
	const io = getIO();
	if (io) {
		const receiverSockets = presence.getSocketIds(receiverId);
		const counts = getNotificationCount(receiverId);
		for (const sid of receiverSockets) {
			io.to(sid).emit("friend-request:new", {
				id,
				senderId: userId,
				receiverId,
				status: "pending",
				createdAt: now.getTime(),
			});
			io.to(sid).emit("notification:count", counts);
		}
	}

	return Response.json(
		{ id, senderId: userId, receiverId, status: "pending" },
		{ status: 201 },
	);
}

/**
 * GET /api/friend-requests
 * Return all friend requests relevant to the current user.
 */
export async function GET() {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const requests = db
		.select()
		.from(friendRequest)
		.where(
			or(
				eq(friendRequest.senderId, userId),
				eq(friendRequest.receiverId, userId),
			),
		)
		.all();

	if (requests.length === 0) {
		return Response.json({ received: [], sent: [], accepted: [] });
	}

	// Collect all user IDs we need to look up
	const userIds = [
		...new Set(requests.flatMap((r) => [r.senderId, r.receiverId])),
	];

	const users = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(or(...userIds.map((uid) => eq(user.id, uid))))
		.all();

	const userMap = new Map(users.map((u) => [u.id, u]));

	const received: Array<Record<string, unknown>> = [];
	const sent: Array<Record<string, unknown>> = [];
	const accepted: Array<Record<string, unknown>> = [];

	for (const r of requests) {
		const sender = userMap.get(r.senderId) ?? null;
		const receiver = userMap.get(r.receiverId) ?? null;
		const friendUser = r.senderId === userId ? receiver : sender;

		const entry = {
			id: r.id,
			senderId: r.senderId,
			receiverId: r.receiverId,
			status: r.status,
			createdAt: r.createdAt?.getTime() ?? null,
			updatedAt: r.updatedAt?.getTime() ?? null,
			sender,
			receiver,
			friend: friendUser,
		};

		if (r.status === "accepted") {
			accepted.push(entry);
		} else if (r.status === "pending" && r.receiverId === userId) {
			received.push(entry);
		} else if (r.status === "pending" && r.senderId === userId) {
			sent.push(entry);
		}
	}

	return Response.json({ received, sent, accepted });
}
