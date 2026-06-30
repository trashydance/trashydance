import { describe, expect, it } from "vitest";
import { formatFileSize, formatRelativeTime, truncateText } from "@/lib/utils";

describe("formatRelativeTime", () => {
	it("returns 'just now' for timestamps less than 60 seconds ago", () => {
		const now = Date.now();
		expect(formatRelativeTime(now)).toBe("just now");
		expect(formatRelativeTime(now - 30_000)).toBe("just now");
		expect(formatRelativeTime(now - 59_000)).toBe("just now");
	});

	it("returns minutes ago for 1-59 minutes", () => {
		const now = Date.now();
		expect(formatRelativeTime(now - 60_000)).toBe("1m ago");
		expect(formatRelativeTime(now - 5 * 60_000)).toBe("5m ago");
		expect(formatRelativeTime(now - 59 * 60_000)).toBe("59m ago");
	});

	it("returns hours ago for 1-23 hours", () => {
		const now = Date.now();
		expect(formatRelativeTime(now - 60 * 60_000)).toBe("1h ago");
		expect(formatRelativeTime(now - 12 * 60 * 60_000)).toBe("12h ago");
		expect(formatRelativeTime(now - 23 * 60 * 60_000)).toBe("23h ago");
	});

	it("returns 'yesterday' for 1 day ago", () => {
		const now = Date.now();
		expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe("yesterday");
	});

	it("returns days ago for 2-6 days", () => {
		const now = Date.now();
		expect(formatRelativeTime(now - 2 * 24 * 60 * 60_000)).toBe("2d ago");
		expect(formatRelativeTime(now - 6 * 24 * 60 * 60_000)).toBe("6d ago");
	});

	it("returns a date string for 7+ days ago", () => {
		const now = Date.now();
		const result = formatRelativeTime(now - 7 * 24 * 60 * 60_000);
		expect(result).not.toBe("");
		expect(result).not.toContain("ago");
	});

	it("accepts numeric string input", () => {
		const ts = String(Date.now() - 120_000);
		expect(formatRelativeTime(ts)).toBe("2m ago");
	});

	it("accepts ISO date string input", () => {
		const recent = new Date(Date.now() - 300_000).toISOString();
		expect(formatRelativeTime(recent)).toBe("5m ago");
	});

	it("returns empty string for invalid input", () => {
		expect(formatRelativeTime("not-a-date")).toBe("");
	});

	it("supports Italian translations", () => {
		const now = Date.now();
		expect(formatRelativeTime(now, "it")).toBe("proprio ora");
		expect(formatRelativeTime(now - 120_000, "it")).toBe("2m fa");
		expect(formatRelativeTime(now - 7200_000, "it")).toBe("2h fa");
		expect(formatRelativeTime(now - 86400_000, "it")).toBe("ieri");
		expect(formatRelativeTime(now - 172800_000, "it")).toBe("2g fa");
	});

	it("supports Bulgarian translations", () => {
		const now = Date.now();
		expect(formatRelativeTime(now, "bg")).toBe("току-що");
		expect(formatRelativeTime(now - 120_000, "bg")).toBe("преди 2м");
		expect(formatRelativeTime(now - 7200_000, "bg")).toBe("преди 2ч");
		expect(formatRelativeTime(now - 86400_000, "bg")).toBe("вчера");
		expect(formatRelativeTime(now - 172800_000, "bg")).toBe("преди 2д");
	});
});

describe("truncateText", () => {
	it("returns empty string for null or undefined", () => {
		expect(truncateText(null, 10)).toBe("");
		expect(truncateText(undefined, 10)).toBe("");
	});

	it("returns original string when shorter than maxLength", () => {
		expect(truncateText("hello", 10)).toBe("hello");
		expect(truncateText("hi", 2)).toBe("hi");
	});

	it("truncates and appends ellipsis when longer than maxLength", () => {
		expect(truncateText("hello world", 5)).toBe("hello...");
		expect(truncateText("abcdef", 3)).toBe("abc...");
	});

	it("returns empty string for empty input", () => {
		expect(truncateText("", 10)).toBe("");
	});
});

describe("formatFileSize", () => {
	it("formats bytes", () => {
		expect(formatFileSize(0)).toBe("0 B");
		expect(formatFileSize(512)).toBe("512 B");
		expect(formatFileSize(1023)).toBe("1023 B");
	});

	it("formats kilobytes", () => {
		expect(formatFileSize(1024)).toBe("1.0 KB");
		expect(formatFileSize(1536)).toBe("1.5 KB");
		expect(formatFileSize(1024 * 1023)).toBe("1023.0 KB");
	});

	it("formats megabytes", () => {
		expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
		expect(formatFileSize(10 * 1024 * 1024)).toBe("10.0 MB");
		expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
	});
});
