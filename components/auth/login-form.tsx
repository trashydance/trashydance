"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { type LoginFormInput, loginSchema } from "./schemas";

export function LoginForm() {
	const [apiError, setApiError] = useState<Record<string, string>>({});
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormInput) => {
		setApiError({});

		const { error } = await authClient.signIn.email({
			email: data.email,
			password: data.password,
			callbackURL: "/rooms",
		});

		if (!error) {
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

			<button
				type="submit"
				disabled={isSubmitting}
				className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSubmitting ? "Logging in..." : "Login"}
			</button>
		</form>
	);
}
