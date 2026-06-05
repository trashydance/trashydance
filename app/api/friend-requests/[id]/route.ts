import { eq } from "drizzle-orm";
import {
	badRequest,
	forbidden,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { SocketEvent } from "@/lib/constants";
import db from "@/lib/db";
import { emitNotificationCount } from "@/lib/socket/handlers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import { friendRequestActionSchema } from "@/lib/validation/schemas";
import { friendRequest } from "@/schema";

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

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return notFound("Friend request");

	if (req.receiverId !== userId) {
		return forbidden("Only the receiver can accept or reject");
	}

	if (req.status !== "pending") {
		return badRequest("Friend request is not pending");
	}

	const newStatus = action === "accept" ? "accepted" : "rejected";

	db.update(friendRequest)
		.set({ status: newStatus, updatedAt: new Date() })
		.where(eq(friendRequest.id, id))
		.run();

	const io = getIO();
	if (io) {
		const updatePayload = {
			id: req.id,
			senderId: req.senderId,
			receiverId: req.receiverId,
			status: newStatus,
		};
		for (const sid of presence.getSocketIds(req.senderId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		}
		for (const sid of presence.getSocketIds(userId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		}
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

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return notFound("Friend request");

	if (req.status === "pending" && req.senderId !== userId) {
		return forbidden("Only the sender can cancel a pending request");
	}

	if (
		req.status === "accepted" &&
		req.senderId !== userId &&
		req.receiverId !== userId
	) {
		return forbidden();
	}

	if (req.status === "rejected") {
		return badRequest("Cannot delete a rejected request");
	}

	const otherUserId = req.senderId === userId ? req.receiverId : req.senderId;

	db.delete(friendRequest).where(eq(friendRequest.id, id)).run();

	const io = getIO();
	if (io) {
		const updatePayload = {
			id,
			senderId: req.senderId,
			receiverId: req.receiverId,
			status: "none",
		};
		for (const sid of presence.getSocketIds(otherUserId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		}
		for (const sid of presence.getSocketIds(userId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_UPDATE, updatePayload);
		}
		emitNotificationCount(io, otherUserId);
		emitNotificationCount(io, userId);
	}

	return Response.json({ ok: true });
}
