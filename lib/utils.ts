import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatRelativeTime(input: string | number): string {
	const now = Date.now();
	const date =
		typeof input === "number"
			? input
			: /^\d+$/.test(input)
				? Number(input)
				: new Date(input).getTime();

	if (Number.isNaN(date)) return "";

	const diffMs = now - date;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	if (diffDay === 1) return "yesterday";
	if (diffDay < 7) return `${diffDay}d ago`;
	return new Date(date).toLocaleDateString();
}

/** Palette avatar del design Lovable: colore deterministico per utente. */
const AVATAR_COLORS = [
	"#ff3d8b", // pink
	"#2547ff", // cobalt
	"#c6ff3d", // lime
	"#ff8a00", // orange
	"#8b3dff", // purple
	"#ff3d3d", // red
	"#00e0c8", // teal
	"#3dff9e", // mint
];

export function getAvatarColor(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) | 0;
	}
	return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function truncateText(
	text: string | null | undefined,
	maxLength: number,
): string {
	if (!text) return "";
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
