import "server-only";

import { and, count, eq, or } from "drizzle-orm";
import { cache } from "react";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import type { Profile } from "@/lib/types";
import { account, friendRequest, user } from "@/schema";

/**
 * Resolve a profile by username ("me" resolves to the current user,
 * other values match username with a fallback on the name column).
 * Returns null when no user matches.
 * Cached per request: page and generateMetadata share one lookup.
 */
export const getProfileByUsername = cache(
	async (
		currentUserId: string,
		profileUsername: string,
	): Promise<Profile | null> => {
		const selectFields = {
			id: user.id,
			name: user.name,
			lastName: user.lastName,
			bio: user.bio,
			username: user.username,
			image: user.image,
			intraLogin: user.intraLogin,
			createdAt: user.createdAt,
		};

		let profileUser:
			| {
					id: string;
					name: string;
					lastName: string | null;
					bio: string | null;
					username: string | null;
					image: string | null;
					intraLogin: string | null;
					createdAt: Date;
			  }
			| undefined;
		if (profileUsername === "me") {
			profileUser = db
				.select(selectFields)
				.from(user)
				.where(eq(user.id, currentUserId))
				.get();
		} else {
			profileUser = db
				.select(selectFields)
				.from(user)
				.where(eq(user.username, profileUsername))
				.get();
			if (!profileUser) {
				profileUser = db
					.select(selectFields)
					.from(user)
					.where(eq(user.name, profileUsername))
					.get();
			}
		}

		if (!profileUser) return null;

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

		let intraLogin = profileUser.intraLogin;
		if (!intraLogin) {
			const fortyTwoAccount = db
				.select({ accountId: account.accountId })
				.from(account)
				.where(
					and(eq(account.userId, profileUser.id), eq(account.providerId, "42")),
				)
				.get();
			if (fortyTwoAccount) {
				intraLogin = fortyTwoAccount.accountId;
			}
		}

		return {
			id: profileUser.id,
			name: profileUser.name,
			lastName: profileUser.lastName,
			bio: profileUser.bio,
			username: profileUser.username ?? profileUser.name,
			image: profileUser.image,
			intraLogin,
			createdAt: profileUser.createdAt.getTime(),
			friendCount: friendCountResult?.value ?? 0,
			friendStatus,
			friendRequestId,
			isOwnProfile: profileUser.id === currentUserId,
		};
	},
);
