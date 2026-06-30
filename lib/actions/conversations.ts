"use server";

import "server-only";

import { and, eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { createConversationSchema } from "@/lib/validation/schemas";
import { conversation, message, user } from "@/schema";
import type { ActionResult } from "./types";

interface CreateConversationData {
	id: string;
	partner: {
		id: string;
		name: string;
		username: string | null;
		image: string | null;
	};
	createdAt: number | null;
	lastMessageAt: number | null;
	created: boolean;
}

export async function createConversation(
	otherUserId: string,
): Promise<ActionResult<CreateConversationData>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	const parsed = createConversationSchema.safeParse({ otherUserId });
	if (!parsed.success) {
		return { ok: false, error: "Invalid input" };
	}

	if (parsed.data.otherUserId === userId) {
		return { ok: false, error: "Cannot create a conversation with yourself" };
	}

	const otherUser = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, parsed.data.otherUserId))
		.get();

	if (!otherUser) {
		return { ok: false, error: "User not found" };
	}

	const userAId = userId < otherUserId ? userId : otherUserId;
	const userBId = userId < otherUserId ? otherUserId : userId;

	const existing = db
		.select()
		.from(conversation)
		.where(
			and(eq(conversation.userAId, userAId), eq(conversation.userBId, userBId)),
		)
		.get();

	if (existing) {
		return {
			ok: true,
			data: {
				id: existing.id,
				partner: otherUser,
				createdAt: existing.createdAt?.getTime() ?? null,
				lastMessageAt: existing.lastMessageAt?.getTime() ?? null,
				created: false,
			},
		};
	}

	const newId = crypto.randomUUID();
	const now = new Date();

	db.insert(conversation)
		.values({
			id: newId,
			userAId,
			userBId,
			createdAt: now,
			lastMessageAt: now,
		})
		.run();

	return {
		ok: true,
		data: {
			id: newId,
			partner: otherUser,
			createdAt: now.getTime(),
			lastMessageAt: now.getTime(),
			created: true,
		},
	};
}

/**
 * Delete all messages in a conversation (Black Hole feature).
 * Only the users in the conversation can delete their messages.
 */
export async function deleteAllConversationMessages(
	conversationId: string,
): Promise<ActionResult<{ deletedCount: number }>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };

	const userId = session.user.id;

	// Verify the user is part of this conversation
	const conv = db
		.select()
		.from(conversation)
		.where(eq(conversation.id, conversationId))
		.get();

	if (!conv) {
		return { ok: false, error: "Conversation not found" };
	}

	if (conv.userAId !== userId && conv.userBId !== userId) {
		return { ok: false, error: "unauthorized" };
	}

	// Delete all messages in this conversation
	const result = db
		.delete(message)
		.where(eq(message.conversationId, conversationId))
		.run();

	return {
		ok: true,
		data: {
			deletedCount: result.changes ?? 0,
		},
	};
}

/**
 * Delete a single message by ID.
 */
export async function deleteMessage(
	messageId: string,
): Promise<ActionResult<{ success: boolean }>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };

	const userId = session.user.id;

	// Verify the message exists
	const msg = db.select().from(message).where(eq(message.id, messageId)).get();

	if (!msg) {
		return { ok: false, error: "Message not found" };
	}

	// Verify the user is part of the conversation this message belongs to
	const conv = db
		.select()
		.from(conversation)
		.where(eq(conversation.id, msg.conversationId))
		.get();

	if (!conv) {
		return { ok: false, error: "Conversation not found" };
	}

	if (conv.userAId !== userId && conv.userBId !== userId) {
		return { ok: false, error: "unauthorized" };
	}

	db.delete(message).where(eq(message.id, messageId)).run();

	return {
		ok: true,
		data: {
			success: true,
		},
	};
}
