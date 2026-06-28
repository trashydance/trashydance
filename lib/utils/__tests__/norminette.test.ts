import { describe, expect, it } from "vitest";
import { formatWithNorminette, formatWithNorminetteLight } from "../norminette";

describe("Norminette Formatter", () => {
	describe("formatWithNorminette", () => {
		it("should return empty string for empty input", () => {
			expect(formatWithNorminette("")).toBe("");
		});

		it("should capitalize the first letter of the text", () => {
			expect(formatWithNorminette("hello world")).toBe("Hello world");
		});

		it("should remove double/multiple spaces and replace with a single space", () => {
			expect(formatWithNorminette("hello   world  how   are you")).toBe(
				"Hello world how are you",
			);
		});

		it("should trim leading and trailing spaces", () => {
			expect(formatWithNorminette("  Hello world  ")).toBe("Hello world");
		});

		it("should not append warning if line is exactly 80 characters", () => {
			const exact80 = "A".repeat(80);
			expect(formatWithNorminette(exact80)).toBe(exact80);
		});

		it("should append warning if line exceeds 80 characters", () => {
			const text81 = "A".repeat(81);
			const expected = `${"A".repeat(80)} [Norme Error: line too long]\nA`;
			expect(formatWithNorminette(text81)).toBe(expected);
		});
	});

	describe("formatWithNorminetteLight", () => {
		it("should return empty string for empty input", () => {
			expect(formatWithNorminetteLight("")).toBe("");
		});

		it("should capitalize the first letter and clean double spaces but never append warning", () => {
			const textOver80 = `${"a".repeat(100)}   ${"b".repeat(10)}`;
			const result = formatWithNorminetteLight(textOver80);
			expect(result).toBe(`A${"a".repeat(99)} ${"b".repeat(10)}`);
			expect(result).not.toContain("[Norme Error");
		});
	});
});
