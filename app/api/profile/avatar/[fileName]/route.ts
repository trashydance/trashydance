import { join } from "node:path";
import {
	badRequest,
	notFound,
	requireAuth,
	unauthorized,
} from "@/lib/api-helpers";
import { AVATAR_UPLOAD_DIR } from "@/lib/constants";
import { serveStaticFile } from "@/lib/storage";

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

	const response = serveStaticFile(
		join(process.cwd(), AVATAR_UPLOAD_DIR),
		fileName,
	);
	if (!response) return notFound("File");

	return response;
}
