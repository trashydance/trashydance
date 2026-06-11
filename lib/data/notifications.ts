import "server-only";

import { getNotificationCount } from "@/lib/notification-helpers";

export interface NotificationCounts {
	pendingRequests: number;
	unreadChats: number;
}

/**
 * DAL entry point for notification counts. The underlying helper stays
 * in lib/notification-helpers.ts because socket handlers (outside the
 * RSC runtime) use it too.
 */
export async function getNotificationCounts(
	userId: string,
): Promise<NotificationCounts> {
	return getNotificationCount(userId);
}
