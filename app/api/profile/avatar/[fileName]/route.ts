import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { AVATAR_UPLOAD_DIR, MIME_TYPES } from "@/lib/constants";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ fileName: string }> },
) {
	const auth = await requireAuth();
	if (!auth) return unauthorized();

	const { fileName } = await params;

	if (!fileName || fileName.includes("..") || fileName.includes("/")) {
		return badRequest("Invalid path");
	}

	const filePath = join(process.cwd(), AVATAR_UPLOAD_DIR, fileName);

	if (!existsSync(filePath)) return notFound("File");

	const stat = statSync(filePath);
	const fileBuffer = readFileSync(filePath);

	const ext = `.${fileName.split(".").pop()?.toLowerCase() ?? ""}`;
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	return new Response(fileBuffer, {
		headers: {
			"Content-Type": contentType,
			"Content-Length": stat.size.toString(),
			"Cache-Control": "private, max-age=86400",
		},
	});
}
