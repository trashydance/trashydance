import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { follow } from "@/schema/auth";

/**
 * DELETE /api/follows/[followedId]
 * Unfollow a user.
 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ followedId: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { followedId } = await params;

	db.delete(follow)
		.where(
			and(eq(follow.followerId, userId), eq(follow.followedId, followedId)),
		)
		.run();

	return Response.json({ ok: true });
}
