import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-helpers";
import {
	ALLOWED_AVATAR_MIME_TYPES_SET,
	AVATAR_EXTENSIONS,
	AVATAR_UPLOAD_DIR,
	MAX_AVATAR_SIZE,
	RATE_LIMIT,
} from "@/lib/constants";
import db from "@/lib/db";
import { validateFileContent } from "@/lib/file-validation";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { user } from "@/schema/auth";

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	if (
		!rateLimit(
			`upload:${userId}`,
			RATE_LIMIT.UPLOAD_MAX,
			RATE_LIMIT.UPLOAD_WINDOW_MS,
		)
	) {
		return rateLimitResponse();
	}

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

	if (!validateFileContent(buffer, file.type)) {
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
