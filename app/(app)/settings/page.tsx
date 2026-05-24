"use client";

import {
	AlertTriangle,
	Copy,
	Shield,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type TwoFactorStep =
	| "idle"
	| "enter-password"
	| "show-qr"
	| "verify-code"
	| "show-backup-codes"
	| "disable-confirm";

export default function SettingsPage() {
	const { data: session } = authClient.useSession();
	const [step, setStep] = useState<TwoFactorStep>("idle");
	const [password, setPassword] = useState("");
	const [totpURI, setTotpURI] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [verifyCode, setVerifyCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [copiedCodes, setCopiedCodes] = useState(false);

	const twoFactorEnabled = session?.user?.twoFactorEnabled ?? false;

	const handleEnableStart = () => {
		setStep("enter-password");
		setPassword("");
		setError("");
	};

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

	const handleDisableStart = () => {
		setStep("disable-confirm");
		setPassword("");
		setError("");
	};

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

			setStep("idle");
			setPassword("");
		} finally {
			setLoading(false);
		}
	}, [password]);

	const handleCopyBackupCodes = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(backupCodes.join("\n"));
			setCopiedCodes(true);
			setTimeout(() => setCopiedCodes(false), 2000);
		} catch {
			// Clipboard API not available
		}
	}, [backupCodes]);

	const handleDone = () => {
		setStep("idle");
		setTotpURI("");
		setBackupCodes([]);
		setVerifyCode("");
		setPassword("");
		setError("");
		setCopiedCodes(false);
	};

	const qrUrl = totpURI
		? `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(totpURI)}`
		: "";

	return (
		<div className="flex flex-col gap-6 py-4">
			<h1 className="font-heading text-2xl font-bold">Settings</h1>

			<Card className="border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="size-5" />
						<CardTitle className="font-heading text-lg">
							Two-Factor Authentication
						</CardTitle>
					</div>
					<CardDescription>
						Add an extra layer of security to your account using a TOTP
						authenticator app.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{/* Status indicator */}
						<div className="flex items-center gap-2">
							{twoFactorEnabled ? (
								<>
									<ShieldCheck className="size-4 text-green-600" />
									<span className="text-sm font-medium text-green-600">
										2FA is enabled
									</span>
								</>
							) : (
								<>
									<ShieldOff className="size-4 text-muted-foreground" />
									<span className="text-sm font-medium text-muted-foreground">
										2FA is not enabled
									</span>
								</>
							)}
						</div>

						{error && (
							<div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
								{error}
							</div>
						)}

						{/* Idle state */}
						{step === "idle" && (
							<div>
								{twoFactorEnabled ? (
									<Button variant="outline" onClick={handleDisableStart}>
										<ShieldOff className="size-4" />
										Disable 2FA
									</Button>
								) : (
									<Button onClick={handleEnableStart}>
										<ShieldCheck className="size-4" />
										Enable 2FA
									</Button>
								)}
							</div>
						)}

						{/* Enter password to enable */}
						{step === "enter-password" && (
							<div className="flex flex-col gap-3">
								<p className="text-sm text-muted-foreground">
									Enter your password to set up two-factor authentication.
								</p>
								<Input
									type="password"
									placeholder="Your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && password) {
											handleEnableSubmitPassword();
										}
									}}
									disabled={loading}
								/>
								<div className="flex gap-2">
									<Button
										onClick={handleEnableSubmitPassword}
										disabled={!password || loading}
									>
										{loading ? "Setting up..." : "Continue"}
									</Button>
									<Button variant="outline" onClick={handleDone}>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{/* Show QR code */}
						{step === "show-qr" && (
							<div className="flex flex-col gap-4">
								<p className="text-sm text-muted-foreground">
									Scan this QR code with your authenticator app (e.g., Google
									Authenticator, Authy).
								</p>
								<div className="flex justify-center">
									<div className="rounded-lg border-2 border-foreground bg-white p-3 shadow-[4px_4px_0px_0px] shadow-foreground">
										{/* biome-ignore lint: QR code from external API, using img intentionally */}
										<img
											src={qrUrl}
											alt="Scan this QR code with your authenticator app"
											width={200}
											height={200}
										/>
									</div>
								</div>
								<Button
									onClick={() => {
										setStep("verify-code");
										setVerifyCode("");
									}}
								>
									I have scanned the code
								</Button>
							</div>
						)}

						{/* Verify code */}
						{step === "verify-code" && (
							<div className="flex flex-col gap-3">
								<p className="text-sm text-muted-foreground">
									Enter the 6-digit code from your authenticator app to confirm
									setup.
								</p>
								<Input
									type="text"
									inputMode="numeric"
									autoComplete="one-time-code"
									maxLength={6}
									placeholder="000000"
									value={verifyCode}
									onChange={(e) =>
										setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
									}
									onKeyDown={(e) => {
										if (e.key === "Enter" && verifyCode.length === 6) {
											handleVerifySetup();
										}
									}}
									disabled={loading}
									className="text-center text-lg tracking-widest"
								/>
								<div className="flex gap-2">
									<Button
										onClick={handleVerifySetup}
										disabled={verifyCode.length !== 6 || loading}
									>
										{loading ? "Verifying..." : "Verify and enable"}
									</Button>
									<Button variant="outline" onClick={handleDone}>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{/* Show backup codes */}
						{step === "show-backup-codes" && (
							<div className="flex flex-col gap-4">
								<div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
									<AlertTriangle className="mt-0.5 size-4 shrink-0" />
									<div>
										<p className="font-medium">Save your backup codes now!</p>
										<p className="mt-1">
											These codes can be used to access your account if you lose
											your authenticator device. Each code can only be used
											once. Store them in a safe place.
										</p>
									</div>
								</div>

								<div className="rounded-lg border-2 border-foreground bg-muted p-4 font-mono text-sm shadow-[4px_4px_0px_0px] shadow-foreground">
									<div className="grid grid-cols-2 gap-2">
										{backupCodes.map((code) => (
											<div key={code} className="text-center">
												{code}
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2">
									<Button variant="outline" onClick={handleCopyBackupCodes}>
										<Copy className="size-4" />
										{copiedCodes ? "Copied!" : "Copy codes"}
									</Button>
									<Button onClick={handleDone}>I have saved my codes</Button>
								</div>
							</div>
						)}

						{/* Disable confirmation */}
						{step === "disable-confirm" && (
							<div className="flex flex-col gap-3">
								<p className="text-sm text-muted-foreground">
									Enter your password to disable two-factor authentication.
								</p>
								<Input
									type="password"
									placeholder="Your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && password) {
											handleDisableConfirm();
										}
									}}
									disabled={loading}
								/>
								<div className="flex gap-2">
									<Button
										variant="destructive"
										onClick={handleDisableConfirm}
										disabled={!password || loading}
									>
										{loading ? "Disabling..." : "Disable 2FA"}
									</Button>
									<Button variant="outline" onClick={handleDone}>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
