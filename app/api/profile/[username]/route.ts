import { notFound, requireAuth, unauthorized } from "@/lib/api-helpers";
import { getProfileView } from "@/lib/profile-helpers";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ username: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const currentUserId = auth.userId;
	const { username: profileUsername } = await params;

	const result = getProfileView(currentUserId, profileUsername);

	if ("error" in result) {
		return notFound("User");
	}

	return Response.json(result.profile);
}
