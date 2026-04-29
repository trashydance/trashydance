import type { Dispatch, SetStateAction } from "react";
import { authClient } from "@/lib/auth-client";

type ApiErrorState = Record<string, string>;

export async function signInWith42(
	setApiError: Dispatch<SetStateAction<ApiErrorState>>,
) {
	setApiError({});

	const { error } = await authClient.signIn.oauth2({
		providerId: "42",
		callbackURL: "/rooms",
	});

	if (error) {
		setApiError({ general: error.message || "OAuth sign-in failed" });
	}
}
