import { and, count, eq, lt, or, sql } from "drizzle-orm";
import { conversation, friendRequest } from "@/schema";
import db from "./db";

export function getNotificationCount(userId: string): {
	pendingRequests: number;
	unreadChats: number;
} {
	// Count pending friend requests received
	const pendingResult = db
		.select({ value: count() })
		.from(friendRequest)
		.where(
			and(
				eq(friendRequest.receiverId, userId),
				eq(friendRequest.status, "pending"),
			),
		)
		.get();

	// Count conversations where lastMessageAt > user's lastReadAt
	const unreadResult = db
		.select({ value: count() })
		.from(conversation)
		.where(
			or(
				and(
					eq(conversation.userAId, userId),
					or(
						sql`${conversation.userALastReadAt} IS NULL`,
						lt(conversation.userALastReadAt, conversation.lastMessageAt),
					),
				),
				and(
					eq(conversation.userBId, userId),
					or(
						sql`${conversation.userBLastReadAt} IS NULL`,
						lt(conversation.userBLastReadAt, conversation.lastMessageAt),
					),
				),
			),
		)
		.get();

	return {
		pendingRequests: pendingResult?.value ?? 0,
		unreadChats: unreadResult?.value ?? 0,
	};
}
