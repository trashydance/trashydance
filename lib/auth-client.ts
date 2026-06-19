import {
	genericOAuthClient,
	twoFactorClient,
	usernameClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { getAuth } from "./auth";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL,
	plugins: [
		genericOAuthClient(),
		twoFactorClient(),
		usernameClient(),
		inferAdditionalFields<ReturnType<typeof getAuth>>(),
	],
});
