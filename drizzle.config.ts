import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./schema",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
