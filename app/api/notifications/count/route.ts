import { requireAuth, unauthorized } from "@/lib/api-helpers";
import { getNotificationCount } from "@/lib/notification-helpers";

export async function GET() {
	const auth = await requireAuth();
	if (!auth) return unauthorized();

	const counts = getNotificationCount(auth.userId);
	return Response.json(counts);
}
