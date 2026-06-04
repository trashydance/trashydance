import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type db from "@/lib/db";
import * as schema from "@/schema/auth";

const SCHEMA_SQL = `
CREATE TABLE user (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	email_verified integer DEFAULT 0 NOT NULL,
	image text,
	username text UNIQUE,
	display_username text,
	last_name text,
	bio text,
	intra_login text,
	two_factor_enabled integer DEFAULT 0,
	last_seen_at integer,
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);

CREATE TABLE session (
	id text PRIMARY KEY NOT NULL,
	expires_at integer NOT NULL,
	token text NOT NULL UNIQUE,
	created_at integer NOT NULL,
	updated_at integer NOT NULL,
	ip_address text,
	user_agent text,
	user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE account (
	id text PRIMARY KEY NOT NULL,
	account_id text NOT NULL,
	provider_id text NOT NULL,
	user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	access_token text,
	refresh_token text,
	id_token text,
	access_token_expires_at integer,
	refresh_token_expires_at integer,
	scope text,
	password text,
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);

CREATE TABLE verification (
	id text PRIMARY KEY NOT NULL,
	identifier text NOT NULL,
	value text NOT NULL,
	expires_at integer NOT NULL,
	created_at integer NOT NULL,
	updated_at integer NOT NULL
);

CREATE TABLE two_factor (
	id text PRIMARY KEY NOT NULL,
	secret text NOT NULL,
	backup_codes text NOT NULL,
	user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	verified integer DEFAULT 1
);

CREATE TABLE friend_request (
	id text PRIMARY KEY NOT NULL,
	sender_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	receiver_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	status text DEFAULT 'pending' NOT NULL,
	created_at integer,
	updated_at integer,
	CHECK(sender_id != receiver_id)
);
CREATE UNIQUE INDEX friend_request_pair_idx ON friend_request (sender_id, receiver_id);

CREATE TABLE conversation (
	id text PRIMARY KEY NOT NULL,
	user_a_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	user_b_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	created_at integer,
	last_message_at integer,
	user_a_last_read_at integer,
	user_b_last_read_at integer
);
CREATE UNIQUE INDEX conversation_pair_idx ON conversation (user_a_id, user_b_id);

CREATE TABLE message (
	id text PRIMARY KEY NOT NULL,
	conversation_id text NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
	sender_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	body text,
	file_name text,
	file_url text,
	file_type text,
	file_size integer,
	created_at integer
);
CREATE INDEX message_conversation_created_idx ON message (conversation_id, created_at);
`;

export type TestDb = typeof db;

export function createTestDb(): TestDb {
	const sqlite = new Database(":memory:");
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");
	sqlite.exec(SCHEMA_SQL);
	return drizzle(sqlite) as TestDb;
}

const now = Date.now();

export function seedUsers(testDb: ReturnType<typeof createTestDb>) {
	testDb
		.insert(schema.user)
		.values([
			{
				id: "user-1",
				name: "Alice",
				email: "alice@test.com",
				username: "alice",
				createdAt: new Date(now),
				updatedAt: new Date(now),
			},
			{
				id: "user-2",
				name: "Bob",
				email: "bob@test.com",
				username: "bob",
				createdAt: new Date(now),
				updatedAt: new Date(now),
			},
			{
				id: "user-3",
				name: "Charlie",
				email: "charlie@test.com",
				username: "charlie",
				createdAt: new Date(now),
				updatedAt: new Date(now),
			},
		])
		.run();
}

export function seedFriendRequest(
	testDb: ReturnType<typeof createTestDb>,
	id: string,
	senderId: string,
	receiverId: string,
	status: "pending" | "accepted" | "rejected" = "pending",
) {
	testDb
		.insert(schema.friendRequest)
		.values({
			id,
			senderId,
			receiverId,
			status,
			createdAt: new Date(now),
			updatedAt: new Date(now),
		})
		.run();
}

export function seedConversation(
	testDb: ReturnType<typeof createTestDb>,
	id: string,
	userAId: string,
	userBId: string,
) {
	testDb
		.insert(schema.conversation)
		.values({
			id,
			userAId,
			userBId,
			createdAt: new Date(now),
			lastMessageAt: new Date(now),
		})
		.run();
}

export function seedMessage(
	testDb: ReturnType<typeof createTestDb>,
	id: string,
	conversationId: string,
	senderId: string,
	body: string,
	createdAt?: Date,
) {
	testDb
		.insert(schema.message)
		.values({
			id,
			conversationId,
			senderId,
			body,
			createdAt: createdAt ?? new Date(now),
		})
		.run();
}
