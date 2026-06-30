"use server";

import "server-only";

import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/schemas";
import { conversation, friendRequest, message, user } from "@/schema";
import type { ActionResult } from "./types";

interface UpdateProfileInput {
	name?: string | null;
	lastName?: string | null;
	bio?: string | null;
}

export async function updateProfile(
	input: UpdateProfileInput,
): Promise<ActionResult> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	// The edit dialog sends null for cleared fields while the schema is
	// .optional() (undefined only): map null to "" so optional fields can
	// actually be cleared (name stays required: null is treated as absent).
	const candidate: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(input)) {
		if (value === null) {
			if (key !== "name") candidate[key] = "";
		} else if (value !== undefined) {
			candidate[key] = value;
		}
	}

	const parsed = updateProfileSchema.safeParse(candidate);
	if (!parsed.success) {
		return { ok: false, error: "Invalid input" };
	}

	const updates: Partial<{
		name: string;
		lastName: string;
		bio: string;
	}> = {};
	if (parsed.data.name !== undefined) {
		updates.name = parsed.data.name;
	}
	if (parsed.data.lastName !== undefined) {
		updates.lastName = parsed.data.lastName;
	}
	if (parsed.data.bio !== undefined) {
		updates.bio = parsed.data.bio;
	}

	if (Object.keys(updates).length === 0) {
		return { ok: false, error: "No fields to update" };
	}

	db.update(user).set(updates).where(eq(user.id, userId)).run();

	revalidatePath("/profile/[username]", "page");
	revalidatePath("/settings");

	return { ok: true, data: undefined };
}

export async function exportUserData(): Promise<ActionResult<string>> {
	const session = await getAuthSession();
	if (!session?.user) return { ok: false, error: "unauthorized" };
	const userId = session.user.id;

	try {
		// 1. Get profile data
		const profile = db.select().from(user).where(eq(user.id, userId)).get();
		if (!profile) return { ok: false, error: "Profile not found" };

		// 2. Get friend requests
		const requests = db
			.select()
			.from(friendRequest)
			.where(
				or(
					eq(friendRequest.senderId, userId),
					eq(friendRequest.receiverId, userId),
				),
			)
			.all();

		// 3. Get conversations
		const convs = db
			.select()
			.from(conversation)
			.where(
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			)
			.all();

		// 4. Get messages sent by user
		const msgs = db
			.select()
			.from(message)
			.where(eq(message.senderId, userId))
			.all();

		const exportObj = {
			exportedAt: new Date().toISOString(),
			profile: {
				id: profile.id,
				name: profile.name,
				lastName: profile.lastName,
				username: profile.username,
				email: profile.email,
				bio: profile.bio,
				image: profile.image,
				createdAt: profile.createdAt,
			},
			friendRequests: requests.map((r) => ({
				id: r.id,
				senderId: r.senderId,
				receiverId: r.receiverId,
				status: r.status,
				createdAt:
					r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
				updatedAt:
					r.updatedAt instanceof Date ? r.updatedAt.getTime() : r.updatedAt,
			})),
			conversations: convs.map((c) => ({
				id: c.id,
				userAId: c.userAId,
				userBId: c.userBId,
				createdAt:
					c.createdAt instanceof Date ? c.createdAt.getTime() : c.createdAt,
				lastMessageAt:
					c.lastMessageAt instanceof Date
						? c.lastMessageAt.getTime()
						: c.lastMessageAt,
			})),
			messages: msgs.map((m) => ({
				id: m.id,
				conversationId: m.conversationId,
				body: m.body,
				createdAt:
					m.createdAt instanceof Date ? m.createdAt.getTime() : m.createdAt,
			})),
		};

		return { ok: true, data: JSON.stringify(exportObj, null, 2) };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Failed to export data",
		};
	}
}
