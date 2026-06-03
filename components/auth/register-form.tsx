"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OAuthButton } from "@/components/auth/oauth-button";
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
						<h1 className="text-xl font-bold">
							Create your ChatSimulator account
						</h1>
						<FieldDescription>
							Already have an account? <Link href="/login">Sign in</Link>
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
							placeholder="Choose a username"
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
						{errors.password && (
							<p className="text-xs text-red-600">{errors.password.message}</p>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
						<Input
							{...register("confirmPassword")}
							id="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							disabled={isSubmitting}
						/>
						{errors.confirmPassword && (
							<p className="text-xs text-red-600">
								{errors.confirmPassword.message}
							</p>
						)}
					</Field>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? "Creating account..." : "Create Account"}
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
