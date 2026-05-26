import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

/** Message body validation */
export const messageSchema = z
	.object({
		body: z
			.string()
			.max(
				MAX_MESSAGE_LENGTH,
				`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
			)
			.transform((v) => v.trim())
			.optional()
			.default(""),
		fileName: z.string().optional(),
		fileUrl: z.string().optional(),
		fileType: z.string().optional(),
		fileSize: z.number().optional(),
	})
	.refine((data) => data.body.length > 0 || data.fileUrl, {
		message: "Message must have text or a file attachment",
	});

/** Create or get an existing conversation */
export const createConversationSchema = z.object({
	otherUserId: z.string().min(1, "User ID is required"),
});

/** Send a friend request */
export const friendRequestSchema = z.object({
	receiverId: z.string().min(1),
});

/** Accept or reject a friend request */
export const friendRequestActionSchema = z.object({
	action: z.enum(["accept", "reject"]),
});

/** Search query */
export const searchQuerySchema = z.object({
	q: z.string().max(100, "Search query is too long").default(""),
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
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[a-zA-Z]/, "Password must contain at least one letter")
		.regex(/[0-9]/, "Password must contain at least one digit"),
});

/** Login */
export const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
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
	name: z.string().min(1).max(50).optional(),
	lastName: z.string().max(50).optional(),
	bio: z.string().max(200).optional(),
});

export type MessageInput = z.infer<typeof messageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type FriendRequestActionInput = z.infer<
	typeof friendRequestActionSchema
>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
