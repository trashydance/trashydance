import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { RATE_LIMIT } from "@/lib/constants";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const { POST: authPOST, GET } = toNextJsHandler(auth);

async function POST(request: Request) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
	if (
		!rateLimit(`auth:${ip}`, RATE_LIMIT.AUTH_MAX, RATE_LIMIT.AUTH_WINDOW_MS)
	) {
		return rateLimitResponse();
	}
	return authPOST(request);
}

export { GET, POST };
