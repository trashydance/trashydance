import { eq } from "drizzle-orm";
import {
	forbidden,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { getPartnerId } from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { getFriendRequestInfo } from "@/lib/friend-helpers";
import { conversation, user } from "@/schema";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id } = await params;

	const conv = db
		.select()
		.from(conversation)
		.where(eq(conversation.id, id))
		.get();

	if (!conv) return notFound("Conversation");

	if (conv.userAId !== userId && conv.userBId !== userId) {
		return forbidden();
	}

	const partnerId = getPartnerId(conv, userId);

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
