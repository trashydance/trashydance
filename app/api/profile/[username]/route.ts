import { and, count, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { follow, user } from "@/schema/auth";

/**
 * GET /api/profile/[username]
 * Public profile for a user by username.
 * Returns user info, follower/following counts, and whether the current user follows them.
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const currentUserId = session.user.id;
	const { username: profileUsername } = await params;

	// Find the user by username
	const profileUser = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
			createdAt: user.createdAt,
		})
		.from(user)
		.where(eq(user.username, profileUsername))
		.get();

	if (!profileUser) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// Count followers
	const followerCountResult = db
		.select({ value: count() })
		.from(follow)
		.where(eq(follow.followedId, profileUser.id))
		.get();

	// Count following
	const followingCountResult = db
		.select({ value: count() })
		.from(follow)
		.where(eq(follow.followerId, profileUser.id))
		.get();

	// Check if current user follows this profile
	const isFollowedByMe =
		currentUserId !== profileUser.id
			? !!db
					.select({ id: follow.id })
					.from(follow)
					.where(
						and(
							eq(follow.followerId, currentUserId),
							eq(follow.followedId, profileUser.id),
						),
					)
					.get()
			: false;

	return Response.json({
		id: profileUser.id,
		name: profileUser.name,
		username: profileUser.username,
		image: profileUser.image,
		createdAt: profileUser.createdAt.getTime(),
		followerCount: followerCountResult?.value ?? 0,
		followingCount: followingCountResult?.value ?? 0,
		isFollowedByMe,
	});
}
