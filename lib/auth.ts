import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, username } from "better-auth/plugins";
import * as schema from "@/schema/auth";
import { PROJECT_NAME } from "./constants";
import db from "./db";

export const auth = betterAuth({
	appName: PROJECT_NAME,

	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),

	emailAndPassword: {
		enabled: true,
	},

	plugins: [
		username({
			minUsernameLength: 3,
			maxUsernameLength: 20,
			usernameValidator: (value) => /^[a-zA-Z0-9_]+$/.test(value),
		}),
		genericOAuth({
			config: [
				{
					providerId: "42",
					clientId: process.env.FORTYTWO_CLIENT_ID || "",
					clientSecret: process.env.FORTYTWO_CLIENT_SECRET || "",
					authorizationUrl: "https://api.intra.42.fr/oauth/authorize",
					tokenUrl: "https://api.intra.42.fr/oauth/token",
					userInfoUrl: "https://api.intra.42.fr/v2/me",
					scopes: ["public"],
					mapProfileToUser: async (profile) => {
						return {
							id: profile.id,
							createdAt: profile.created_at,
							updatedAt: profile.updated_at,
							email: profile.email,
							emailVerified: true,
							name: profile.usual_full_name,
							image: profile.image?.link,
						};
					},
				},
			],
		}),
	],
});
