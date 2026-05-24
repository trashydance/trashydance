import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getNotificationCount } from "@/lib/notification-helpers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import { friendRequestActionSchema } from "@/lib/validation/schemas";
import { friendRequest } from "@/schema/auth";

/**
 * PATCH /api/friend-requests/[id]
 * Accept or reject a friend request. Body: { action: "accept" | "reject" }
 * Only the receiver can accept/reject.
 */
export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id } = await params;

	const body: unknown = await request.json();
	const parsed = friendRequestActionSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid input", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { action } = parsed.data;

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) {
		return Response.json(
			{ error: "Friend request not found" },
			{ status: 404 },
		);
	}

	if (req.receiverId !== userId) {
		return Response.json(
			{ error: "Only the receiver can accept or reject" },
			{ status: 403 },
		);
	}

	if (req.status !== "pending") {
		return Response.json(
			{ error: "Friend request is not pending" },
			{ status: 400 },
		);
	}

	const newStatus = action === "accept" ? "accepted" : "rejected";

	db.update(friendRequest)
		.set({ status: newStatus, updatedAt: new Date() })
		.where(eq(friendRequest.id, id))
		.run();

	const io = getIO();
	if (io) {
		const senderSockets = presence.getSocketIds(req.senderId);
		const senderCounts = getNotificationCount(req.senderId);
		for (const sid of senderSockets) {
			io.to(sid).emit("friend-request:update", {
				id: req.id,
				senderId: req.senderId,
				receiverId: req.receiverId,
				status: newStatus,
			});
			io.to(sid).emit("notification:count", senderCounts);
		}

		const receiverSockets = presence.getSocketIds(userId);
		const receiverCounts = getNotificationCount(userId);
		for (const sid of receiverSockets) {
			io.to(sid).emit("notification:count", receiverCounts);
		}
	}

	return Response.json({ id: req.id, status: newStatus });
}

/**
 * DELETE /api/friend-requests/[id]
 * Cancel (if pending and sender) or unfriend (if accepted).
 */
export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id } = await params;

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) {
		return Response.json(
			{ error: "Friend request not found" },
			{ status: 404 },
		);
	}

	// Pending: only the sender can cancel
	if (req.status === "pending" && req.senderId !== userId) {
		return Response.json(
			{ error: "Only the sender can cancel a pending request" },
			{ status: 403 },
		);
	}

	// Accepted: either party can unfriend
	if (
		req.status === "accepted" &&
		req.senderId !== userId &&
		req.receiverId !== userId
	) {
		return Response.json({ error: "Forbidden" }, { status: 403 });
	}

	// Rejected: cannot delete
	if (req.status === "rejected") {
		return Response.json(
			{ error: "Cannot delete a rejected request" },
			{ status: 400 },
		);
	}

	const otherUserId = req.senderId === userId ? req.receiverId : req.senderId;

	db.delete(friendRequest).where(eq(friendRequest.id, id)).run();

	const io = getIO();
	if (io) {
		const otherSockets = presence.getSocketIds(otherUserId);
		const otherCounts = getNotificationCount(otherUserId);
		for (const sid of otherSockets) {
			io.to(sid).emit("friend-request:update", {
				id,
				senderId: req.senderId,
				receiverId: req.receiverId,
				status: "none",
			});
			io.to(sid).emit("notification:count", otherCounts);
		}

		const mySockets = presence.getSocketIds(userId);
		const myCounts = getNotificationCount(userId);
		for (const sid of mySockets) {
			io.to(sid).emit("notification:count", myCounts);
		}
	}

	return Response.json({ ok: true });
}
