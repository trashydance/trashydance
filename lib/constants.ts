export const PROJECT_NAME = "trashydance";

export const CONTACT_EMAIL = "trashydance@example.com";

export const COPYRIGHT_NOTICE = "© 2026 Trashydance · 42 Final Project";

export const INTRA_PROFILE_BASE_URL = "https://profile.intra.42.fr/users";

export const MAX_MESSAGE_LENGTH = 2000;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_AVATAR_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
] as const;

export const ALLOWED_AVATAR_MIME_TYPES_SET = new Set<string>(
	ALLOWED_AVATAR_MIME_TYPES,
);

export const AVATAR_ACCEPT_STRING = ALLOWED_AVATAR_MIME_TYPES.join(",");

/** Relativo a process.cwd(); usato sia dall'upload che dal serving. */
export const AVATAR_UPLOAD_DIR = "data/uploads/avatars";

/** Relativo a process.cwd(); base degli allegati di conversazione. */
export const UPLOAD_BASE_DIR = "data/uploads";

/** Mappa MIME → estensione usata per i nomi file degli avatar. */
export const AVATAR_EXTENSIONS: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
};

export const BIO_MAX_LENGTH = 200;

export const ALLOWED_MIME_TYPES = [
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
] as const;

export const ALLOWED_MIME_TYPES_SET = new Set<string>(ALLOWED_MIME_TYPES);

export const ALLOWED_MIME_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(",");

/** Firme binarie (magic bytes) per la verifica del contenuto dei file. */
export const MAGIC_BYTES: Record<string, number[]> = {
	"image/jpeg": [0xff, 0xd8, 0xff],
	"image/png": [0x89, 0x50, 0x4e, 0x47],
	"image/gif": [0x47, 0x49, 0x46, 0x38],
	"image/webp": [0x52, 0x49, 0x46, 0x46],
	"application/pdf": [0x25, 0x50, 0x44, 0x46],
};

/** Mappa estensione → MIME per il serving dei file caricati. */
export const MIME_TYPES: Record<string, string> = {
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

export const DEBOUNCE_MS = 300;

export const HIGHLIGHT_DURATION_MS = 3000;

export const COPIED_FEEDBACK_MS = 2000;

export const SOCKET_RECONNECTION_ATTEMPTS = 5;
export const SOCKET_RECONNECTION_DELAY = 2000;

export const DEFAULT_MESSAGE_PAGE_SIZE = 50;

export const SocketEvent = {
	MESSAGE_SEND: "message:send",
	MESSAGE_NEW: "message:new",
	PRESENCE_SUBSCRIBE: "presence:subscribe",
	PRESENCE_SNAPSHOT: "presence:snapshot",
	PRESENCE_UPDATE: "presence:update",
	FRIEND_REQUEST_NEW: "friend-request:new",
	FRIEND_REQUEST_UPDATE: "friend-request:update",
	NOTIFICATION_COUNT: "notification:count",
} as const;

export const RATE_LIMIT = {
	AUTH_MAX: 10,
	AUTH_WINDOW_MS: 60_000,
	MESSAGE_MAX: 60,
	MESSAGE_WINDOW_MS: 60_000,
	UPLOAD_MAX: 20,
	UPLOAD_WINDOW_MS: 60_000,
} as const;

export const TEXTAREA_MAX_HEIGHT_PX = 120;
export const MESSAGE_LENGTH_WARNING_THRESHOLD = 0.9;
