import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { followSchema } from "@/lib/validation/schemas";
import { follow, user } from "@/schema/auth";

/**
 * POST /api/follows
 * Follow a user. Body: { followedId: string }
 * Idempotent: if the follow already exists, returns 200.
 */
export async function POST(request: Request) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const body: unknown = await request.json();
	const parsed = followSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{ error: "Invalid input", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { followedId } = parsed.data;

	if (followedId === userId) {
		return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
	}

	// Verify the target user exists
	const targetUser = db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, followedId))
		.get();

	if (!targetUser) {
		return Response.json({ error: "User not found" }, { status: 404 });
	}

	// Idempotent: insert or ignore
	db.insert(follow)
		.values({
			id: crypto.randomUUID(),
			followerId: userId,
			followedId,
		})
		.onConflictDoNothing()
		.run();

	return Response.json({ ok: true });
}
