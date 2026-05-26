import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { findConversationForParticipant } from "@/lib/conversation-helpers";

const MIME_TYPES: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".pdf": "application/pdf",
	".doc": "application/msword",
	".docx":
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xls": "application/vnd.ms-excel",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".ppt": "application/vnd.ms-powerpoint",
	".pptx":
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();
	const { userId } = auth;

	const { path } = await params;

	if (!path || path.length < 2) {
		return badRequest("Invalid path");
	}

	const conversationId = path[0];
	const fileName = path.slice(1).join("/");

	if (fileName.includes("..") || conversationId.includes("..")) {
		return badRequest("Invalid path");
	}

	const conv = findConversationForParticipant(conversationId, userId);
	if (!conv) return notFound("Conversation");

	const filePath = join(
		process.cwd(),
		"data",
		"uploads",
		conversationId,
		fileName,
	);

	if (!existsSync(filePath)) return notFound("File");

	const stat = statSync(filePath);
	const fileBuffer = readFileSync(filePath);

	const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	const originalName = fileName.replace(/^[a-f0-9-]+-/, "");

	return new Response(fileBuffer, {
		headers: {
			"Content-Type": contentType,
			"Content-Length": stat.size.toString(),
			"Content-Disposition": `inline; filename="${originalName}"`,
			"Cache-Control": "private, max-age=86400",
		},
	});
}
