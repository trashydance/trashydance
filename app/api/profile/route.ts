import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { updateProfileSchema } from "@/lib/validation/schemas";
import { user } from "@/schema/auth";

/**
 * PATCH /api/profile
 * Update the current user's profile.
 * Body: { image?: string }
 */
export async function PATCH(request: Request) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const body: unknown = await request.json();
	const parsed = updateProfileSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid input", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const updates: Record<string, string> = {};
	if (parsed.data.image !== undefined) {
		updates.image = parsed.data.image;
	}

	if (Object.keys(updates).length === 0) {
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	db.update(user).set(updates).where(eq(user.id, userId)).run();

	return Response.json({ ok: true });
}
