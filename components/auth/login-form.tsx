"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OAuthButton } from "@/components/auth/oauth-button";
import { TwoFactorVerify } from "@/components/auth/two-factor-verify";
import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { type LoginFormInput, loginSchema } from "./schemas";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [apiError, setApiError] = useState<{
		username?: string;
		password?: string;
		general?: string;
	}>({});
	const [twoFactorRequired, setTwoFactorRequired] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInput>({
		resolver: standardSchemaResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormInput) => {
		setApiError({});

		const result = await authClient.signIn.username({
			username: data.username,
			password: data.password,
		});

		const responseData = result.data as
			| (typeof result.data & { twoFactorRedirect?: boolean })
			| undefined;
		const error = result.error;

		if (responseData?.twoFactorRedirect) {
			setTwoFactorRequired(true);
			return;
		}

		if (!error) {
			router.push("/home");
			return;
		}

		// better-auth risponde sempre INVALID_USERNAME_OR_PASSWORD per
		// credenziali errate (anti user-enumeration): non è possibile
		// distinguere utente inesistente da password sbagliata
		setApiError({ general: error.message || "An error occurred" });
	};

	if (twoFactorRequired) {
		return (
			<TwoFactorVerify
				className={className}
				onSuccess={() => router.push("/home")}
				onBack={() => {
					setTwoFactorRequired(false);
					setApiError({});
				}}
			/>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link
							href="/"
							className="flex flex-col items-center gap-2 font-medium"
						>
							<div className="flex size-8 items-center justify-center rounded-md">
								<AppIcon className="size-6" />
							</div>
							<span className="sr-only">ChatSimulator</span>
						</Link>
						<h1 className="text-xl font-bold">Sign in to ChatSimulator</h1>
						<FieldDescription>
							Don&apos;t have an account? <Link href="/register">Sign up</Link>
						</FieldDescription>
					</div>

					{apiError.general && (
						<div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
							{apiError.general}
						</div>
					)}

					<Field>
						<FieldLabel htmlFor="username">Username</FieldLabel>
						<Input
							{...register("username")}
							id="username"
							type="text"
							placeholder="Your username"
							autoComplete="username"
							disabled={isSubmitting}
						/>
						{(errors.username || apiError.username) && (
							<p className="text-xs text-red-600">
								{errors.username?.message || apiError.username}
							</p>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input
							{...register("password")}
							id="password"
							type="password"
							placeholder="Enter your password"
							disabled={isSubmitting}
						/>
						{(errors.password || apiError.password) && (
							<p className="text-xs text-red-600">
								{errors.password?.message || apiError.password}
							</p>
						)}
					</Field>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? "Logging in..." : "Login"}
					</Button>

					<FieldSeparator>Or</FieldSeparator>
					<OAuthButton setApiError={setApiError} disabled={isSubmitting} />
				</FieldGroup>
			</form>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<Link href="/terms">Terms of Service</Link> and{" "}
				<Link href="/privacy">Privacy Policy</Link>.
			</FieldDescription>
		</div>
	);
}
