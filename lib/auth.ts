import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, twoFactor, username } from "better-auth/plugins";
import * as schema from "@/schema";
import { PROJECT_NAME } from "./constants";
import db from "./db";
import { getEnv } from "./env";

const env = getEnv();

export const auth = betterAuth({
	appName: PROJECT_NAME,

	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),

	emailAndPassword: {
		enabled: true,
	},

	user: {
		deleteUser: {
			enabled: true,
		},
	},

	plugins: [
		twoFactor(),
		username(),
		genericOAuth({
			config: [
				{
					providerId: "42",
					clientId: env.FORTYTWO_CLIENT_ID,
					clientSecret: env.FORTYTWO_CLIENT_SECRET,
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
							name: profile.first_name || profile.usual_full_name,
							lastName: profile.last_name || null,
							username: profile.login,
							image: profile.image?.link,
							intraLogin: profile.login,
						};
					},
				},
			],
		}),
	],
});
