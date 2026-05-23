import { z } from "zod";

/** Message body validation */
export const messageSchema = z.object({
	body: z
		.string()
		.min(1, "Message cannot be empty")
		.max(2000, "Message cannot exceed 2000 characters")
		.transform((v) => v.trim()),
});

/** Create or get an existing conversation */
export const createConversationSchema = z.object({
	otherUserId: z.string().min(1, "User ID is required"),
});

/** Follow a user */
export const followSchema = z.object({
	followedId: z.string().min(1, "User ID is required"),
});

/** Search query */
export const searchQuerySchema = z.object({
	q: z
		.string()
		.min(1, "Search query is required")
		.max(100, "Search query is too long"),
});

/** Registration */
export const registerSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(20, "Username must be at most 20 characters")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Username can only contain letters, numbers, and underscores",
		),
	email: z.email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[a-zA-Z]/, "Password must contain at least one letter")
		.regex(/[0-9]/, "Password must contain at least one digit"),
});

/** Login */
export const loginSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

/** Pagination cursor */
export const cursorPaginationSchema = z.object({
	cursor: z.coerce.number().optional(),
	limit: z.coerce.number().min(1).max(100).default(50),
});

/** Profile update */
export const updateProfileSchema = z.object({
	image: z.string().optional(),
});

export type MessageInput = z.infer<typeof messageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type FollowInput = z.infer<typeof followSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
