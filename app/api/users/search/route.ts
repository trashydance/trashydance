import { and, eq, like, ne, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { requireAuth, unauthorized } from "@/lib/api-helpers";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import { searchQuerySchema } from "@/lib/validation/schemas";
import { user } from "@/schema/auth";

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const parsed = searchQuerySchema.safeParse(searchParams);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid search query", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { q } = parsed.data;

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
						or(
							like(user.username, `%${q}%`),
							like(user.name, `%${q}%`),
							like(user.lastName, `%${q}%`),
						),
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

	const enriched = users.map((u) => {
		const info = getFriendRequestInfo(userId, u.id);
		return {
			...u,
			friendStatus: info.status,
			friendRequestId: info.requestId,
		};
	});

	const friends = enriched.filter((u) => u.friendStatus === "friends");
	const others = enriched.filter((u) => u.friendStatus !== "friends");

	return Response.json({ friends, others });
}
