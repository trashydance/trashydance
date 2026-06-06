import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type db from "@/lib/db";
import * as schema from "@/schema";

export type TestDb = typeof db;

export function createTestDb(): TestDb {
	const sqlite = new Database(":memory:");
	sqlite.pragma("foreign_keys = ON");
	const testDb = drizzle(sqlite) as TestDb;
	migrate(testDb, { migrationsFolder: "./drizzle" });
	return testDb;
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
