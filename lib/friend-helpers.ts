import { and, eq, or } from "drizzle-orm";
import { friendRequest, user } from "@/schema/auth";
import db from "./db";

export type FriendStatus =
	| "none"
	| "pending_sent"
	| "pending_received"
	| "friends";

export function getFriendRequestInfo(
	userId: string,
	otherUserId: string,
): { status: FriendStatus; requestId: string | null } {
	const request = db
		.select()
		.from(friendRequest)
		.where(
			or(
				and(
					eq(friendRequest.senderId, userId),
					eq(friendRequest.receiverId, otherUserId),
				),
				and(
					eq(friendRequest.senderId, otherUserId),
					eq(friendRequest.receiverId, userId),
				),
			),
		)
		.get();

	if (!request) return { status: "none", requestId: null };
	if (request.status === "accepted")
		return { status: "friends", requestId: request.id };
	if (request.status === "pending") {
		return {
			status: request.senderId === userId ? "pending_sent" : "pending_received",
			requestId: request.id,
		};
	}
	return { status: "none", requestId: null };
}

export function getFriendStatus(
	userId: string,
	otherUserId: string,
): FriendStatus {
	return getFriendRequestInfo(userId, otherUserId).status;
}

export function isFriend(userId: string, otherUserId: string): boolean {
	return getFriendStatus(userId, otherUserId) === "friends";
}

export function getFriendIds(userId: string): string[] {
	const requests = db
		.select()
		.from(friendRequest)
		.where(
			and(
				or(
					eq(friendRequest.senderId, userId),
					eq(friendRequest.receiverId, userId),
				),
				eq(friendRequest.status, "accepted"),
			),
		)
		.all();
	return requests.map((r) =>
		r.senderId === userId ? r.receiverId : r.senderId,
	);
}

export type CreateFriendRequestResult =
	| {
			ok: true;
			request: {
				id: string;
				senderId: string;
				receiverId: string;
				status: "pending";
				createdAt: Date;
			};
	  }
	| {
			error: "self" | "user_not_found" | "already_friends" | "already_pending";
	  };

export function createFriendRequest(
	senderId: string,
	receiverId: string,
): CreateFriendRequestResult {
	if (receiverId === senderId) {
		return { error: "self" };
	}

	const receiver = db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, receiverId))
		.get();

	if (!receiver) return { error: "user_not_found" };

	const existing = db
		.select()
		.from(friendRequest)
		.where(
			or(
				and(
					eq(friendRequest.senderId, senderId),
					eq(friendRequest.receiverId, receiverId),
				),
				and(
					eq(friendRequest.senderId, receiverId),
					eq(friendRequest.receiverId, senderId),
				),
			),
		)
		.get();

	if (existing) {
		if (existing.status === "rejected") {
			db.delete(friendRequest).where(eq(friendRequest.id, existing.id)).run();
		} else if (existing.status === "accepted") {
			return { error: "already_friends" };
		} else {
			return { error: "already_pending" };
		}
	}

	const id = crypto.randomUUID();
	const now = new Date();

	db.insert(friendRequest)
		.values({
			id,
			senderId,
			receiverId,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		})
		.run();

	return {
		ok: true,
		request: {
			id,
			senderId,
			receiverId,
			status: "pending",
			createdAt: now,
		},
	};
}

export function listFriendRequests(userId: string): {
	received: Array<Record<string, unknown>>;
	sent: Array<Record<string, unknown>>;
	accepted: Array<Record<string, unknown>>;
} {
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

	return { received, sent, accepted };
}

export type RespondToFriendRequestResult =
	| {
			ok: true;
			request: { id: string; senderId: string; receiverId: string };
			newStatus: "accepted" | "rejected";
	  }
	| { error: "not_found" | "forbidden" | "not_pending" };

export function respondToFriendRequest(
	id: string,
	userId: string,
	action: "accept" | "reject",
): RespondToFriendRequestResult {
	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return { error: "not_found" };

	if (req.receiverId !== userId) {
		return { error: "forbidden" };
	}

	if (req.status !== "pending") {
		return { error: "not_pending" };
	}

	const newStatus = action === "accept" ? "accepted" : "rejected";

	// Atomic guard against a concurrent PATCH: only one transition wins.
	const updated = db
		.update(friendRequest)
		.set({ status: newStatus, updatedAt: new Date() })
		.where(and(eq(friendRequest.id, id), eq(friendRequest.status, "pending")))
		.run();

	if (updated.changes === 0) {
		return { error: "not_pending" };
	}

	return {
		ok: true,
		request: {
			id: req.id,
			senderId: req.senderId,
			receiverId: req.receiverId,
		},
		newStatus,
	};
}

export type RemoveFriendRequestResult =
	| {
			ok: true;
			request: { id: string; senderId: string; receiverId: string };
			otherUserId: string;
	  }
	| { error: "not_found" | "rejected" | "conflict" }
	| { error: "forbidden"; detail?: string };

export function removeFriendRequest(
	id: string,
	userId: string,
): RemoveFriendRequestResult {
	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return { error: "not_found" };

	if (req.status === "pending" && req.senderId !== userId) {
		return {
			error: "forbidden",
			detail: "Only the sender can cancel a pending request",
		};
	}

	if (
		req.status === "accepted" &&
		req.senderId !== userId &&
		req.receiverId !== userId
	) {
		return { error: "forbidden" };
	}

	if (req.status === "rejected") {
		return { error: "rejected" };
	}

	const otherUserId = req.senderId === userId ? req.receiverId : req.senderId;

	// Status-conditioned delete: a concurrent transition invalidates this one.
	const deleted = db
		.delete(friendRequest)
		.where(and(eq(friendRequest.id, id), eq(friendRequest.status, req.status)))
		.run();

	if (deleted.changes === 0) {
		return { error: "conflict" };
	}

	return {
		ok: true,
		request: {
			id: req.id,
			senderId: req.senderId,
			receiverId: req.receiverId,
		},
		otherUserId,
	};
}
