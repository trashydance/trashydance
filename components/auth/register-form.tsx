"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OAuthButton } from "@/components/auth/oauth-button";
import { OrDivider } from "@/components/auth/or-divider";
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
import { type RegisterFormInput, registerSchema } from "./schemas";

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [apiError, setApiError] = useState<{
		username?: string;
		general?: string;
	}>({});
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormInput>({
		resolver: standardSchemaResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormInput) => {
		setApiError({});

		const generatedEmail = `${data.username.toLowerCase()}@trashydance.local`;

		const { error } = await authClient.signUp.email({
			email: generatedEmail,
			password: data.password,
			name: data.username,
			username: data.username,
			callbackURL: "/home",
		});

		if (!error) {
			router.push("/home");
			return;
		}

		if (
			error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" ||
			error?.message?.includes("username")
		) {
			setApiError({ username: "Username already taken" });
		} else if (error.message) {
			setApiError({ general: error.message });
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FieldGroup>
					<div>
						<h1 className="font-heading text-5xl">Sign up.</h1>
						<p className="mt-2 text-sm text-muted-foreground">
							Pick a handle. Start chatting.
						</p>
					</div>

					{apiError.general && (
						<div className="rounded-base border-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
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
							placeholder="Choose a username"
							autoComplete="username"
							disabled={isSubmitting}
							className="h-12"
						/>
						<FieldDescription className="text-xs">
							3–20 chars, letters/numbers/underscore.
						</FieldDescription>
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
						{errors.password && (
							<p className="text-xs text-destructive">
								{errors.password.message}
							</p>
						)}
					</Field>

					<Field>
						<FieldLabel
							htmlFor="confirmPassword"
							className="text-xs font-bold uppercase tracking-wide"
						>
							Confirm
						</FieldLabel>
						<Input
							{...register("confirmPassword")}
							id="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							disabled={isSubmitting}
							className="h-12"
						/>
						{errors.confirmPassword && (
							<p className="text-xs text-destructive">
								{errors.confirmPassword.message}
							</p>
						)}
					</Field>

					<Button type="submit" disabled={isSubmitting} className="h-14 w-full">
						{isSubmitting ? "Creating account..." : "Create Account"}
					</Button>

					<OrDivider />
					<OAuthButton setApiError={setApiError} disabled={isSubmitting} />
				</FieldGroup>
			</form>
			<FieldDescription className="text-center">
				Already have an account?{" "}
				<Link href="/login" className="font-bold uppercase tracking-wide">
					Log in
				</Link>
			</FieldDescription>
		</div>
	);
}
