import { and, eq } from "drizzle-orm";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import db from "@/lib/db";
import { createConversationSchema } from "@/lib/validation/schemas";
import { conversation, user } from "@/schema";

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const body: unknown = await request.json();
	const parsed = createConversationSchema.safeParse(body);
	if (!parsed.success) {
		return badRequest("Invalid input", parsed.error.flatten());
	}

	const { otherUserId } = parsed.data;

	if (otherUserId === userId) {
		return badRequest("Cannot create a conversation with yourself");
	}

	const otherUser = db
		.select({
			id: user.id,
			name: user.name,
			username: user.username,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, otherUserId))
		.get();

	if (!otherUser) {
		return notFound("User");
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
		return Response.json({
			id: existing.id,
			partner: otherUser,
			createdAt: existing.createdAt?.getTime() ?? null,
			lastMessageAt: existing.lastMessageAt?.getTime() ?? null,
			created: false,
		});
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

	return Response.json(
		{
			id: newId,
			partner: otherUser,
			createdAt: now.getTime(),
			lastMessageAt: now.getTime(),
			created: true,
		},
		{ status: 201 },
	);
}
