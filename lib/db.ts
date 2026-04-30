import { drizzle } from "drizzle-orm/better-sqlite3";

const db = drizzle(process.env.DATABASE_URL ?? "");

export default db;
