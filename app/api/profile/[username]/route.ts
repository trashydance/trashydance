import { and, count, eq, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import { friendRequest, user } from "@/schema/auth";

/**
 * GET /api/profile/[username]
 * Public profile for a user by username.
 * Returns user info, friend count, and friend status with the current user.
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

	let profileUser:
		| {
				id: string;
				name: string;
				username: string | null;
				image: string | null;
				createdAt: Date;
		  }
		| undefined;
	if (profileUsername === "me") {
		profileUser = db
			.select({
				id: user.id,
				name: user.name,
				username: user.username,
				image: user.image,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, currentUserId))
			.get();
	} else {
		profileUser = db
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
			profileUser = db
				.select({
					id: user.id,
					name: user.name,
					username: user.username,
					image: user.image,
					createdAt: user.createdAt,
				})
				.from(user)
				.where(eq(user.name, profileUsername))
				.get();
		}
	}

	if (!profileUser) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// Count accepted friend requests (where user is sender or receiver)
	const friendCountResult = db
		.select({ value: count() })
		.from(friendRequest)
		.where(
			and(
				eq(friendRequest.status, "accepted"),
				or(
					eq(friendRequest.senderId, profileUser.id),
					eq(friendRequest.receiverId, profileUser.id),
				),
			),
		)
		.get();

	const { status: friendStatus, requestId: friendRequestId } =
		currentUserId !== profileUser.id
			? getFriendRequestInfo(currentUserId, profileUser.id)
			: { status: "none" as const, requestId: null };

	return Response.json({
		id: profileUser.id,
		name: profileUser.name,
		username: profileUser.username ?? profileUser.name,
		image: profileUser.image,
		createdAt: profileUser.createdAt.getTime(),
		friendCount: friendCountResult?.value ?? 0,
		friendStatus,
		friendRequestId,
		isOwnProfile: profileUser.id === currentUserId,
	});
}
