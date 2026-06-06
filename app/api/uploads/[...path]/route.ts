import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { UPLOAD_BASE_DIR } from "@/lib/constants";
import { findConversationForParticipant } from "@/lib/conversation-helpers";
import { serveStaticFile } from "@/lib/storage";

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

	const originalName = fileName.replace(/^[a-f0-9-]+-/, "");

	const response = serveStaticFile(
		join(process.cwd(), UPLOAD_BASE_DIR, conversationId),
		fileName,
		{ downloadName: originalName },
	);
	if (!response) return notFound("File");

	return response;
}
