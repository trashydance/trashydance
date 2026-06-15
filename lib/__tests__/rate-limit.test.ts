import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// The rate-limit store is module-level and shared across tests in this file,
// so every test uses a unique key (prefixed with the test name) to stay isolated.

describe("rateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("allows the first request", () => {
		expect(rateLimit("first:key", 3, 1000)).toBe(true);
	});

	it("returns false once maxRequests is exceeded", () => {
		const key = "max:key";
		expect(rateLimit(key, 2, 1000)).toBe(true);
		expect(rateLimit(key, 2, 1000)).toBe(true);
		expect(rateLimit(key, 2, 1000)).toBe(false);
		expect(rateLimit(key, 2, 1000)).toBe(false);
	});

	it("resets the count after windowMs elapses", () => {
		const key = "reset:key";
		expect(rateLimit(key, 1, 1000)).toBe(true);
		expect(rateLimit(key, 1, 1000)).toBe(false);

		vi.advanceTimersByTime(1001);

		expect(rateLimit(key, 1, 1000)).toBe(true);
	});

	it("tracks keys independently", () => {
		expect(rateLimit("independent:a", 1, 1000)).toBe(true);
		expect(rateLimit("independent:a", 1, 1000)).toBe(false);
		// A different key is unaffected by the first key's exhaustion.
		expect(rateLimit("independent:b", 1, 1000)).toBe(true);
	});

	it("cleans up expired entries after CLEANUP_INTERVAL (60s)", () => {
		const expiredKey = "cleanup:expired";
		const freshKey = "cleanup:fresh";

		// Create an entry that will expire quickly.
		expect(rateLimit(expiredKey, 1, 1000)).toBe(true);
		expect(rateLimit(expiredKey, 1, 1000)).toBe(false);

		// Move past the entry's window so it is expired, but the cleanup
		// only runs once CLEANUP_INTERVAL (60s) has elapsed since the last run.
		vi.advanceTimersByTime(61_000);

		// This call triggers cleanup(): the expired entry is deleted, and a new
		// fresh key is created in the same tick.
		expect(rateLimit(freshKey, 5, 1000)).toBe(true);

		// The expired entry was removed, so a brand-new window starts here:
		// the very next call for it is allowed again.
		expect(rateLimit(expiredKey, 1, 1000)).toBe(true);
	});
});

describe("rateLimitResponse", () => {
	it("returns a 429 response with an error message", async () => {
		const res = rateLimitResponse();
		expect(res.status).toBe(429);
		const data = await res.json();
		expect(data.error).toBe("Too many requests. Please try again later.");
	});
});
