import "server-only";

import { eq, or } from "drizzle-orm";
import type { FriendRequestsData } from "@/components/feature/requests/types";
import db from "@/lib/db";
import { friendRequest, user } from "@/schema";

/**
 * All friend requests involving the user, grouped by direction/status:
 * received (pending, user is receiver), sent (pending, user is sender)
 * and accepted (friends).
 */
export async function getFriendRequestsData(
	userId: string,
): Promise<FriendRequestsData> {
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
		return { received: [], sent: [], accepted: [] };
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

	const data: FriendRequestsData = { received: [], sent: [], accepted: [] };

	for (const r of requests) {
		const sender = userMap.get(r.senderId);
		const receiverUser = userMap.get(r.receiverId);
		const friendUser = r.senderId === userId ? receiverUser : sender;

		const base = {
			id: r.id,
			senderId: r.senderId,
			receiverId: r.receiverId,
			status: r.status,
			createdAt: r.createdAt?.getTime() ?? null,
			updatedAt: r.updatedAt?.getTime() ?? null,
		};

		if (r.status === "accepted") {
			if (friendUser) data.accepted.push({ ...base, friend: friendUser });
		} else if (r.status === "pending" && r.receiverId === userId) {
			if (sender) data.received.push({ ...base, sender });
		} else if (r.status === "pending" && r.senderId === userId) {
			if (receiverUser) data.sent.push({ ...base, receiver: receiverUser });
		}
	}

	return data;
}
