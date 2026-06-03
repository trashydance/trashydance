import { describe, expect, it } from "vitest";
import {
	getPartnerId,
	getUserLastReadAt,
	isParticipant,
} from "@/lib/conversation-helpers";

const conv = {
	userAId: "user-1",
	userBId: "user-2",
	userALastReadAt: new Date("2025-01-01"),
	userBLastReadAt: new Date("2025-06-01"),
};

describe("getPartnerId", () => {
	it("returns userB when current user is userA", () => {
		expect(getPartnerId(conv, "user-1")).toBe("user-2");
	});

	it("returns userA when current user is userB", () => {
		expect(getPartnerId(conv, "user-2")).toBe("user-1");
	});
});

describe("isParticipant", () => {
	it("returns true for userA", () => {
		expect(isParticipant(conv, "user-1")).toBe(true);
	});

	it("returns true for userB", () => {
		expect(isParticipant(conv, "user-2")).toBe(true);
	});

	it("returns false for non-participant", () => {
		expect(isParticipant(conv, "user-3")).toBe(false);
	});
});

describe("getUserLastReadAt", () => {
	it("returns userA lastReadAt when current user is userA", () => {
		expect(getUserLastReadAt(conv, "user-1")).toEqual(new Date("2025-01-01"));
	});

	it("returns userB lastReadAt when current user is userB", () => {
		expect(getUserLastReadAt(conv, "user-2")).toEqual(new Date("2025-06-01"));
	});

	it("returns null when lastReadAt is null", () => {
		const convNull = { ...conv, userALastReadAt: null, userBLastReadAt: null };
		expect(getUserLastReadAt(convNull, "user-1")).toBeNull();
	});
});
