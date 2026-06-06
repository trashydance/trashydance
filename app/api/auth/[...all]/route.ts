import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { RATE_LIMIT } from "@/lib/constants";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const { POST: authPOST, GET } = toNextJsHandler(auth);

async function POST(request: Request) {
	// Bypass esplicito per i test E2E (gli script e2e* impostano DISABLE_RATE_LIMIT=1)
	if (process.env.DISABLE_RATE_LIMIT !== "1") {
		const ip =
			request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
			"unknown";
		if (
			!rateLimit(`auth:${ip}`, RATE_LIMIT.AUTH_MAX, RATE_LIMIT.AUTH_WINDOW_MS)
		) {
			return rateLimitResponse();
		}
	}
	return authPOST(request);
}

export { GET, POST };
