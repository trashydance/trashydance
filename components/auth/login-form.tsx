"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import { type LoginFormInput, loginSchema } from "./schemas";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [apiError, setApiError] = useState<Record<string, string>>({});
	const [twoFactorRequired, setTwoFactorRequired] = useState(false);
	const [totpCode, setTotpCode] = useState("");
	const [verifying2FA, setVerifying2FA] = useState(false);
	const totpInputRef = useRef<HTMLInputElement>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInput>({
		resolver: standardSchemaResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormInput) => {
		setApiError({});

		const result = await authClient.signIn.email({
			email: data.email,
			password: data.password,
		});

		const responseData = result.data as
			| (typeof result.data & { twoFactorRedirect?: boolean })
			| undefined;
		const error = result.error;

		if (responseData?.twoFactorRedirect) {
			setTwoFactorRequired(true);
			setTimeout(() => totpInputRef.current?.focus(), 100);
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
			setApiError({ email: "User not found" });
		} else if (invalidPasswordError) {
			setApiError({ password: "Invalid password" });
		} else {
			setApiError({ general: errorMessage || "An error occurred" });
		}
	};

	const handleVerifyTotp = async () => {
		setApiError({});
		setVerifying2FA(true);

		try {
			const { error } = await authClient.twoFactor.verifyTotp({
				code: totpCode,
			});

			if (!error) {
				router.push("/home");
				return;
			}

			setApiError({
				totp:
					error.code === "INVALID_CODE"
						? "Invalid code. Please try again."
						: (error.message ?? "Verification failed"),
			});
			setTotpCode("");
		} finally {
			setVerifying2FA(false);
		}
	};

	if (twoFactorRequired) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
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
					<h1 className="text-xl font-bold">Two-Factor Authentication</h1>
					<FieldDescription>
						Enter the 6-digit code from your authenticator app.
					</FieldDescription>
				</div>

				{apiError.totp && (
					<div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
						{apiError.totp}
					</div>
				)}

				<div className="flex flex-col gap-4">
					<Field>
						<FieldLabel htmlFor="totp-code">Verification Code</FieldLabel>
						<Input
							ref={totpInputRef}
							id="totp-code"
							type="text"
							inputMode="numeric"
							autoComplete="one-time-code"
							maxLength={6}
							placeholder="000000"
							value={totpCode}
							onChange={(e) =>
								setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
							}
							onKeyDown={(e) => {
								if (e.key === "Enter" && totpCode.length === 6) {
									handleVerifyTotp();
								}
							}}
							disabled={verifying2FA}
							className="text-center text-lg tracking-widest"
						/>
					</Field>

					<Button
						type="button"
						onClick={handleVerifyTotp}
						disabled={totpCode.length !== 6 || verifying2FA}
						className="w-full"
					>
						{verifying2FA ? "Verifying..." : "Verify"}
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setTwoFactorRequired(false);
							setTotpCode("");
							setApiError({});
						}}
						className="w-full"
					>
						Back to login
					</Button>
				</div>
			</div>
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
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							{...register("email")}
							id="email"
							type="email"
							placeholder="m@example.com"
							disabled={isSubmitting}
						/>
						{(errors.email || apiError.email) && (
							<p className="text-xs text-red-600">
								{errors.email?.message || apiError.email}
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
