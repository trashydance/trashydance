import { and, count, eq, or } from "drizzle-orm";
import db from "@/lib/db";
import { type FriendStatus, getFriendRequestInfo } from "@/lib/friend-helpers";
import { account, friendRequest, user } from "@/schema/auth";

export type ProfileView = {
	id: string;
	name: string;
	lastName: string | null;
	bio: string | null;
	username: string;
	image: string | null;
	intraLogin: string | null;
	createdAt: number;
	friendCount: number;
	friendStatus: FriendStatus;
	friendRequestId: string | null;
	isOwnProfile: boolean;
};

export type GetProfileViewResult =
	| { error: "not_found" }
	| { ok: true; profile: ProfileView };

export function getProfileView(
	currentUserId: string,
	identifier: string,
): GetProfileViewResult {
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
	if (identifier === "me") {
		profileUser = db
			.select(selectFields)
			.from(user)
			.where(eq(user.id, currentUserId))
			.get();
	} else {
		profileUser = db
			.select(selectFields)
			.from(user)
			.where(eq(user.username, identifier))
			.get();
		if (!profileUser) {
			profileUser = db
				.select(selectFields)
				.from(user)
				.where(eq(user.name, identifier))
				.get();
		}
	}

	if (!profileUser) return { error: "not_found" };

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
		ok: true,
		profile: {
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
		},
	};
}
