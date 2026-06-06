import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { getAuthSession } from "@/lib/auth-session";

/**
 * Current authenticated user, deduplicated per request via React.cache:
 * layout, page and DAL functions share a single getSession call.
 * Returns null when unauthenticated.
 */
export const getCurrentUser = cache(async () => {
	const session = await getAuthSession();
	return session?.user ?? null;
});

/**
 * Like getCurrentUser, but redirects to /login when unauthenticated.
 * Use in (app) pages: proxy.ts only checks cookie presence, the real
 * session validation happens here.
 */
export const requireUser = cache(async () => {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/login");
	}
	return user;
});
