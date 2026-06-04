"use client";

import {
	AlertTriangle,
	ArrowLeft,
	Copy,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { COPIED_FEEDBACK_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type TwoFactorStep =
	| "idle"
	| "enter-password"
	| "show-qr"
	| "verify-code"
	| "show-backup-codes"
	| "disable-confirm";

const STEP_NUMBER: Partial<Record<TwoFactorStep, number>> = {
	"enter-password": 1,
	"show-qr": 2,
	"verify-code": 3,
	"show-backup-codes": 4,
};

interface TwoFactorSetupProps {
	twoFactorEnabled: boolean;
}

export function TwoFactorSetup({ twoFactorEnabled }: TwoFactorSetupProps) {
	const [step, setStep] = useState<TwoFactorStep>("idle");
	const [password, setPassword] = useState("");
	const [totpURI, setTotpURI] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verifyCode, setVerifyCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [copiedCodes, setCopiedCodes] = useState(false);

	const resetState = useCallback(() => {
		setStep("idle");
		setPassword("");
		setTotpURI("");
		setBackupCodes([]);
		setVerifyCode("");
		setError("");
		setCopiedCodes(false);
	}, []);

	const handleEnableSubmitPassword = useCallback(async () => {
		setError("");
		setLoading(true);
		try {
			const { data, error: err } = await authClient.twoFactor.enable({
				password,
			});
			if (err) {
				setError(err.message ?? "Failed to enable 2FA");
				return;
			}
			if (data?.totpURI) {
				setTotpURI(data.totpURI);
				setBackupCodes(data.backupCodes ?? []);
				setStep("show-qr");
			}
		} finally {
			setLoading(false);
		}
	}, [password]);

	const handleVerifySetup = useCallback(async () => {
		setError("");
		setLoading(true);
		try {
			const { error: err } = await authClient.twoFactor.verifyTotp({
				code: verifyCode,
			});
			if (err) {
				setError(
					err.code === "INVALID_CODE"
						? "Invalid code. Please try again."
						: (err.message ?? "Verification failed"),
				);
				setVerifyCode("");
				return;
			}
			setStep("show-backup-codes");
		} finally {
			setLoading(false);
		}
	}, [verifyCode]);

	const handleDisableConfirm = useCallback(async () => {
		setError("");
		setLoading(true);
		try {
			const { error: err } = await authClient.twoFactor.disable({
				password,
			});
			if (err) {
				setError(err.message ?? "Failed to disable 2FA");
				return;
			}
			resetState();
		} finally {
			setLoading(false);
		}
	}, [password, resetState]);

	const handleCopyBackupCodes = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(backupCodes.join("\n"));
			setCopiedCodes(true);
			setTimeout(() => setCopiedCodes(false), COPIED_FEEDBACK_MS);
		} catch {
			// Clipboard API not available
		}
	}, [backupCodes]);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (totpURI && step === "show-qr" && canvasRef.current) {
			QRCode.toCanvas(canvasRef.current, totpURI, { width: 180 });
		}
	}, [totpURI, step]);

	// secret leggibile per inserimento manuale, a gruppi di 4
	const manualSecret = useMemo(() => {
		if (!totpURI) return "";
		try {
			const secret = new URL(totpURI).searchParams.get("secret") ?? "";
			return secret.replace(/(.{4})/g, "$1 ").trim();
		} catch {
			return "";
		}
	}, [totpURI]);

	const stepNumber = STEP_NUMBER[step];
	const dialogTitle =
		step === "disable-confirm"
			? "Disable 2FA"
			: stepNumber
				? `Enable 2FA · Step ${stepNumber} of 4`
				: "";

	return (
		<>
			<div className="flex items-center gap-4 rounded-base border-4 border-border bg-card p-6 shadow-shadow">
				<span
					className={cn(
						"flex size-12 shrink-0 items-center justify-center border-4 border-border",
						twoFactorEnabled
							? "bg-main text-main-foreground"
							: "bg-accent text-accent-foreground",
					)}
				>
					{twoFactorEnabled ? (
						<ShieldCheck className="size-5" />
					) : (
						<ShieldOff className="size-5" />
					)}
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-bold uppercase tracking-wide">
						Two-Factor Authentication
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{twoFactorEnabled
							? "On. Your account is protected."
							: "Off. Add a second step to protect your account."}
					</p>
				</div>
				<div className="shrink-0">
					{twoFactorEnabled ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setStep("disable-confirm");
								setPassword("");
								setError("");
							}}
						>
							<ShieldOff className="size-4" />
							Disable 2FA
						</Button>
					) : (
						<Button
							size="sm"
							onClick={() => {
								setStep("enter-password");
								setPassword("");
								setError("");
							}}
						>
							<ShieldCheck className="size-4" />
							Enable 2FA
						</Button>
					)}
				</div>
			</div>

			<Dialog
				open={step !== "idle"}
				onOpenChange={(open) => {
					if (!open) resetState();
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogTitle}</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 p-6">
						{error && (
							<div className="rounded-base border-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						{step === "enter-password" && (
							<>
								<h2 className="font-heading text-3xl">
									Confirm your password.
								</h2>
								<Input
									type="password"
									placeholder="Current password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && password)
											handleEnableSubmitPassword();
									}}
									disabled={loading}
									className="h-12"
								/>
							</>
						)}

						{step === "show-qr" && (
							<>
								<h2 className="font-heading text-3xl">Scan the QR code.</h2>
								<p className="text-sm text-muted-foreground">
									Use any authenticator app (Google Authenticator, 1Password,
									Raivo…).
								</p>
								<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
									<div className="shrink-0 border-4 border-border bg-white p-2">
										<canvas
											ref={canvasRef}
											aria-label="Scan this QR code with your authenticator app"
										/>
									</div>
									{manualSecret && (
										<div className="min-w-0">
											<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
												Or enter manually
											</p>
											<p className="mt-2 break-all border-4 border-border bg-background px-3 py-2 text-sm font-bold uppercase tracking-wide">
												{manualSecret}
											</p>
										</div>
									)}
								</div>
							</>
						)}

						{step === "verify-code" && (
							<>
								<h2 className="font-heading text-3xl">
									Verify the 6-digit code.
								</h2>
								<Input
									type="text"
									inputMode="numeric"
									autoComplete="one-time-code"
									maxLength={6}
									placeholder="123456"
									value={verifyCode}
									onChange={(e) =>
										setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
									}
									onKeyDown={(e) => {
										if (e.key === "Enter" && verifyCode.length === 6)
											handleVerifySetup();
									}}
									disabled={loading}
									className="h-14 text-center text-2xl font-bold tracking-[0.4em]"
								/>
							</>
						)}

						{step === "show-backup-codes" && (
							<>
								<h2 className="font-heading text-3xl">
									Save your backup codes.
								</h2>
								<div className="flex items-start gap-2 rounded-base border-4 border-accent bg-accent/10 p-3 text-sm text-accent">
									<AlertTriangle className="mt-0.5 size-4 shrink-0" />
									<p>
										Each code works once. Store them somewhere safe — they are
										the only way in if you lose your authenticator.
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2 border-4 border-border bg-background p-4 font-mono text-sm">
									{backupCodes.map((code) => (
										<div key={code} className="text-center">
											{code}
										</div>
									))}
								</div>
							</>
						)}

						{step === "disable-confirm" && (
							<>
								<h2 className="font-heading text-3xl">
									Confirm your password.
								</h2>
								<Input
									type="password"
									placeholder="Current password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && password) handleDisableConfirm();
									}}
									disabled={loading}
									className="h-12"
								/>
							</>
						)}
					</div>

					<DialogFooter
						className={cn(
							step === "enter-password" || step === "disable-confirm"
								? "justify-end"
								: "justify-between",
						)}
					>
						{step === "enter-password" && (
							<>
								<Button variant="outline" onClick={resetState}>
									Cancel
								</Button>
								<Button
									onClick={handleEnableSubmitPassword}
									disabled={!password || loading}
								>
									{loading ? "Checking..." : "Continue"}
								</Button>
							</>
						)}

						{step === "show-qr" && (
							<>
								<Button
									variant="outline"
									onClick={() => {
										setStep("enter-password");
										setError("");
									}}
								>
									<ArrowLeft className="size-4" />
									Back
								</Button>
								<Button
									onClick={() => {
										setStep("verify-code");
										setVerifyCode("");
										setError("");
									}}
								>
									Next
								</Button>
							</>
						)}

						{step === "verify-code" && (
							<>
								<Button
									variant="outline"
									onClick={() => {
										setStep("show-qr");
										setError("");
									}}
								>
									<ArrowLeft className="size-4" />
									Back
								</Button>
								<Button
									onClick={handleVerifySetup}
									disabled={verifyCode.length !== 6 || loading}
								>
									{loading ? "Verifying..." : "Verify"}
								</Button>
							</>
						)}

						{step === "show-backup-codes" && (
							<>
								<Button variant="outline" onClick={handleCopyBackupCodes}>
									<Copy className="size-4" />
									{copiedCodes ? "Copied!" : "Copy codes"}
								</Button>
								<Button onClick={resetState}>I saved my codes</Button>
							</>
						)}

						{step === "disable-confirm" && (
							<>
								<Button variant="outline" onClick={resetState}>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDisableConfirm}
									disabled={!password || loading}
								>
									{loading ? "Disabling..." : "Disable 2FA"}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
