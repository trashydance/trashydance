import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

/**
 * Get the current authenticated session from within a route handler.
 * Returns null if the user is not authenticated.
 */
export async function getAuthSession() {
	const session = await getAuth().api.getSession({
		headers: await headers(),
	});
	return session;
}
