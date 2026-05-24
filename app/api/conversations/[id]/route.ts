import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import { conversation, user } from "@/schema/auth";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id } = await params;

	const conv = db
		.select()
		.from(conversation)
		.where(eq(conversation.id, id))
		.get();

	if (!conv) {
		return Response.json({ error: "Not found" }, { status: 404 });
	}

	if (conv.userAId !== userId && conv.userBId !== userId) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	const partnerId = conv.userAId === userId ? conv.userBId : conv.userAId;

	const partner = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, partnerId))
		.get();

	const { status: friendStatus, requestId: friendRequestId } =
		getFriendRequestInfo(userId, partnerId);

	return Response.json({
		id: conv.id,
		partner: partner
			? {
					id: partner.id,
					name: partner.name,
					username: partner.username ?? partner.name,
					image: partner.image,
				}
			: null,
		friendStatus,
		friendRequestId,
		currentUserId: userId,
		createdAt: conv.createdAt?.getTime() ?? null,
		lastMessageAt: conv.lastMessageAt?.getTime() ?? null,
	});
}
