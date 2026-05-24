import { and, like, ne, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getFriendIds } from "@/lib/friend-helpers";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { user } from "@/schema/auth";

/**
 * GET /api/users/search?q=...
 * Search users by username (case-insensitive LIKE).
 * Returns results grouped by friend status. Excludes the current user.
 */
export async function GET(request: NextRequest) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const parsed = searchQuerySchema.safeParse(searchParams);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid search query", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { q } = parsed.data;

	// If no query, return all users; otherwise filter by name/username
	const users = q.trim()
		? db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
				})
				.from(user)
				.where(
					and(
						ne(user.id, userId),
						or(like(user.username, `%${q}%`), like(user.name, `%${q}%`)),
					),
				)
				.limit(50)
				.all()
		: db
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
		return Response.json({ friends: [], others: [] });
	}

	// Get friend IDs (accepted friend requests)
	const friendIdList = getFriendIds(userId);
	const friendSet = new Set(friendIdList);

	const friends = users.filter((u) => friendSet.has(u.id));
	const others = users.filter((u) => !friendSet.has(u.id));

	return Response.json({ friends, others });
}
