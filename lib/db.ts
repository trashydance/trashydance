import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";

const dbPath = resolve(process.cwd(), process.env.DATABASE_URL ?? "local.db");
const db = drizzle(dbPath);

export default db;
