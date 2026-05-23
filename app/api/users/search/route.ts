import { and, eq, like, ne, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { follow, user } from "@/schema/auth";

/**
 * GET /api/users/search?q=...
 * Search users by username (case-insensitive LIKE).
 * Returns results grouped by follow status. Excludes the current user.
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
	const pattern = `%${q}%`;

	// Search users by username, case-insensitive
	const users = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(and(like(user.username, pattern), ne(user.id, userId)))
		.limit(50)
		.all();

	if (users.length === 0) {
		return Response.json({ following: [], notFollowing: [] });
	}

	// Check follow status for all found users
	const userIds = users.map((u) => u.id);
	const myFollows = db
		.select({ followedId: follow.followedId })
		.from(follow)
		.where(
			and(
				eq(follow.followerId, userId),
				or(...userIds.map((uid) => eq(follow.followedId, uid))),
			),
		)
		.all();

	const followedSet = new Set(myFollows.map((f) => f.followedId));

	const following = users.filter((u) => followedSet.has(u.id));
	const notFollowing = users.filter((u) => !followedSet.has(u.id));

	return Response.json({ following, notFollowing });
}
