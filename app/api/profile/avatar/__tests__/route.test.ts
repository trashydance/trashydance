import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_AVATAR_SIZE } from "@/lib/constants";
import { user } from "@/schema/auth";
import { setupApiMocks } from "@/test/api-helpers";
import type { TestDb } from "@/test/db-helpers";
import { createTestDb, seedUsers } from "@/test/db-helpers";

// Avoid touching the real filesystem.
vi.mock("node:fs", () => {
	const mock = { mkdirSync: vi.fn(), writeFileSync: vi.fn() };
	return { ...mock, default: mock };
});

let testDb: TestDb;

beforeEach(() => {
	vi.resetModules();
	testDb = createTestDb();
	seedUsers(testDb);
});

function createAvatarRequest(file?: File): Request {
	const formData = new FormData();
	if (file) formData.append("file", file);
	return new Request("http://localhost:3000/api/profile/avatar", {
		method: "POST",
		body: formData,
	});
}

function pngFile(name = "avatar.png"): File {
	const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02, 0x03]);
	return new File([bytes], name, { type: "image/png" });
}

describe("POST /api/profile/avatar", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { POST } = await import("@/app/api/profile/avatar/route");
		const res = await POST(createAvatarRequest(pngFile()));
		expect(res.status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/profile/avatar/route");
		const res = await POST(createAvatarRequest());
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("No file provided");
	});

	it("returns 400 when the file exceeds MAX_AVATAR_SIZE", async () => {
		setupApiMocks(testDb, "user-2");
		const { POST } = await import("@/app/api/profile/avatar/route");
		const bytes = new Uint8Array(MAX_AVATAR_SIZE + 1);
		bytes.set([0x89, 0x50, 0x4e, 0x47]);
		const file = new File([bytes], "big.png", { type: "image/png" });
		const res = await POST(createAvatarRequest(file));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toMatch(/exceeds/);
	});

	it("returns 400 when the MIME type is not allowed", async () => {
		setupApiMocks(testDb, "user-3");
		const { POST } = await import("@/app/api/profile/avatar/route");
		const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "x.pdf", {
			type: "application/pdf",
		});
		const res = await POST(createAvatarRequest(file));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("Only JPEG, PNG, GIF or WebP images are allowed");
	});

	it("returns 400 when magic bytes do not match the declared MIME type", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/profile/avatar/route");
		// Declared image/png but content carries JPEG magic bytes.
		const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], "x.png", {
			type: "image/png",
		});
		const res = await POST(createAvatarRequest(file));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("File content does not match declared type");
	});

	it("returns 200, updates user.image and responds with { image }", async () => {
		setupApiMocks(testDb, "user-2");
		const { POST } = await import("@/app/api/profile/avatar/route");
		const res = await POST(createAvatarRequest(pngFile()));
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.image).toMatch(/^\/api\/profile\/avatar\/.+\.png$/);

		const row = testDb.select().from(user).where(eq(user.id, "user-2")).get();
		expect(row?.image).toBe(data.image);
	});
});
