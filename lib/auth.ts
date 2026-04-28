import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { PROJECT_NAME } from "./constants";
import db from "./db";

export const auth = betterAuth({
	appName: PROJECT_NAME,

	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),

	emailAndPassword: {
		enabled: true,
	},
});
