import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import db from "@/lib/db";
import { user } from "@/schema/auth";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

const MAGIC_BYTES: Record<string, number[]> = {
	"image/jpeg": [0xff, 0xd8, 0xff],
	"image/png": [0x89, 0x50, 0x4e, 0x47],
	"image/gif": [0x47, 0x49, 0x46, 0x38],
	"image/webp": [0x52, 0x49, 0x46, 0x46],
};

const EXTENSIONS: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
	const expected = MAGIC_BYTES[mimeType];
	if (!expected) return false;
	if (buffer.length < expected.length) return false;
	return expected.every((byte, i) => buffer[i] === byte);
}

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return badRequest("No file provided");
	}

	if (file.size > MAX_AVATAR_SIZE) {
		return badRequest("Avatar size exceeds 5MB limit");
	}

	if (!(file.type in MAGIC_BYTES)) {
		return badRequest("Only JPEG, PNG, GIF or WebP images are allowed");
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	if (!validateMagicBytes(buffer, file.type)) {
		return badRequest("File content does not match declared type");
	}

	const storedName = `${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
	const uploadDir = join(process.cwd(), "data", "uploads", "avatars");

	mkdirSync(uploadDir, { recursive: true });
	writeFileSync(join(uploadDir, storedName), buffer);

	const image = `/api/profile/avatar/${storedName}`;

	await db.update(user).set({ image }).where(eq(user.id, userId));

	return Response.json({ image });
}
