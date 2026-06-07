import { eq } from "drizzle-orm";
import { notFound, requireAuth, unauthorized } from "@/lib/api-helpers";
import { findConversationForParticipant } from "@/lib/conversation-helpers";
import db from "@/lib/db";
import { emitNotificationCount } from "@/lib/socket/emit";
import { getIO } from "@/lib/socket/io-instance";
import { conversation } from "@/schema";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;
	const { id } = await params;

	const conv = findConversationForParticipant(id, userId);
	if (!conv) return notFound("Conversation");

	const now = new Date();
	const updateField =
		conv.userAId === userId
			? { userALastReadAt: now }
			: { userBLastReadAt: now };

	db.update(conversation).set(updateField).where(eq(conversation.id, id)).run();

	const io = getIO();
	if (io) {
		emitNotificationCount(io, userId);
	}

	return Response.json({ ok: true });
}
