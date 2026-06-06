import { describe, expect, it } from "vitest";
import {
	createConversationSchema,
	cursorPaginationSchema,
	friendRequestActionSchema,
	friendRequestSchema,
	loginSchema,
	messageSchema,
	registerSchema,
	searchQuerySchema,
	updateProfileSchema,
} from "@/lib/validation/schemas";

describe("messageSchema", () => {
	it("accepts a valid text message", () => {
		const result = messageSchema.safeParse({ body: "Hello!" });
		expect(result.success).toBe(true);
	});

	it("accepts a file-only message with empty body", () => {
		const result = messageSchema.safeParse({
			body: "",
			fileUrl: "/uploads/file.pdf",
			fileName: "file.pdf",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty body without file", () => {
		const result = messageSchema.safeParse({ body: "" });
		expect(result.success).toBe(false);
	});

	it("rejects body exceeding 2000 characters", () => {
		const result = messageSchema.safeParse({ body: "a".repeat(2001) });
		expect(result.success).toBe(false);
	});

	it("trims whitespace from body", () => {
		const result = messageSchema.safeParse({ body: "  hello  " });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.body).toBe("hello");
		}
	});

	it("rejects whitespace-only body without file", () => {
		const result = messageSchema.safeParse({ body: "   " });
		expect(result.success).toBe(false);
	});

	it("defaults body to empty string when omitted", () => {
		const result = messageSchema.safeParse({
			fileUrl: "/uploads/file.pdf",
		});
		expect(result.success).toBe(true);
	});
});

describe("createConversationSchema", () => {
	it("accepts a valid user ID", () => {
		const result = createConversationSchema.safeParse({
			otherUserId: "user-123",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty user ID", () => {
		const result = createConversationSchema.safeParse({ otherUserId: "" });
		expect(result.success).toBe(false);
	});

	it("rejects missing user ID", () => {
		const result = createConversationSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe("friendRequestSchema", () => {
	it("accepts a valid receiver ID", () => {
		const result = friendRequestSchema.safeParse({
			receiverId: "user-456",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty receiver ID", () => {
		const result = friendRequestSchema.safeParse({ receiverId: "" });
		expect(result.success).toBe(false);
	});
});

describe("friendRequestActionSchema", () => {
	it("accepts 'accept'", () => {
		const result = friendRequestActionSchema.safeParse({ action: "accept" });
		expect(result.success).toBe(true);
	});

	it("accepts 'reject'", () => {
		const result = friendRequestActionSchema.safeParse({ action: "reject" });
		expect(result.success).toBe(true);
	});

	it("rejects invalid action", () => {
		const result = friendRequestActionSchema.safeParse({
			action: "invalid",
		});
		expect(result.success).toBe(false);
	});
});

describe("searchQuerySchema", () => {
	it("accepts a valid query", () => {
		const result = searchQuerySchema.safeParse({ q: "hello" });
		expect(result.success).toBe(true);
	});

	it("defaults to empty string", () => {
		const result = searchQuerySchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.q).toBe("");
		}
	});

	it("rejects query exceeding 100 characters", () => {
		const result = searchQuerySchema.safeParse({ q: "a".repeat(101) });
		expect(result.success).toBe(false);
	});
});

describe("registerSchema", () => {
	const validData = {
		username: "john_doe",
		password: "pass1234",
	};

	it("accepts valid registration data", () => {
		const result = registerSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("rejects username shorter than 3 characters", () => {
		const result = registerSchema.safeParse({ ...validData, username: "ab" });
		expect(result.success).toBe(false);
	});

	it("rejects username longer than 20 characters", () => {
		const result = registerSchema.safeParse({
			...validData,
			username: "a".repeat(21),
		});
		expect(result.success).toBe(false);
	});

	it("rejects username with special characters", () => {
		const result = registerSchema.safeParse({
			...validData,
			username: "john@doe",
		});
		expect(result.success).toBe(false);
	});

	it("accepts username with underscores", () => {
		const result = registerSchema.safeParse({
			...validData,
			username: "john_doe_42",
		});
		expect(result.success).toBe(true);
	});

	it("rejects password shorter than 8 characters", () => {
		const result = registerSchema.safeParse({
			...validData,
			password: "pass1",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without letters", () => {
		const result = registerSchema.safeParse({
			...validData,
			password: "12345678",
		});
		expect(result.success).toBe(false);
	});

	it("rejects password without digits", () => {
		const result = registerSchema.safeParse({
			...validData,
			password: "password",
		});
		expect(result.success).toBe(false);
	});
});

describe("loginSchema", () => {
	it("accepts valid credentials", () => {
		const result = loginSchema.safeParse({
			username: "john_doe",
			password: "pass1234",
		});
		expect(result.success).toBe(true);
	});

	it("rejects empty username", () => {
		const result = loginSchema.safeParse({
			username: "",
			password: "pass1234",
		});
		expect(result.success).toBe(false);
	});

	it("rejects empty password", () => {
		const result = loginSchema.safeParse({
			username: "john_doe",
			password: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("cursorPaginationSchema", () => {
	it("accepts valid pagination with cursor and limit", () => {
		const result = cursorPaginationSchema.safeParse({
			cursor: "100",
			limit: "25",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cursor).toBe(100);
			expect(result.data.limit).toBe(25);
		}
	});

	it("defaults limit to 50 when omitted", () => {
		const result = cursorPaginationSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.limit).toBe(50);
			expect(result.data.cursor).toBeUndefined();
		}
	});

	it("rejects limit above 100", () => {
		const result = cursorPaginationSchema.safeParse({ limit: "101" });
		expect(result.success).toBe(false);
	});

	it("rejects limit below 1", () => {
		const result = cursorPaginationSchema.safeParse({ limit: "0" });
		expect(result.success).toBe(false);
	});
});

describe("updateProfileSchema", () => {
	it("accepts optional image", () => {
		const result = updateProfileSchema.safeParse({
			image: "https://example.com/avatar.jpg",
		});
		expect(result.success).toBe(true);
	});

	it("accepts empty object", () => {
		const result = updateProfileSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});
