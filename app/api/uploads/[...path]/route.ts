import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { and, eq, or } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth-session";
import db from "@/lib/db";
import { conversation } from "@/schema/auth";

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
	const session = await getAuthSession();
	if (!session?.user) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}
	const userId = session.user.id;

	const { path } = await params;

	if (!path || path.length < 2) {
		return Response.json({ error: "Invalid path" }, { status: 400 });
	}

	const conversationId = path[0];
	const fileName = path.slice(1).join("/");

	// Prevent directory traversal
	if (fileName.includes("..") || conversationId.includes("..")) {
		return Response.json({ error: "Invalid path" }, { status: 400 });
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

	const filePath = join(
		process.cwd(),
		"data",
		"uploads",
		conversationId,
		fileName,
	);

	if (!existsSync(filePath)) {
		return Response.json({ error: "File not found" }, { status: 404 });
	}

	const stat = statSync(filePath);
	const fileBuffer = readFileSync(filePath);

	// Determine content type from extension
	const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	// Extract original filename (strip uuid- prefix)
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
