import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js Proxy (replaces middleware in Next 16).
 *
 * Route protection strategy:
 * - Public routes are accessible without authentication.
 * - Protected routes require a session cookie; unauthenticated requests
 *   are redirected to /login.
 * - Authenticated users accessing /login or /register are redirected to /home.
 *
 * We only check for the existence of the session cookie here.
 * Actual session validation happens in API routes and server components.
 */
export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check for the better-auth session token cookie
	const sessionCookie =
		request.cookies.get("better-auth.session_token") ??
		request.cookies.get("__Secure-better-auth.session_token");

	const isAuthenticated = !!sessionCookie;
	const isAuthPage = pathname === "/login" || pathname === "/register";

	// Authenticated users on auth pages → redirect to /home
	if (isAuthenticated && isAuthPage) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Unauthenticated users on protected pages → redirect to /login
	if (!isAuthenticated && !isAuthPage) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * - / (landing page)
		 * - /api/auth/* (better-auth routes)
		 * - /privacy, /terms (legal pages)
		 * - /_next/* (Next.js internals)
		 * - Static files (images, fonts, etc.)
		 */
		"/((?!$|api|_next/static|_next/image|privacy|terms|socket\\.io|.*\\.(?:png|svg|jpg|jpeg|gif|ico|txt|xml|webp|woff2?)$).*)",
	],
};
