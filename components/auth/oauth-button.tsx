"use client";

import { IntraIcon } from "@/components/icons/42-intra";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

interface OAuthButtonProps {
	setApiError: (errors: { general?: string }) => void;
	disabled?: boolean;
}

export function OAuthButton({ setApiError, disabled }: OAuthButtonProps) {
	const handleOAuth42 = async () => {
		setApiError({});

		const { error } = await authClient.signIn.oauth2({
			providerId: "42",
			callbackURL: "/home",
		});

		if (error) {
			setApiError({ general: error.message || "OAuth sign-in failed" });
		}
	};

	return (
		<Field>
			<Button
				variant="outline"
				type="button"
				className="w-full"
				onClick={handleOAuth42}
				disabled={disabled}
			>
				<IntraIcon />
				Continue with 42 Intra
			</Button>
		</Field>
	);
}
