import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { ALLOWED_MIME_TYPES_SET, MAX_FILE_SIZE } from "@/lib/constants";
import { findConversationForParticipant } from "@/lib/conversation-helpers";

const MAGIC_BYTES: Record<string, number[]> = {
	"image/jpeg": [0xff, 0xd8, 0xff],
	"image/png": [0x89, 0x50, 0x4e, 0x47],
	"image/gif": [0x47, 0x49, 0x46, 0x38],
	"image/webp": [0x52, 0x49, 0x46, 0x46],
	"application/pdf": [0x25, 0x50, 0x44, 0x46],
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
	const expected = MAGIC_BYTES[mimeType];
	if (!expected) return true;
	if (buffer.length < expected.length) return false;
	return expected.every((byte, i) => buffer[i] === byte);
}

export async function POST(request: Request) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

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
		return badRequest("File size exceeds 10MB limit");
	}

	if (!ALLOWED_MIME_TYPES_SET.has(file.type)) {
		return badRequest("File type not allowed");
	}

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const buffer = Buffer.from(await file.arrayBuffer());

	if (!validateMagicBytes(buffer, file.type)) {
		return badRequest("File content does not match declared type");
	}

	const uuid = crypto.randomUUID();
	const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storedName = `${uuid}-${safeFileName}`;
	const uploadDir = join(process.cwd(), "data", "uploads", conversationId);

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
