import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { MIME_TYPES } from "@/lib/constants";

/**
 * Serves a file from below `baseDir`, refusing any resolved path that
 * escapes it (path traversal hardening). Returns null when the path is
 * outside the base directory or the file does not exist.
 */
export function serveStaticFile(
	baseDir: string,
	relativePath: string,
	{ downloadName }: { downloadName?: string } = {},
): Response | null {
	const root = resolve(baseDir);
	const filePath = resolve(root, relativePath);
	if (filePath !== root && !filePath.startsWith(root + sep)) return null;

	if (!existsSync(filePath)) return null;

	const stat = statSync(filePath);
	const fileBuffer = readFileSync(filePath);

	const ext = `.${filePath.split(".").pop()?.toLowerCase() ?? ""}`;
	const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

	const headers: Record<string, string> = {
		"Content-Type": contentType,
		"Content-Length": stat.size.toString(),
		"Cache-Control": "private, max-age=86400",
	};
	if (downloadName) {
		headers["Content-Disposition"] = `inline; filename="${downloadName}"`;
	}

	return new Response(fileBuffer, { headers });
}
