import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupApiMocks } from "@/test/api-helpers";
import type { TestDb } from "@/test/db-helpers";
import { createTestDb, seedConversation, seedUsers } from "@/test/db-helpers";

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

function createUploadRequest(parts: {
	file?: File;
	conversationId?: string;
}): Request {
	const formData = new FormData();
	if (parts.file) formData.append("file", parts.file);
	if (parts.conversationId !== undefined) {
		formData.append("conversationId", parts.conversationId);
	}
	return new Request("http://localhost:3000/api/uploads", {
		method: "POST",
		body: formData,
	});
}

function pngFile(name = "image.png"): File {
	// PNG magic bytes followed by arbitrary payload.
	const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x01, 0x02, 0x03]);
	return new File([bytes], name, { type: "image/png" });
}

describe("POST /api/uploads", () => {
	it("returns 401 when not authenticated", async () => {
		setupApiMocks(testDb, null);
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(createUploadRequest({ file: pngFile() }));
		expect(res.status).toBe(401);
	});

	it("returns 400 when no file is provided", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(createUploadRequest({ conversationId: "conv-1" }));
		expect(res.status).toBe(400);
	});

	it("returns 400 when conversationId is missing", async () => {
		setupApiMocks(testDb, "user-2");
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(createUploadRequest({ file: pngFile() }));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("conversationId is required");
	});

	it("returns 400 when the MIME type is not allowed", async () => {
		setupApiMocks(testDb, "user-3");
		const { POST } = await import("@/app/api/uploads/route");
		// text/plain is not in ALLOWED_MIME_TYPES.
		const file = new File([new Uint8Array([0x01, 0x02])], "note.txt", {
			type: "text/plain",
		});
		const res = await POST(
			createUploadRequest({ file, conversationId: "conv-1" }),
		);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("File type not allowed");
	});

	it("returns 404 when the conversation does not belong to the user", async () => {
		// Conversation between user-2 and user-3; user-1 is not a participant.
		seedConversation(testDb, "conv-1", "user-2", "user-3");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(
			createUploadRequest({ file: pngFile(), conversationId: "conv-1" }),
		);
		expect(res.status).toBe(404);
	});

	it("returns 404 when the conversation does not exist", async () => {
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(
			createUploadRequest({ file: pngFile(), conversationId: "missing" }),
		);
		expect(res.status).toBe(404);
	});

	it("returns 400 when magic bytes do not match the declared MIME type", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/uploads/route");
		// Declared image/png but content carries JPEG magic bytes.
		const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], "x.png", {
			type: "image/png",
		});
		const res = await POST(
			createUploadRequest({ file, conversationId: "conv-1" }),
		);
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("File content does not match declared type");
	});

	it("returns 200 and file metadata for a valid upload", async () => {
		seedConversation(testDb, "conv-1", "user-1", "user-2");
		setupApiMocks(testDb, "user-1");
		const { POST } = await import("@/app/api/uploads/route");
		const res = await POST(
			createUploadRequest({
				file: pngFile("photo.png"),
				conversationId: "conv-1",
			}),
		);
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.fileName).toBe("photo.png");
		expect(data.fileType).toBe("image/png");
		expect(data.fileSize).toBe(7);
		expect(data.fileUrl).toMatch(/^\/api\/uploads\/conv-1\//);
	});
});
