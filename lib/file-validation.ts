import { MAGIC_BYTES } from "@/lib/constants";

/**
 * Verifies that the file content matches its declared MIME type when a
 * binary signature is known. Types without a known signature pass the check:
 * callers MUST whitelist the MIME type before invoking this.
 */
export function validateFileContent(buffer: Buffer, mimeType: string): boolean {
	const expected = MAGIC_BYTES[mimeType];
	if (!expected) return true;
	if (buffer.length < expected.length) return false;
	return expected.every((byte, i) => buffer[i] === byte);
}
