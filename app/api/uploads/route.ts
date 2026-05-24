import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { conversation } from "@/schema/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"video/mp4",
	"video/webm",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export async function POST(request: Request) {
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const formData = await request.formData();
	const file = formData.get("file");
	const conversationId = formData.get("conversationId");

	if (!(file instanceof File)) {
		return Response.json({ error: "No file provided" }, { status: 400 });
	}

	if (typeof conversationId !== "string" || !conversationId) {
		return Response.json(
			{ error: "conversationId is required" },
			{ status: 400 },
		);
	}

	// Validate file size
	if (file.size > MAX_FILE_SIZE) {
		return Response.json(
			{ error: "File size exceeds 10MB limit" },
			{ status: 400 },
		);
	}

	// Validate MIME type
	if (!ALLOWED_MIME_TYPES.has(file.type)) {
		return Response.json({ error: "File type not allowed" }, { status: 400 });
	}

	// Verify user is a participant
	const conv = db
		.select()
		.from(conversation)
		.where(
			and(
				eq(conversation.id, conversationId),
				or(eq(conversation.userAId, userId), eq(conversation.userBId, userId)),
			),
		)
		.get();

	if (!conv) {
		return Response.json({ error: "Conversation not found" }, { status: 404 });
	}

	// Save file to disk
	const uuid = crypto.randomUUID();
	const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storedName = `${uuid}-${safeFileName}`;
	const uploadDir = join(process.cwd(), "data", "uploads", conversationId);

	mkdirSync(uploadDir, { recursive: true });

	const buffer = Buffer.from(await file.arrayBuffer());
	writeFileSync(join(uploadDir, storedName), buffer);

	const fileUrl = `/api/uploads/${conversationId}/${storedName}`;

	return Response.json({
		fileName: file.name,
		fileUrl,
		fileType: file.type,
		fileSize: file.size,
	});
}
