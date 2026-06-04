import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import {
	getConversationsForUser,
	getOrCreateConversation,
} from "@/lib/conversation-helpers";
import { createConversationSchema } from "@/lib/validation/schemas";

export async function GET() {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	return Response.json(getConversationsForUser(userId));
}

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

	const result = getOrCreateConversation(userId, otherUserId);

	if ("error" in result) {
		switch (result.error) {
			case "self":
				return badRequest("Cannot create a conversation with yourself");
			case "user_not_found":
				return notFound("User");
		}
	}

	const { conversation: conv, created } = result;
	const payload = {
		id: conv.id,
		partner: conv.partner,
		createdAt: conv.createdAt?.getTime() ?? null,
		lastMessageAt: conv.lastMessageAt?.getTime() ?? null,
		created,
	};

	return created
		? Response.json(payload, { status: 201 })
		: Response.json(payload);
}
