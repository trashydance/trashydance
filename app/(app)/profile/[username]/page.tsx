"use client";

import { CalendarDays, ExternalLink, Pencil, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FriendRequestButton } from "@/components/feature/friend-request-button";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
	const params = useParams<{ username: string }>();
	const [profile, setProfile] = useState<
		(Profile & { isOwnProfile: boolean }) | null
	>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const [editName, setEditName] = useState("");
	const [editLastName, setEditLastName] = useState("");
	const [editBio, setEditBio] = useState("");
	const [editImage, setEditImage] = useState("");

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

	const openEdit = useCallback(() => {
		if (!profile) return;
		setEditName(profile.name);
		setEditLastName(profile.lastName ?? "");
		setEditBio(profile.bio ?? "");
		setEditImage(profile.image ?? "");
		setDialogOpen(true);
	}, [profile]);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			const res = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: editName,
					lastName: editLastName || null,
					bio: editBio || null,
					image: editImage || null,
				}),
			});
			if (res.ok) {
				setProfile((prev) =>
					prev
						? {
								...prev,
								name: editName,
								lastName: editLastName || null,
								bio: editBio || null,
								image: editImage || null,
							}
						: prev,
				);
				setDialogOpen(false);
			}
		} catch {
			// Silently fail
		} finally {
			setSaving(false);
		}
	}, [editName, editLastName, editBio, editImage]);

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
	const initials = displayName.slice(0, 2).toUpperCase();
	const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="flex flex-col items-center gap-6 py-8">
			<div className="relative">
				<Avatar
					size="lg"
					className="size-24 border-2 border-border shadow-[4px_4px_0px_0px] shadow-border"
				>
					{profile.image && (
						<AvatarImage src={profile.image} alt={displayName} />
					)}
					<AvatarFallback className="text-2xl">{initials}</AvatarFallback>
				</Avatar>
			</div>

			<div className="text-center">
				<h1 className="font-heading text-2xl font-bold">{displayName}</h1>
				{fullName !== displayName && (
					<p className="text-muted-foreground">{fullName}</p>
				)}
				{profile.bio && (
					<p className="mx-auto mt-2 max-w-sm text-sm">{profile.bio}</p>
				)}
			</div>

			<div className="flex items-center gap-6">
				<div className="text-center">
					<span className="flex items-center gap-1 font-heading text-xl font-bold">
						<Users className="size-4" />
						{profile.friendCount}
					</span>
					<span className="text-xs text-muted-foreground">Friends</span>
				</div>
				<div className="text-center">
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<CalendarDays className="size-3.5" />
						<span>Joined {joinDate}</span>
					</div>
				</div>
			</div>

			{profile.intraLogin && (
				<a
					href={`https://profile.intra.42.fr/users/${profile.intraLogin}`}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 rounded-md border-2 border-border bg-background px-4 py-2 text-sm font-medium shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
				>
					<span>42 Intra</span>
					<ExternalLink className="size-3.5" />
				</a>
			)}

			{profile.isOwnProfile ? (
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="outline" onClick={openEdit}>
							<Pencil className="size-4" />
							Edit profile
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit profile</DialogTitle>
							<DialogDescription>
								Update your profile information. Username and email cannot be
								changed.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label>Username</Label>
								<Input value={profile.username} disabled className="mt-1" />
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<Label htmlFor="edit-name">First name</Label>
									<Input
										id="edit-name"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										placeholder="Your first name"
										className="mt-1"
										maxLength={50}
									/>
								</div>
								<div>
									<Label htmlFor="edit-lastname">Last name</Label>
									<Input
										id="edit-lastname"
										value={editLastName}
										onChange={(e) => setEditLastName(e.target.value)}
										placeholder="Your last name"
										className="mt-1"
										maxLength={50}
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="edit-bio">Bio</Label>
								<Textarea
									id="edit-bio"
									value={editBio}
									onChange={(e) => setEditBio(e.target.value)}
									placeholder="Tell us about yourself..."
									className="mt-1"
									maxLength={200}
									rows={3}
								/>
								<span className="mt-1 block text-right text-xs text-muted-foreground">
									{editBio.length}/200
								</span>
							</div>
							<div>
								<Label htmlFor="edit-image">Profile picture URL</Label>
								<Input
									id="edit-image"
									value={editImage}
									onChange={(e) => setEditImage(e.target.value)}
									placeholder="https://example.com/avatar.jpg"
									className="mt-1"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleSave}
								disabled={saving || !editName.trim()}
							>
								{saving ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			) : (
				<FriendRequestButton
					userId={displayName}
					initialStatus={profile.friendStatus}
					requestId={profile.friendRequestId}
				/>
			)}
		</div>
	);
}
