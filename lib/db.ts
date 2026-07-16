import { resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const dbPath = isBuild
	? ":memory:"
	: resolve(process.cwd(), process.env.DATABASE_URL ?? "local.db");
const sqlite = new Database(dbPath);

if (!isBuild) {
	// Concurrent writes arrive from both Socket.IO and API routes: WAL avoids
	// readers blocking writers, busy_timeout retries instead of SQLITE_BUSY.
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("busy_timeout = 5000");
}
const db = drizzle(sqlite);

export default db;
