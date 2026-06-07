"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { changePasswordSchema } from "@/lib/validation/schemas";

export function ChangePasswordForm() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [changingPassword, setChangingPassword] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);
	const [passwordError, setPasswordError] = useState("");

	const handleChangePassword = async () => {
		setPasswordError("");
		setPasswordChanged(false);

		const parsed = changePasswordSchema.safeParse({
			currentPassword,
			newPassword,
			confirmPassword,
		});
		if (!parsed.success) {
			setPasswordError(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}

		setChangingPassword(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});
			if (error) {
				setPasswordError(error.message ?? "Could not change the password");
				return;
			}
			setPasswordChanged(true);
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setPasswordChanged(false), 2500);
		} finally {
			setChangingPassword(false);
		}
	};

	const canChangePassword =
		currentPassword.length > 0 &&
		newPassword.length > 0 &&
		confirmPassword.length > 0;

	return (
		<div className="flex flex-col gap-4 rounded-base border-4 border-border bg-card p-6 shadow-shadow">
			<p className="text-sm font-bold uppercase tracking-wide">
				Change password
			</p>
			<div>
				<label
					htmlFor="current-password"
					className="mb-2 block text-xs font-bold uppercase tracking-wide"
				>
					Current password
				</label>
				<Input
					id="current-password"
					type="password"
					autoComplete="current-password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label
						htmlFor="new-password"
						className="mb-2 block text-xs font-bold uppercase tracking-wide"
					>
						New password
					</label>
					<Input
						id="new-password"
						type="password"
						autoComplete="new-password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>
				</div>
				<div>
					<label
						htmlFor="confirm-new-password"
						className="mb-2 block text-xs font-bold uppercase tracking-wide"
					>
						Confirm
					</label>
					<Input
						id="confirm-new-password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
				</div>
			</div>
			{passwordError && (
				<p className="text-xs font-bold text-destructive">{passwordError}</p>
			)}
			<div className="flex justify-end">
				<Button
					onClick={handleChangePassword}
					disabled={changingPassword || !canChangePassword}
					size="sm"
				>
					{changingPassword
						? "Updating..."
						: passwordChanged
							? "Updated!"
							: "Update password"}
				</Button>
			</div>
		</div>
	);
}
