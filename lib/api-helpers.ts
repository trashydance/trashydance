import { getAuthSession } from "@/lib/auth-session";

export async function requireAuth() {
	const session = await getAuthSession();
	if (!session?.user) {
		return null;
	}
	return { userId: session.user.id, session };
}

export function unauthorized() {
	return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(resource = "Resource") {
	return Response.json({ error: `${resource} not found` }, { status: 404 });
}

export function forbidden(message = "Forbidden") {
	return Response.json({ error: message }, { status: 403 });
}

export function badRequest(message: string, details?: unknown) {
	return Response.json(
		{ error: message, ...(details ? { details } : {}) },
		{ status: 400 },
	);
}

export function conflict(message: string) {
	return Response.json({ error: message }, { status: 409 });
}
