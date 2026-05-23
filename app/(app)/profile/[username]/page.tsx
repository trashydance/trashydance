"use client";

import { CalendarDays, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FollowToggle } from "@/components/feature/follow-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
	const params = useParams<{ username: string }>();
	const [profile, setProfile] = useState<
		(Profile & { isOwnProfile: boolean }) | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [imageUrl, setImageUrl] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		async function fetchProfile() {
			setIsLoading(true);
			try {
				const res = await fetch(`/api/users/${params.username}`);
				if (res.ok) {
					const data = await res.json();
					setProfile(data);
					setImageUrl(data.image ?? "");
				}
			} catch {
				// Silently fail
			} finally {
				setIsLoading(false);
			}
		}
		fetchProfile();
	}, [params.username]);

	const handleSaveImage = useCallback(async () => {
		setSaving(true);
		try {
			const res = await fetch("/api/users/me", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ image: imageUrl || null }),
			});
			if (res.ok) {
				setProfile((prev) =>
					prev ? { ...prev, image: imageUrl || null } : prev,
				);
				setDialogOpen(false);
			}
		} catch {
			// Silently fail
		} finally {
			setSaving(false);
		}
	}, [imageUrl]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center gap-6 py-8">
				<Skeleton className="size-24 rounded-full" />
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-4 w-60" />
				<div className="flex gap-8">
					<Skeleton className="h-12 w-20" />
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

	const initials = profile.username.slice(0, 2).toUpperCase();
	const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="flex flex-col items-center gap-6 py-8">
			<div className="relative">
				<Avatar
					size="lg"
					className="size-24 border-2 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground"
				>
					{profile.image && (
						<AvatarImage src={profile.image} alt={profile.username} />
					)}
					<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
				</Avatar>
			</div>

			<div className="text-center">
				<h1 className="font-heading text-2xl font-bold">{profile.username}</h1>
				{profile.name !== profile.username && (
					<p className="text-muted-foreground">{profile.name}</p>
				)}
				<div className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
					<CalendarDays className="size-3.5" />
					<span>Joined {joinDate}</span>
				</div>
			</div>

			<div className="flex gap-8">
				<div className="text-center">
					<span className="block font-heading text-xl font-bold">
						{profile.followerCount}
					</span>
					<span className="text-xs text-muted-foreground">Followers</span>
				</div>
				<div className="text-center">
					<span className="block font-heading text-xl font-bold">
						{profile.followingCount}
					</span>
					<span className="text-xs text-muted-foreground">Following</span>
				</div>
			</div>

			{profile.isOwnProfile ? (
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline">
							<Pencil className="size-4" />
							Edit profile
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit profile picture</DialogTitle>
							<DialogDescription>
								Enter a URL for your profile image.
							</DialogDescription>
						</DialogHeader>
						<Input
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="https://example.com/avatar.jpg"
						/>
						<DialogFooter>
							<Button onClick={handleSaveImage} disabled={saving}>
								{saving ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			) : (
				<FollowToggle
					userId={profile.username}
					initialIsFollowing={profile.isFollowedByMe}
				/>
			)}
		</div>
	);
}
