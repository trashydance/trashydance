import { eq } from "drizzle-orm";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import db from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/schemas";
import { user } from "@/schema";

export async function PATCH(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const body: unknown = await request.json();
	const parsed = updateProfileSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const updates: Partial<{
		image: string | null;
		name: string;
		lastName: string | null;
		bio: string | null;
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
		return badRequest("No fields to update");
	}

	db.update(user).set(updates).where(eq(user.id, userId)).run();

	return Response.json({ ok: true });
}
