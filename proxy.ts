import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const { pathname } = request.nextUrl;
	const isAuthPage = pathname === "/login" || pathname === "/register";

	if ((session && !isAuthPage) || (!session && isAuthPage)) {
		return NextResponse.next();
	}

	if (session) {
		return NextResponse.redirect(new URL("/rooms", request.url));
	}

	return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
	matcher: [
		"/((?!$|api|_next/static|_next/image|.*\\.(?:png|svg|jpg|txt|xml|ico)$).*)",
	],
};
