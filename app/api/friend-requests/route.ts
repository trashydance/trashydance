import {
	badRequest,
	conflict,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { SocketEvent } from "@/lib/constants";
import { createFriendRequest, listFriendRequests } from "@/lib/friend-helpers";
import { emitNotificationCount, emitToUser } from "@/lib/socket/emit";
import { getIO } from "@/lib/socket/io-instance";
import { friendRequestSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const body: unknown = await request.json();
	const parsed = friendRequestSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const { receiverId } = parsed.data;

	const result = createFriendRequest(userId, receiverId);

	if ("error" in result) {
		switch (result.error) {
			case "self":
				return badRequest("Cannot send a friend request to yourself");
			case "user_not_found":
				return notFound("User");
			case "already_friends":
				return conflict("Already friends");
			case "already_pending":
				return conflict("Friend request already pending");
		}
	}

	const { request: created } = result;

	const io = getIO();
	if (io) {
		emitToUser(io, receiverId, SocketEvent.FRIEND_REQUEST_NEW, {
			id: created.id,
			senderId: created.senderId,
			receiverId: created.receiverId,
			status: created.status,
			createdAt: created.createdAt.getTime(),
		});
		emitNotificationCount(io, receiverId);
	}

	return Response.json(
		{
			id: created.id,
			senderId: created.senderId,
			receiverId: created.receiverId,
			status: created.status,
		},
		{ status: 201 },
	);
}

export async function GET() {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	return Response.json(listFriendRequests(userId));
}
