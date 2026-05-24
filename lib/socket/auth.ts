import type { Socket } from "socket.io";
import { auth } from "@/lib/auth";

/**
 * Socket.IO authentication middleware.
 * Parses the session cookie from the handshake headers, validates the session
 * via better-auth, and attaches the userId to `socket.data`.
 */
export async function socketAuthMiddleware(
	socket: Socket,
	next: (err?: Error) => void,
): Promise<void> {
	try {
		const cookieHeader = socket.handshake.headers.cookie;
		if (!cookieHeader) {
			console.log("[socket-auth] rejected: no cookie header");
			return next(new Error("Authentication required"));
		}

		// Build a minimal Headers object so better-auth can read the cookie
		const headers = new Headers();
		headers.set("cookie", cookieHeader);

		const sessionResult = await auth.api.getSession({ headers });
		if (!sessionResult?.session || !sessionResult?.user) {
			console.log("[socket-auth] rejected: invalid session");
			return next(new Error("Invalid session"));
		}
		console.log(`[socket-auth] authenticated: ${sessionResult.user.id}`);

		socket.data.userId = sessionResult.user.id;
		socket.data.user = sessionResult.user;
		next();
	} catch (err) {
		console.log("[socket-auth] error:", err);
		next(new Error("Authentication failed"));
	}
}
