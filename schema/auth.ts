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
	username: text("username").notNull().unique(),
	displayUsername: text("display_username"),
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

// ─── Follow ──────────────────────────────────────────────────────────────────

export const follow = sqliteTable(
	"follow",
	{
		id: text("id").primaryKey(),
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followedId: text("followed_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
			sql`(cast(unixepoch('subsecond') * 1000 as integer))`,
		),
	},
	(table) => [
		uniqueIndex("follow_pair_idx").on(table.followerId, table.followedId),
		index("follow_followedId_idx").on(table.followedId),
		check(
			"follow_no_self_follow",
			sql`${table.followerId} != ${table.followedId}`,
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
		body: text("body").notNull(),
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
	followsAsFollower: many(follow, { relationName: "follower" }),
	followsAsFollowed: many(follow, { relationName: "followed" }),
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

export const followRelations = relations(follow, ({ one }) => ({
	follower: one(user, {
		fields: [follow.followerId],
		references: [user.id],
		relationName: "follower",
	}),
	followed: one(user, {
		fields: [follow.followedId],
		references: [user.id],
		relationName: "followed",
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
