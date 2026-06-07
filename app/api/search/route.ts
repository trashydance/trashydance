import type { NextRequest } from "next/server";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import { searchConversationsAndMessages } from "@/lib/search-helpers";
import { searchQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const searchParams = Object.fromEntries(request.nextUrl.searchParams);
	const parsed = searchQuerySchema.safeParse(searchParams);
	if (!parsed.success) {
		return badRequest("Invalid search query", parsed.error.flatten());
	}

	const { q } = parsed.data;

	return Response.json(searchConversationsAndMessages(userId, q));
}
