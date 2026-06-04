"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function DeleteAccountSection() {
	const router = useRouter();
	const [deletePassword, setDeletePassword] = useState("");
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

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

	return (
		<div className="mt-4 flex flex-col gap-3 rounded-base border-4 border-border bg-accent p-6 text-accent-foreground shadow-shadow">
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
				<div className="flex flex-col gap-3 border-t-4 border-border pt-3">
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
					{deleteError && <p className="text-xs font-bold">{deleteError}</p>}
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
	);
}
