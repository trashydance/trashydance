const store = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
	const now = Date.now();
	if (now - lastCleanup < CLEANUP_INTERVAL) return;
	lastCleanup = now;
	for (const [key, record] of store) {
		if (now > record.resetAt) store.delete(key);
	}
}

export function rateLimit(
	key: string,
	maxRequests: number,
	windowMs: number,
): boolean {
	cleanup();
	const now = Date.now();
	const record = store.get(key);

	if (!record || now > record.resetAt) {
		store.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (record.count >= maxRequests) {
		return false;
	}

	record.count++;
	return true;
}

export function rateLimitResponse() {
	return Response.json(
		{ error: "Too many requests. Please try again later." },
		{ status: 429 },
	);
}
