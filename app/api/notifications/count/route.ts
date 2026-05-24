import { getAuthSession } from "@/lib/auth-session";
import { getNotificationCount } from "@/lib/notification-helpers";

/**
 * GET /api/notifications/count
 * Return { pendingRequests: N, unreadChats: N }
 */
export async function GET() {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const counts = getNotificationCount(session.user.id);
	return Response.json(counts);
}
