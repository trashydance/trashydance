"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { signInWith42 } from "./oauth42";
import { type RegisterFormInput, registerSchema } from "./schemas";

export function RegisterForm() {
	const [apiError, setApiError] = useState<Record<string, string>>({});
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormInput>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormInput) => {
		setApiError({});

		const { error } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name: data.email.split("@")[0],
			callbackURL: "/rooms",
		});

		if (!error) {
			return;
		}

		if (error?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
			setApiError({ email: "Email already in use" });
		} else if (error.message?.includes("email")) {
			setApiError({ email: error.message });
		} else if (error.message) {
			setApiError({ general: error.message });
		}
	};

	const onOAuth42Register = async () => {
		await signInWith42(setApiError);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
			{apiError.general && (
				<div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
					{apiError.general}
				</div>
			)}

			<div className="grid gap-1">
				<label htmlFor="email" className="text-sm font-medium">
					Email
				</label>
				<input
					{...register("email")}
					type="email"
					id="email"
					placeholder="Enter your email"
					className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					disabled={isSubmitting}
				/>
				{(errors.email || apiError.email) && (
					<p className="text-xs text-red-600">
						{errors.email?.message || apiError.email}
					</p>
				)}
			</div>

			<div className="grid gap-1">
				<label htmlFor="password" className="text-sm font-medium">
					Password
				</label>
				<input
					{...register("password")}
					type="password"
					id="password"
					placeholder="Enter your password"
					className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					disabled={isSubmitting}
				/>
				{(errors.password || apiError.password) && (
					<p className="text-xs text-red-600">
						{errors.password?.message || apiError.password}
					</p>
				)}
			</div>

			<div className="grid gap-1">
				<label htmlFor="confirmPassword" className="text-sm font-medium">
					Confirm Password
				</label>
				<input
					{...register("confirmPassword")}
					type="password"
					id="confirmPassword"
					placeholder="Confirm your password"
					className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
					disabled={isSubmitting}
				/>
				{errors.confirmPassword && (
					<p className="text-xs text-red-600">
						{errors.confirmPassword.message}
					</p>
				)}
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSubmitting ? "Creating account..." : "Register"}
			</button>

			<button
				type="button"
				onClick={onOAuth42Register}
				disabled={isSubmitting}
				className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Continue with 42
			</button>
		</form>
	);
}
