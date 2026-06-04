import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import {
	ALLOWED_MIME_TYPES_SET,
	MAX_FILE_SIZE,
	RATE_LIMIT,
	UPLOAD_BASE_DIR,
} from "@/lib/constants";
import { findConversationForParticipant } from "@/lib/conversation-helpers";
import { validateFileContent } from "@/lib/file-validation";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

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
	const conversationId = formData.get("conversationId");

	if (!(file instanceof File)) {
		return badRequest("No file provided");
	}

	if (typeof conversationId !== "string" || !conversationId) {
		return badRequest("conversationId is required");
	}

	if (file.size > MAX_FILE_SIZE) {
		return badRequest(
			`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
		);
	}

	if (!ALLOWED_MIME_TYPES_SET.has(file.type)) {
		return badRequest("File type not allowed");
	}

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const buffer = Buffer.from(await file.arrayBuffer());

	if (!validateFileContent(buffer, file.type)) {
		return badRequest("File content does not match declared type");
	}

	const uuid = crypto.randomUUID();
	const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storedName = `${uuid}-${safeFileName}`;
	const uploadDir = join(process.cwd(), UPLOAD_BASE_DIR, conversationId);

	mkdirSync(uploadDir, { recursive: true });
	writeFileSync(join(uploadDir, storedName), buffer);

	const fileUrl = `/api/uploads/${conversationId}/${storedName}`;

	return Response.json({
		fileName: file.name,
		fileUrl,
		fileType: file.type,
		fileSize: file.size,
	});
}
