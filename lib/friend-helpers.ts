import { and, eq, or } from "drizzle-orm";
import { friendRequest } from "@/schema/auth";
import db from "./db";

export type FriendStatus =
	| "none"
	| "pending_sent"
	| "pending_received"
	| "friends";

export function getFriendStatus(
	userId: string,
	otherUserId: string,
): FriendStatus {
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

	if (!request) return "none";
	if (request.status === "accepted") return "friends";
	if (request.status === "pending") {
		return request.senderId === userId ? "pending_sent" : "pending_received";
	}
	return "none";
}

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
