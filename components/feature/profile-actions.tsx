"use client";

import { MessageSquare, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FriendRequestButton } from "@/components/feature/friend-request-button";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { createConversation } from "@/lib/actions/conversations";
import { updateProfile } from "@/lib/actions/profile";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Profile } from "@/lib/types";

interface ProfileActionsProps {
	profile: Profile;
}

export function ProfileActions({ profile }: ProfileActionsProps) {
	const { t } = useI18n();
	const { toast } = useToast();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [chatLoading, setChatLoading] = useState(false);

	const [editName, setEditName] = useState("");
	const [editLastName, setEditLastName] = useState("");
	const [editBio, setEditBio] = useState("");

	const openEdit = useCallback(() => {
		setEditName(profile.name);
		setEditLastName(profile.lastName ?? "");
		setEditBio(profile.bio ?? "");
		setDialogOpen(true);
	}, [profile]);

	const handleSave = useCallback(async () => {
		setSaving(true);
		try {
			const res = await updateProfile({
				name: editName,
				lastName: editLastName || null,
				bio: editBio || null,
			});
			if (res.ok) {
				await authClient.getSession();
				// revalidatePath inside the action re-renders the page
				setDialogOpen(false);
			} else {
				toast(res.error, "error");
			}
		} catch {
			toast("Something went wrong", "error");
		} finally {
			setSaving(false);
		}
	}, [editName, editLastName, editBio, toast]);

	const router = useRouter();

	const handleStartChat = useCallback(async () => {
		setChatLoading(true);
		try {
			const res = await createConversation(profile.id);
			if (res.ok) {
				router.push(`/chat/${res.data.id}`);
			} else {
				toast(res.error, "error");
				setChatLoading(false);
			}
		} catch {
			toast("Something went wrong", "error");
			setChatLoading(false);
		}
	}, [profile.id, router, toast]);

	if (!profile.isOwnProfile) {
		return (
			<div className="flex items-center gap-3">
				<FriendRequestButton
					userId={profile.id}
					initialStatus={profile.friendStatus}
					requestId={profile.friendRequestId ?? undefined}
				/>
				<Button
					variant="neutral"
					size="sm"
					onClick={handleStartChat}
					disabled={chatLoading}
				>
					<MessageSquare className="size-4" />
					{chatLoading ? t("loading") : t("chat")}
				</Button>
			</div>
		);
	}

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" onClick={openEdit}>
					<Pencil className="size-4" />
					{t("editProfile")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editProfile")}</DialogTitle>
					<DialogDescription>{t("editProfileDesc")}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 px-5 py-4">
					<div>
						<Label>{t("username")}</Label>
						<Input value={profile.username} disabled className="mt-1" />
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<Label htmlFor="edit-name">{t("firstName")}</Label>
							<Input
								id="edit-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								placeholder={t("placeholderFirstName")}
								className="mt-1"
								maxLength={50}
							/>
						</div>
						<div>
							<Label htmlFor="edit-lastname">{t("lastName")}</Label>
							<Input
								id="edit-lastname"
								value={editLastName}
								onChange={(e) => setEditLastName(e.target.value)}
								placeholder={t("placeholderLastName")}
								className="mt-1"
								maxLength={50}
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="edit-bio">{t("bio")}</Label>
						<Textarea
							id="edit-bio"
							value={editBio}
							onChange={(e) => setEditBio(e.target.value)}
							placeholder={t("placeholderBio")}
							className="mt-1"
							maxLength={200}
							rows={3}
						/>
						<span className="mt-1 block text-right text-xs text-muted-foreground">
							{editBio.length}/200
						</span>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={handleSave} disabled={saving || !editName.trim()}>
						{saving ? t("saving") : t("save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
