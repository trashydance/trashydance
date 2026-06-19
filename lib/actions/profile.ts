"use server";

import "server-only";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/schemas";
import { user } from "@/schema";
import type { ActionResult } from "./types";

interface UpdateProfileInput {
	image?: string | null;
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
		image: string;
		name: string;
		lastName: string;
		bio: string;
	}> = {};
	if (parsed.data.image !== undefined) {
		updates.image = parsed.data.image;
	}
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
