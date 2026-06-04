import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { MIME_TYPES, UPLOAD_BASE_DIR } from "@/lib/constants";
import { findConversationForParticipant } from "@/lib/conversation-helpers";

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
		UPLOAD_BASE_DIR,
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
