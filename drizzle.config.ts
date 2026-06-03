import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
	dialect: "sqlite",
	schema: "./schema",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
