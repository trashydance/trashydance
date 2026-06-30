import { describe, expect, it } from "vitest";
import { formatWithNorminette, formatWithNorminetteLight } from "../norminette";

describe("Norminette Formatter", () => {
	describe("formatWithNorminette", () => {
		it("should return empty string for empty input", () => {
			expect(formatWithNorminette("")).toBe("");
		});

		it("should capitalize the first letter of the text and append semicolon", () => {
			expect(formatWithNorminette("hello world")).toBe("Hello world;");
		});

		it("should remove double/multiple spaces and replace with a single space", () => {
			expect(formatWithNorminette("hello   world  how   are you")).toBe(
				"Hello world how are you;",
			);
		});

		it("should trim leading and trailing spaces", () => {
			expect(formatWithNorminette("  Hello world  ")).toBe("Hello world;");
		});

		it("should not append warning if line is exactly 80 characters after adding semicolon", () => {
			const text79 = "A".repeat(79);
			expect(formatWithNorminette(text79)).toBe(`${text79};`);
		});

		it("should append warning if line exceeds 80 characters after adding semicolon", () => {
			const text80 = "A".repeat(80);
			const expected = `${"A".repeat(80)} [Norme Error: line too long]\n;`;
			expect(formatWithNorminette(text80)).toBe(expected);
		});
	});

	describe("formatWithNorminetteLight", () => {
		it("should return empty string for empty input", () => {
			expect(formatWithNorminetteLight("")).toBe("");
		});

		it("should capitalize the first letter, clean double spaces, append semicolon but never warning", () => {
			const textOver80 = `${"a".repeat(100)}   ${"b".repeat(10)}`;
			const result = formatWithNorminetteLight(textOver80);
			expect(result).toBe(`A${"a".repeat(99)} ${"b".repeat(10)};`);
			expect(result).not.toContain("[Norme Error");
		});
	});
});
