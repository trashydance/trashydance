import { and, eq, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { getNotificationCount } from "@/lib/notification-helpers";
import { getIO } from "@/lib/socket/io-instance";
import { presence } from "@/lib/socket/presence";
import { conversation } from "@/schema/auth";

/**
 * POST /api/conversations/[id]/read
 * Mark a conversation as read for the current user.
 */
export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;
	const { id } = await params;

	const conv = db
		.select()
		.from(conversation)
		.where(
			and(
				eq(conversation.id, id),
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			),
		)
		.get();

	if (!conv) {
		return Response.json({ error: "Conversation not found" }, { status: 404 });
	}

	const now = new Date();

	if (conv.userAId === userId) {
		db.update(conversation)
			.set({ userALastReadAt: now })
			.where(eq(conversation.id, id))
			.run();
	} else {
		db.update(conversation)
			.set({ userBLastReadAt: now })
			.where(eq(conversation.id, id))
			.run();
	}

	// Emit notification:count update
	const io = getIO();
	if (io) {
		const counts = getNotificationCount(userId);
		const mySockets = presence.getSocketIds(userId);
		for (const sid of mySockets) {
			io.to(sid).emit("notification:count", counts);
		}
	}

	return Response.json({ ok: true });
}
