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
			return next(new Error("Authentication required"));
		}

		// Build a minimal Headers object so better-auth can read the cookie
		const headers = new Headers();
		headers.set("cookie", cookieHeader);

		const sessionResult = await auth.api.getSession({ headers });
		if (!sessionResult?.session || !sessionResult?.user) {
			return next(new Error("Invalid session"));
		}

		socket.data.userId = sessionResult.user.id;
		socket.data.user = sessionResult.user;
		next();
	} catch {
		next(new Error("Authentication failed"));
	}
}
