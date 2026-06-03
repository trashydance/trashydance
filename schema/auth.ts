import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── User ────────────────────────────────────────────────────────────────────

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.default(false)
		.notNull(),
	image: text("image"),
	username: text("username").unique(),
	displayUsername: text("display_username"),
	lastName: text("last_name"),
	bio: text("bio"),
	intraLogin: text("intra_login"),
	twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).default(
		false,
	),
	lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).default(
		sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
	),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull(),
});

// ─── Session ─────────────────────────────────────────────────────────────────

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

// ─── Account ─────────────────────────────────────────────────────────────────

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", {
			mode: "timestamp_ms",
		}),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", {
			mode: "timestamp_ms",
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

// ─── Verification ────────────────────────────────────────────────────────────

export const verification = sqliteTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─── Two Factor ─────────────────────────────────────────────────────────────

export const twoFactor = sqliteTable(
	"two_factor",
	{
		id: text("id").primaryKey(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verified: integer("verified", { mode: "boolean" }).default(true),
	},
	(table) => [
		index("two_factor_secret_idx").on(table.secret),
		index("two_factor_userId_idx").on(table.userId),
	],
);

// ─── Friend Request ─────────────────────────────────────────────────────────

export const friendRequest = sqliteTable(
	"friend_request",
	{
		id: text("id").primaryKey(),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		receiverId: text("receiver_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status", { enum: ["pending", "accepted", "rejected"] })
			.notNull()
			.default("pending"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
			sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
		),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("friend_request_pair_idx").on(table.senderId, table.receiverId),
		index("friend_request_receiverId_idx").on(table.receiverId),
		index("friend_request_status_idx").on(table.status),
		check(
			"friend_request_no_self",
			sql`${table.senderId} != ${table.receiverId}`,
		),
	],
);

// ─── Conversation ────────────────────────────────────────────────────────────

export const conversation = sqliteTable(
	"conversation",
	{
		id: text("id").primaryKey(),
		userAId: text("user_a_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		userBId: text("user_b_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
			sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
		),
		lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }).default(
			sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
		),
		userALastReadAt: integer("user_a_last_read_at", { mode: "timestamp_ms" }),
		userBLastReadAt: integer("user_b_last_read_at", { mode: "timestamp_ms" }),
	},
	(table) => [
		uniqueIndex("conversation_pair_idx").on(table.userAId, table.userBId),
		index("conversation_lastMessageAt_idx").on(table.lastMessageAt),
	],
);

// ─── Message ─────────────────────────────────────────────────────────────────

export const message = sqliteTable(
	"message",
	{
		id: text("id").primaryKey(),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => conversation.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body"),
		fileName: text("file_name"),
		fileUrl: text("file_url"),
		fileType: text("file_type"),
		fileSize: integer("file_size"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
			sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
		),
	},
	(table) => [
		index("message_conversation_created_idx").on(
			table.conversationId,
			table.createdAt,
		),
	],
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	twoFactors: many(twoFactor),
	sentFriendRequests: many(friendRequest, { relationName: "sender" }),
	receivedFriendRequests: many(friendRequest, { relationName: "receiver" }),
	conversationsAsA: many(conversation, { relationName: "userA" }),
	conversationsAsB: many(conversation, { relationName: "userB" }),
	sentMessages: many(message, { relationName: "sender" }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id],
	}),
}));

export const friendRequestRelations = relations(friendRequest, ({ one }) => ({
	sender: one(user, {
		fields: [friendRequest.senderId],
		references: [user.id],
		relationName: "sender",
	}),
	receiver: one(user, {
		fields: [friendRequest.receiverId],
		references: [user.id],
		relationName: "receiver",
	}),
}));

export const conversationRelations = relations(
	conversation,
	({ one, many }) => ({
		userA: one(user, {
			fields: [conversation.userAId],
			references: [user.id],
			relationName: "userA",
		}),
		userB: one(user, {
			fields: [conversation.userBId],
			references: [user.id],
			relationName: "userB",
		}),
		messages: many(message),
	}),
);

export const messageRelations = relations(message, ({ one }) => ({
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id],
	}),
	sender: one(user, {
		fields: [message.senderId],
		references: [user.id],
		relationName: "sender",
	}),
}));
