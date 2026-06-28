import { describe, expect, it } from "vitest";
import { generateMoulinetteResult } from "../moulinette";

describe("Moulinette Generator", () => {
	it("should generate a valid MoulinetteResult", () => {
		const result = generateMoulinetteResult();

		expect(result).toBeDefined();
		expect(result).toHaveProperty("status");
		expect(result).toHaveProperty("message");
		expect(result).toHaveProperty("icon");

		// Validate status values
		const validStatuses = [
			"ok",
			"ko",
			"segfault",
			"timeout",
			"needs_improvement",
		];
		expect(validStatuses).toContain(result.status);

		// Validate types
		expect(typeof result.message).toBe("string");
		expect(typeof result.icon).toBe("string");

		if (result.score !== undefined) {
			expect(typeof result.score).toBe("number");
			expect(result.score).toBeGreaterThanOrEqual(0);
			expect(result.score).toBeLessThanOrEqual(100);
		}
	});

	it("should return random results from the list over multiple runs", () => {
		const results = new Set<string>();
		// Run 50 times to ensure statistical coverage of random generator
		for (let i = 0; i < 50; i++) {
			const res = generateMoulinetteResult();
			results.add(res.message);
		}
		// Expect to have retrieved more than one unique outcome
		expect(results.size).toBeGreaterThan(1);
	});
});
