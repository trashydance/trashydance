import "server-only";

import { ne } from "drizzle-orm";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import type { SearchUser } from "@/lib/types";
import { user } from "@/schema";

/**
 * Initial user list for the search page (everyone except the current
 * user, capped at 50), enriched with friend status and grouped into
 * friends/others. Filtering by query happens client-side.
 */
export async function getInitialUserList(userId: string): Promise<{
	friends: SearchUser[];
	others: SearchUser[];
}> {
	const users = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(ne(user.id, userId))
		.limit(50)
		.all();

	if (users.length === 0) {
		return { friends: [], others: [] };
	}

	const enriched: SearchUser[] = users.map((u) => {
		const info = getFriendRequestInfo(userId, u.id);
		return {
			...u,
			friendStatus: info.status,
			friendRequestId: info.requestId,
		};
	});

	return {
		friends: enriched.filter((u) => u.friendStatus === "friends"),
		others: enriched.filter((u) => u.friendStatus !== "friends"),
	};
}
