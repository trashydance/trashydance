"use client";

import {
	CalendarDays,
	Camera,
	ExternalLink,
	Loader2,
	Pencil,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { FriendRequestButton } from "@/components/feature/friend-request-button";
import { UserAvatar } from "@/components/feature/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AVATAR_ACCEPT_STRING, INTRA_PROFILE_BASE_URL } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
	const params = useParams<{ username: string }>();
	const [profile, setProfile] = useState<
		(Profile & { isOwnProfile: boolean }) | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const avatarInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		async function fetchProfile() {
			setIsLoading(true);
			try {
				const res = await fetch(`/api/profile/${params.username}`);
				if (res.ok) {
					const data = await res.json();
					setProfile(data);
				}
			} catch {
				// Silently fail
			} finally {
				setIsLoading(false);
			}
		}
		fetchProfile();
	}, [params.username]);

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
					const data = await res.json();
					setProfile((prev) => (prev ? { ...prev, image: data.image } : prev));
				}
			} finally {
				setUploadingAvatar(false);
				if (avatarInputRef.current) avatarInputRef.current.value = "";
			}
		},
		[],
	);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center gap-6 py-8">
				<Skeleton className="size-24 rounded-full" />
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-4 w-60" />
				<div className="flex gap-8">
					<Skeleton className="h-12 w-20" />
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="py-8 text-center">
				<h1 className="font-heading text-2xl font-bold">User not found</h1>
				<p className="mt-2 text-muted-foreground">This user does not exist.</p>
			</div>
		);
	}

	const displayName = profile.username || profile.name;
	const fullName = [profile.name, profile.lastName].filter(Boolean).join(" ");
	const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="mx-auto w-full max-w-2xl py-8">
			<div className="rounded-base border-4 border-border bg-card p-6 shadow-brutal-cobalt sm:p-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
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

					<div className="min-w-0 flex-1">
						<h1 className="font-heading text-4xl">{displayName}</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							@{profile.username}
						</p>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							{profile.isOwnProfile && (
								<>
									<span className="border-2 border-border bg-main px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-main-foreground">
										Online
									</span>
									<span className="border-2 border-border bg-secondary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
										You
									</span>
								</>
							)}
							{fullName !== displayName && (
								<span className="text-sm text-muted-foreground">
									{fullName}
								</span>
							)}
						</div>
						{profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
					</div>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
					<div className="border-2 border-border p-4 text-center">
						<span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							<Users className="size-3.5" />
							Friends
						</span>
						<span className="mt-1 block text-xl font-bold">
							{profile.friendCount}
						</span>
					</div>
					<div className="border-2 border-border p-4 text-center">
						<span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							<CalendarDays className="size-3.5" />
							Since
						</span>
						<span className="mt-1 block text-base font-bold">{joinDate}</span>
					</div>
					{profile.intraLogin && (
						<a
							href={`${INTRA_PROFILE_BASE_URL}/${profile.intraLogin}`}
							target="_blank"
							rel="noopener noreferrer"
							className="col-span-2 flex flex-col items-center justify-center border-2 border-border p-4 text-center transition-colors hover:bg-muted sm:col-span-1"
						>
							<span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								<ExternalLink className="size-3.5" />
								42 Intra
							</span>
							<span className="mt-1 block text-base font-bold uppercase">
								{profile.intraLogin}
							</span>
						</a>
					)}
				</div>

				<div className="mt-6">
					{profile.isOwnProfile ? (
						<Button variant="outline" asChild>
							<Link href="/settings">
								<Pencil className="size-4" />
								Edit profile
							</Link>
						</Button>
					) : (
						<FriendRequestButton
							userId={profile.id}
							initialStatus={profile.friendStatus}
							requestId={profile.friendRequestId}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
