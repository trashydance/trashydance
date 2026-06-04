"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/feature/section-header";
import { TwoFactorSetup } from "@/components/feature/settings/two-factor-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const THEMES = ["light", "dark", "system"] as const;
const BIO_MAX_LENGTH = 200;

export default function SettingsPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;
	const { theme, setTheme } = useTheme();

	// ─── Profilo ───
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [bio, setBio] = useState("");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// ─── Password ───
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [changingPassword, setChangingPassword] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);
	const [passwordError, setPasswordError] = useState("");

	// ─── Delete ───
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	useEffect(() => {
		async function fetchProfile() {
			try {
				const res = await fetch("/api/profile/me");
				if (res.ok) {
					const data = await res.json();
					setFirstName(data.name ?? "");
					setLastName(data.lastName ?? "");
					setBio(data.bio ?? "");
				}
			} catch {
				// Silently fail
			}
		}
		fetchProfile();
	}, []);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		try {
			const res = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: firstName,
					lastName: lastName || null,
					bio: bio || null,
				}),
			});
			if (res.ok) {
				setSaved(true);
				setTimeout(() => setSaved(false), 2000);
			}
		} finally {
			setSaving(false);
		}
	};

	const handleChangePassword = async () => {
		setPasswordError("");
		setPasswordChanged(false);

		if (newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords don't match");
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

	const handleDelete = async () => {
		setDeleting(true);
		setDeleteError("");
		try {
			const { error } = await authClient.deleteUser({
				password: deletePassword || undefined,
			});
			if (error) {
				setDeleteError(error.message ?? "Could not delete the account");
				return;
			}
			router.push("/register");
		} finally {
			setDeleting(false);
		}
	};

	const canChangePassword =
		currentPassword.length > 0 &&
		newPassword.length > 0 &&
		confirmPassword.length > 0;

	return (
		<div className="flex flex-col gap-8">
			<h1 className="font-heading text-5xl">Settings.</h1>

			<section>
				<SectionHeader title="Appearance" />
				<div className="flex items-center justify-between gap-4 rounded-base border-2 border-border bg-card p-4 shadow-shadow">
					<div>
						<p className="text-sm font-bold uppercase tracking-wide">Theme</p>
						<p className="text-sm text-muted-foreground">
							Match system or pick a side.
						</p>
					</div>
					<div className="flex border-2 border-border p-1">
						{THEMES.map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setTheme(t)}
								className={cn(
									"px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
									theme === t
										? "border-2 border-border bg-main text-main-foreground"
										: "text-foreground hover:bg-muted",
								)}
							>
								{t}
							</button>
						))}
					</div>
				</div>
			</section>

			<section>
				<SectionHeader title="Security" />
				<div className="flex flex-col gap-4">
					<TwoFactorSetup twoFactorEnabled={twoFactorEnabled} />

					<div className="flex flex-col gap-4 rounded-base border-2 border-border bg-card p-6 shadow-shadow">
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
							<p className="text-xs font-bold text-destructive">
								{passwordError}
							</p>
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
				</div>
			</section>

			<section>
				<SectionHeader title="Account" />
				<div className="flex flex-col gap-4 rounded-base border-2 border-border bg-card p-6 shadow-shadow">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label
								htmlFor="first-name"
								className="mb-2 block text-xs font-bold uppercase tracking-wide"
							>
								First name
							</label>
							<Input
								id="first-name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								maxLength={50}
							/>
						</div>
						<div>
							<label
								htmlFor="last-name"
								className="mb-2 block text-xs font-bold uppercase tracking-wide"
							>
								Last name
							</label>
							<Input
								id="last-name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								maxLength={50}
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="bio"
							className="mb-2 block text-xs font-bold uppercase tracking-wide"
						>
							Bio
						</label>
						<Textarea
							id="bio"
							value={bio}
							onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
							rows={3}
							placeholder="Tell us about yourself..."
						/>
						<span className="mt-1 block text-right text-xs text-muted-foreground">
							{bio.length}/{BIO_MAX_LENGTH}
						</span>
					</div>
					<div className="flex justify-end">
						<Button
							onClick={handleSave}
							disabled={saving || !firstName.trim()}
							size="sm"
						>
							{saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
						</Button>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-3 rounded-base border-2 border-border bg-accent p-6 text-accent-foreground shadow-shadow">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-bold uppercase tracking-wide">
								Delete account
							</p>
							<p className="text-xs">
								This is permanent. Removes profile, sessions, messages.
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setDeleteOpen((v) => !v);
								setDeleteError("");
							}}
						>
							Delete
						</Button>
					</div>

					{deleteOpen && (
						<div className="flex flex-col gap-3 border-t-2 border-border pt-3">
							<p className="text-xs font-bold uppercase tracking-wide">
								Confirm with your password
							</p>
							<Input
								type="password"
								placeholder="Your password"
								value={deletePassword}
								onChange={(e) => setDeletePassword(e.target.value)}
								className="bg-card text-foreground"
							/>
							{deleteError && (
								<p className="text-xs font-bold">{deleteError}</p>
							)}
							<div className="flex justify-end">
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDelete}
									disabled={deleting}
								>
									{deleting ? "Deleting..." : "Delete forever"}
								</Button>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
