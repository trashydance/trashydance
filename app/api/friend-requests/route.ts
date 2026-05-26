import { and, eq, or } from "drizzle-orm";
import {
	badRequest,
	conflict,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { SocketEvent } from "@/lib/constants";
import db from "@/lib/db";
import { emitNotificationCount } from "@/lib/socket/handlers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import { friendRequestSchema } from "@/lib/validation/schemas";
import { friendRequest, user } from "@/schema/auth";

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const body: unknown = await request.json();
	const parsed = friendRequestSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const { receiverId } = parsed.data;

	if (receiverId === userId) {
		return badRequest("Cannot send a friend request to yourself");
	}

	const receiver = db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, receiverId))
		.get();

	if (!receiver) return notFound("User");

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
			return conflict("Already friends");
		} else {
			return conflict("Friend request already pending");
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

	const io = getIO();
	if (io) {
		for (const sid of presence.getSocketIds(receiverId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_NEW, {
				id,
				senderId: userId,
				receiverId,
				status: "pending",
				createdAt: now.getTime(),
			});
		}
		emitNotificationCount(io, receiverId);
	}

	return Response.json(
		{ id, senderId: userId, receiverId, status: "pending" },
		{ status: 201 },
	);
}

export async function GET() {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

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
		const receiverUser = userMap.get(r.receiverId) ?? null;
		const friendUser = r.senderId === userId ? receiverUser : sender;

		const entry = {
			id: r.id,
			senderId: r.senderId,
			receiverId: r.receiverId,
			status: r.status,
			createdAt: r.createdAt?.getTime() ?? null,
			updatedAt: r.updatedAt?.getTime() ?? null,
			sender,
			receiver: receiverUser,
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
