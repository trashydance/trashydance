"use server";

import "server-only";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import { SocketEvent } from "@/lib/constants";
import db from "@/lib/db";
import { emitNotificationCount } from "@/lib/socket/emit";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import {
	friendRequestActionSchema,
	friendRequestSchema,
} from "@/lib/validation/schemas";
import { conversation, friendRequest, user } from "@/schema";
import type { ActionResult } from "./types";

interface SendFriendRequestData {
	id: string;
	senderId: string;
	receiverId: string;
	status: "pending";
}

export async function sendFriendRequest(
	receiverId: string,
): Promise<ActionResult<SendFriendRequestData>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	const parsed = friendRequestSchema.safeParse({ receiverId });
	if (!parsed.success) {
		return { ok: false, error: "Invalid input" };
	}

	if (parsed.data.receiverId === userId) {
		return { ok: false, error: "Cannot send a friend request to yourself" };
	}

	const receiver = db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, parsed.data.receiverId))
		.get();

	if (!receiver) return { ok: false, error: "User not found" };

	const existing = db
		.select()
		.from(friendRequest)
		.where(
			or(
				and(
					eq(friendRequest.senderId, userId),
					eq(friendRequest.receiverId, parsed.data.receiverId),
				),
				and(
					eq(friendRequest.senderId, parsed.data.receiverId),
					eq(friendRequest.receiverId, userId),
				),
			),
		)
		.get();

	if (existing) {
		if (existing.status === "rejected") {
			db.delete(friendRequest).where(eq(friendRequest.id, existing.id)).run();
		} else if (existing.status === "accepted") {
			return { ok: false, error: "Already friends" };
		} else {
			return { ok: false, error: "Friend request already pending" };
		}
	}

	const id = crypto.randomUUID();
	const now = new Date();

	db.insert(friendRequest)
		.values({
			id,
			senderId: userId,
			receiverId: parsed.data.receiverId,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		})
		.run();

	const io = getIO();
	if (io) {
		for (const sid of presence.getSocketIds(parsed.data.receiverId)) {
			io.to(sid).emit(SocketEvent.FRIEND_REQUEST_NEW, {
				id,
				senderId: userId,
				receiverId: parsed.data.receiverId,
				status: "pending",
				createdAt: now.getTime(),
			});
		}
		emitNotificationCount(io, parsed.data.receiverId);
	}

	revalidatePath("/friends");
	revalidatePath("/home");

	return {
		ok: true,
		data: {
			id,
			senderId: userId,
			receiverId: parsed.data.receiverId,
			status: "pending",
		},
	};
}

interface RespondFriendRequestData {
	id: string;
	status: "accepted" | "rejected";
}

export async function respondFriendRequest(
	id: string,
	action: "accept" | "reject",
): Promise<ActionResult<RespondFriendRequestData>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	const parsed = friendRequestActionSchema.safeParse({ action });
	if (!parsed.success) {
		return { ok: false, error: "Invalid input" };
	}

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return { ok: false, error: "Friend request not found" };

	if (req.receiverId !== userId) {
		return { ok: false, error: "Only the receiver can accept or reject" };
	}

	if (req.status !== "pending") {
		return { ok: false, error: "Friend request is not pending" };
	}

	const newStatus = parsed.data.action === "accept" ? "accepted" : "rejected";

	db.update(friendRequest)
		.set({ status: newStatus, updatedAt: new Date() })
		.where(eq(friendRequest.id, id))
		.run();

	// New friends must show up on /home right away: create the (empty)
	// conversation on accept if the pair doesn't have one yet.
	if (newStatus === "accepted") {
		const userAId =
			req.senderId < req.receiverId ? req.senderId : req.receiverId;
		const userBId =
			req.senderId < req.receiverId ? req.receiverId : req.senderId;

		const existingConv = db
			.select({ id: conversation.id })
			.from(conversation)
			.where(
				and(
					eq(conversation.userAId, userAId),
					eq(conversation.userBId, userBId),
				),
			)
			.get();

		if (!existingConv) {
			const now = new Date();
			db.insert(conversation)
				.values({
					id: crypto.randomUUID(),
					userAId,
					userBId,
					createdAt: now,
					lastMessageAt: now,
				})
				.run();
		}
	}

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

	revalidatePath("/friends");
	revalidatePath("/home");

	return { ok: true, data: { id: req.id, status: newStatus } };
}

export async function removeFriendRequest(id: string): Promise<ActionResult> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	const req = db
		.select()
		.from(friendRequest)
		.where(eq(friendRequest.id, id))
		.get();

	if (!req) return { ok: false, error: "Friend request not found" };

	if (req.status === "pending" && req.senderId !== userId) {
		return { ok: false, error: "Only the sender can cancel a pending request" };
	}

	if (
		req.status === "accepted" &&
		req.senderId !== userId &&
		req.receiverId !== userId
	) {
		return { ok: false, error: "Forbidden" };
	}

	if (req.status === "rejected") {
		return { ok: false, error: "Cannot delete a rejected request" };
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

	revalidatePath("/friends");
	revalidatePath("/home");

	return { ok: true, data: undefined };
}
