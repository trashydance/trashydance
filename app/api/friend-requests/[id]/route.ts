import {
	badRequest,
	forbidden,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { SocketEvent } from "@/lib/constants";
import {
	removeFriendRequest,
	respondToFriendRequest,
} from "@/lib/friend-helpers";
import { emitNotificationCount, emitToUser } from "@/lib/socket/emit";
import { getIO } from "@/lib/socket/io-instance";
import { friendRequestActionSchema } from "@/lib/validation/schemas";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id } = await params;

	const body: unknown = await request.json();
	const parsed = friendRequestActionSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const { action } = parsed.data;

	const result = respondToFriendRequest(id, userId, action);

	if ("error" in result) {
		switch (result.error) {
			case "not_found":
				return notFound("Friend request");
			case "forbidden":
				return forbidden("Only the receiver can accept or reject");
			case "not_pending":
				return badRequest("Friend request is not pending");
		}
	}

	const { request: req, newStatus } = result;

	const io = getIO();
	if (io) {
		const updatePayload = {
			id: req.id,
			senderId: req.senderId,
			receiverId: req.receiverId,
			status: newStatus,
		};
		emitToUser(
			io,
			req.senderId,
			SocketEvent.FRIEND_REQUEST_UPDATE,
			updatePayload,
		);
		emitToUser(io, userId, SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		emitNotificationCount(io, req.senderId);
		emitNotificationCount(io, userId);
	}

	return Response.json({ id: req.id, status: newStatus });
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id } = await params;

	const result = removeFriendRequest(id, userId);

	if ("error" in result) {
		switch (result.error) {
			case "not_found":
				return notFound("Friend request");
			case "forbidden":
				return result.detail ? forbidden(result.detail) : forbidden();
			case "rejected":
				return badRequest("Cannot delete a rejected request");
			case "conflict":
				return badRequest("Friend request was modified concurrently");
		}
	}

	const { request: req, otherUserId } = result;

	const io = getIO();
	if (io) {
		const updatePayload = {
			id,
			senderId: req.senderId,
			receiverId: req.receiverId,
			status: "none",
		};
		emitToUser(
			io,
			otherUserId,
			SocketEvent.FRIEND_REQUEST_UPDATE,
			updatePayload,
		);
		emitToUser(io, userId, SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		emitNotificationCount(io, otherUserId);
		emitNotificationCount(io, userId);
	}

	return Response.json({ ok: true });
}
