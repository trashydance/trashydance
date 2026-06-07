import { getAuth } from "@/lib/auth";
import { RATE_LIMIT } from "@/lib/constants";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

async function GET(request: Request) {
	return getAuth().handler(request);
}

async function POST(request: Request) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
	if (
		!rateLimit(`auth:${ip}`, RATE_LIMIT.AUTH_MAX, RATE_LIMIT.AUTH_WINDOW_MS)
	) {
		return rateLimitResponse();
	}
	return getAuth().handler(request);
}

export { GET, POST };
