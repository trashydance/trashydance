import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Get the current authenticated session from within a route handler.
 * Returns null if the user is not authenticated.
 */
export async function getAuthSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
}
