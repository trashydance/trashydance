"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface TwoFactorVerifyProps {
	onSuccess: () => void;
	onBack: () => void;
	className?: string;
}

export function TwoFactorVerify({
	onSuccess,
	onBack,
	className,
}: TwoFactorVerifyProps) {
	const [mode, setMode] = useState<"totp" | "backup">("totp");
	const [totpCode, setTotpCode] = useState("");
	const [backupCode, setBackupCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleVerifyTotp = async () => {
		setError(null);
		setIsVerifying(true);

		try {
			const { error: err } = await authClient.twoFactor.verifyTotp({
				code: totpCode,
			});

			if (!err) {
				onSuccess();
				return;
			}

			setError(
				err.code === "INVALID_CODE"
					? "Invalid code. Please try again."
					: (err.message ?? "Verification failed"),
			);
			setTotpCode("");
		} finally {
			setIsVerifying(false);
		}
	};

	const handleVerifyBackup = async () => {
		setError(null);
		setIsVerifying(true);

		try {
			const { error: err } = await authClient.twoFactor.verifyBackupCode({
				code: backupCode.trim(),
			});

			if (!err) {
				onSuccess();
				return;
			}

			setError(
				err.code === "INVALID_BACKUP_CODE"
					? "Invalid or already used backup code."
					: (err.message ?? "Verification failed"),
			);
			setBackupCode("");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<div className="flex flex-col items-center gap-2 text-center">
				<Link href="/" className="flex flex-col items-center gap-2 font-medium">
					<div className="flex size-8 items-center justify-center rounded-md">
						<AppIcon className="size-6" />
					</div>
					<span className="sr-only">ChatSimulator</span>
				</Link>
				<h1 className="text-xl font-bold">Two-Factor Authentication</h1>
				<FieldDescription>
					{mode === "totp"
						? "Enter the 6-digit code from your authenticator app."
						: "Enter one of your backup codes."}
				</FieldDescription>
			</div>

			{error && (
				<div className="rounded-base border-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{mode === "totp" ? (
				<div className="flex flex-col gap-4">
					<Field>
						<FieldLabel htmlFor="totp-code">Verification Code</FieldLabel>
						<Input
							ref={inputRef}
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
							disabled={isVerifying}
							className="text-center text-lg tracking-widest"
						/>
					</Field>

					<Button
						type="button"
						onClick={handleVerifyTotp}
						disabled={totpCode.length !== 6 || isVerifying}
						className="w-full"
					>
						{isVerifying ? "Verifying..." : "Verify"}
					</Button>

					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setMode("backup");
							setError(null);
							setTotpCode("");
						}}
						className="w-full text-sm"
					>
						Use a backup code instead
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="w-full"
					>
						Back to login
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<Field>
						<FieldLabel htmlFor="backup-code">Backup Code</FieldLabel>
						<Input
							id="backup-code"
							type="text"
							autoComplete="off"
							placeholder="xxxxx-xxxxx"
							value={backupCode}
							onChange={(e) => setBackupCode(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && backupCode.trim().length > 0) {
									handleVerifyBackup();
								}
							}}
							disabled={isVerifying}
							className="text-center text-lg tracking-widest"
						/>
					</Field>

					<Button
						type="button"
						onClick={handleVerifyBackup}
						disabled={backupCode.trim().length === 0 || isVerifying}
						className="w-full"
					>
						{isVerifying ? "Verifying..." : "Verify backup code"}
					</Button>

					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							setMode("totp");
							setError(null);
							setBackupCode("");
						}}
						className="w-full text-sm"
					>
						Use authenticator app instead
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="w-full"
					>
						Back to login
					</Button>
				</div>
			)}
		</div>
	);
}
