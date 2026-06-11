"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { UserAvatar } from "@/components/feature/user-avatar";
import { AVATAR_ACCEPT_STRING } from "@/lib/constants";
import type { Profile } from "@/lib/types";

interface ProfileAvatarProps {
	profile: Profile;
}

export function ProfileAvatar({ profile }: ProfileAvatarProps) {
	const router = useRouter();
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const displayName = profile.username || profile.name;

	const handleAvatarUpload = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			setUploadingAvatar(true);
			try {
				const formData = new FormData();
				formData.append("file", file);
				const res = await fetch("/api/profile/avatar", {
					method: "POST",
					body: formData,
				});
				if (res.ok) {
					router.refresh();
				}
			} catch {
				// Silently fail
			} finally {
				setUploadingAvatar(false);
				if (avatarInputRef.current) avatarInputRef.current.value = "";
			}
		},
		[router],
	);

	return (
		<div className="relative w-fit shrink-0">
			<UserAvatar
				name={displayName}
				image={profile.image}
				className="size-28 shadow-shadow"
				fallbackClassName="text-3xl"
			/>
			{profile.isOwnProfile && (
				<>
					<input
						ref={avatarInputRef}
						type="file"
						accept={AVATAR_ACCEPT_STRING}
						onChange={handleAvatarUpload}
						className="hidden"
						aria-label="Upload profile picture"
					/>
					<button
						type="button"
						onClick={() => avatarInputRef.current?.click()}
						disabled={uploadingAvatar}
						aria-label="Change profile picture"
						className="absolute -right-2 -bottom-2 flex size-9 items-center justify-center border-2 border-border bg-card shadow-brutal-sm transition-all hover:brutal-press-hover disabled:opacity-50"
					>
						{uploadingAvatar ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Camera className="size-4" />
						)}
					</button>
				</>
			)}
		</div>
	);
}
