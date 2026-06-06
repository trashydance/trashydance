"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OAuthButton } from "@/components/auth/oauth-button";
import { OrDivider } from "@/components/auth/or-divider";
import { TwoFactorVerify } from "@/components/auth/two-factor-verify";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
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

		const errorMessage = error.message ?? "";

		const userNotFoundError =
			error.code === "USER_NOT_FOUND" ||
			errorMessage.includes("User not found");
		const invalidPasswordError =
			error.code === "INVALID_PASSWORD" ||
			error.code === "INVALID_EMAIL_OR_PASSWORD" ||
			errorMessage.includes("invalid password");

		if (userNotFoundError) {
			setApiError({ username: "User not found" });
		} else if (invalidPasswordError) {
			setApiError({ password: "Invalid password" });
		} else {
			setApiError({ general: errorMessage || "An error occurred" });
		}
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
					<div>
						<h1 className="font-heading text-5xl">Log in.</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Welcome back. Drop in and ping someone.
						</p>
					</div>

					{apiError.general && (
						<div className="rounded-base border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
							{apiError.general}
						</div>
					)}

					<Field>
						<FieldLabel
							htmlFor="username"
							className="text-xs font-bold uppercase tracking-wide"
						>
							Username
						</FieldLabel>
						<Input
							{...register("username")}
							id="username"
							type="text"
							placeholder="Your username"
							autoComplete="username"
							disabled={isSubmitting}
							className="h-12"
						/>
						{(errors.username || apiError.username) && (
							<p className="text-xs text-destructive">
								{errors.username?.message || apiError.username}
							</p>
						)}
					</Field>

					<Field>
						<FieldLabel
							htmlFor="password"
							className="text-xs font-bold uppercase tracking-wide"
						>
							Password
						</FieldLabel>
						<Input
							{...register("password")}
							id="password"
							type="password"
							placeholder="Enter your password"
							disabled={isSubmitting}
							className="h-12"
						/>
						{(errors.password || apiError.password) && (
							<p className="text-xs text-destructive">
								{errors.password?.message || apiError.password}
							</p>
						)}
					</Field>

					<Button type="submit" disabled={isSubmitting} className="h-14 w-full">
						{isSubmitting ? "Logging in..." : "Log in"}
					</Button>

					<OrDivider />
					<OAuthButton setApiError={setApiError} disabled={isSubmitting} />
				</FieldGroup>
			</form>
			<FieldDescription className="text-center">
				New here?{" "}
				<Link href="/register" className="font-bold uppercase tracking-wide">
					Sign up
				</Link>
			</FieldDescription>
		</div>
	);
}
