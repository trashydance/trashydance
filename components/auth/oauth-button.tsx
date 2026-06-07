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
				type="button"
				className="h-14 w-full bg-secondary text-secondary-foreground"
				onClick={handleOAuth42}
				disabled={disabled}
			>
				<span className="flex size-6 shrink-0 items-center justify-center border-2 border-border bg-white text-secondary">
					<IntraIcon className="size-3.5" />
				</span>
				Continue with 42
			</Button>
		</Field>
	);
}
