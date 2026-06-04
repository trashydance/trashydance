import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import {
	ALLOWED_AVATAR_MIME_TYPES_SET,
	AVATAR_EXTENSIONS,
	AVATAR_UPLOAD_DIR,
	MAGIC_BYTES,
	MAX_AVATAR_SIZE,
} from "@/lib/constants";
import db from "@/lib/db";
import { user } from "@/schema/auth";

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
		return badRequest(
			`Avatar size exceeds ${MAX_AVATAR_SIZE / 1024 / 1024}MB limit`,
		);
	}

	if (!ALLOWED_AVATAR_MIME_TYPES_SET.has(file.type)) {
		return badRequest("Only JPEG, PNG, GIF or WebP images are allowed");
	}

	const buffer = Buffer.from(await file.arrayBuffer());

	if (!validateMagicBytes(buffer, file.type)) {
		return badRequest("File content does not match declared type");
	}

	const storedName = `${crypto.randomUUID()}.${AVATAR_EXTENSIONS[file.type]}`;
	const uploadDir = join(process.cwd(), AVATAR_UPLOAD_DIR);

	mkdirSync(uploadDir, { recursive: true });
	writeFileSync(join(uploadDir, storedName), buffer);

	const image = `/api/profile/avatar/${storedName}`;

	await db.update(user).set({ image }).where(eq(user.id, userId));

	return Response.json({ image });
}
