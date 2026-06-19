import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, twoFactor, username } from "better-auth/plugins";
import * as schema from "@/schema";
import { PROJECT_NAME } from "./constants";
import db from "./db";
import { getEnv } from "./env";

function buildAuth() {
	const env = getEnv();

	return betterAuth({
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
			additionalFields: {
				lastName: {
					type: "string",
					required: false,
				},
				bio: {
					type: "string",
					required: false,
				},
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
}

let _auth: ReturnType<typeof buildAuth> | null = null;

/**
 * Lazily build the better-auth instance on first use. Env validation runs
 * here (not at import time) so `next build` can import route modules without
 * real secrets; fail-fast at boot is still guaranteed by `getEnv()` in
 * `server.ts`.
 */
export function getAuth() {
	if (!_auth) {
		_auth = buildAuth();
	}
	return _auth;
}
