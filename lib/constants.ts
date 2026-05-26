export const PROJECT_NAME = "trashydance";

export const MAX_MESSAGE_LENGTH = 2000;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
} as const;

export const TEXTAREA_MAX_HEIGHT_PX = 120;
export const MESSAGE_LENGTH_WARNING_THRESHOLD = 0.9;
