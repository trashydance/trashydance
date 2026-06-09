"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions/profile";
import { BIO_MAX_LENGTH } from "@/lib/constants";
import type { User } from "@/lib/types";

interface ProfileFormProps {
	initialUser?: User;
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [bio, setBio] = useState("");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		if (initialUser) {
			setFirstName(initialUser.name ?? "");
			setLastName(initialUser.lastName ?? "");
			setBio(initialUser.bio ?? "");
		}
	}, [initialUser]);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);
		try {
			const res = await updateProfile({
				name: firstName,
				lastName: lastName || null,
				bio: bio || null,
			});
			if (res.ok) {
				setSaved(true);
				setTimeout(() => setSaved(false), 2000);
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-4 rounded-base border-4 border-border bg-card p-6 shadow-shadow">
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
	);
}
