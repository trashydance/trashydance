"use server";

import "server-only";

import { and, eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { createConversationSchema } from "@/lib/validation/schemas";
import { conversation, user } from "@/schema";
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
