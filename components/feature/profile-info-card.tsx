"use client";

import { CalendarDays, ExternalLink, Users } from "lucide-react";
import { ProfileAchievements } from "@/components/feature/profile-achievements";
import { ProfileActions } from "@/components/feature/profile-actions";
import { ProfileAvatar } from "@/components/feature/profile-avatar";
import { INTRA_PROFILE_BASE_URL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Profile } from "@/lib/types";

interface ProfileInfoCardProps {
	profile: Profile;
	twoFactorEnabled: boolean;
	messageCount: number;
}

export function ProfileInfoCard({
	profile,
	twoFactorEnabled,
	messageCount,
}: ProfileInfoCardProps) {
	const { t, language } = useI18n();

	const displayName = profile.username || profile.name;
	const fullName = [profile.name, profile.lastName].filter(Boolean).join(" ");

	// Localized date formatting based on current language
	const localeMap = { en: "en-US", it: "it-IT", bg: "bg-BG" };
	const locale = localeMap[language] || "en-US";
	const joinDate = new Date(profile.createdAt).toLocaleDateString(locale, {
		month: "long",
		year: "numeric",
	});

	return (
		<div className="mx-auto w-full max-w-2xl py-8">
			<div className="rounded-base border-4 border-border bg-card p-6 shadow-brutal-cobalt sm:p-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:gap-10 sm:items-center">
					<ProfileAvatar profile={profile} />

					<div className="min-w-0 flex-1 space-y-3">
						<div>
							<h1 className="font-heading text-4xl leading-tight">
								{displayName}
							</h1>
							{fullName && (
								<p className="mt-1.5 text-sm text-muted-foreground">
									{fullName}
								</p>
							)}
						</div>
						{profile.isOwnProfile && (
							<div className="flex flex-wrap items-center gap-2">
								<span className="border-2 border-border bg-main px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-main-foreground">
									{t("online")}
								</span>
								<span className="border-2 border-border bg-secondary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
									{t("you")}
								</span>
							</div>
						)}
						{profile.bio && (
							<p className="text-sm leading-normal break-words">
								{profile.bio}
							</p>
						)}
					</div>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
					<div className="border-2 border-border p-4 text-center">
						<span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							<Users className="size-3.5" />
							{t("friends").replace(/\.$/, "")}
						</span>
						<span className="mt-1 block text-xl font-bold">
							{profile.friendCount}
						</span>
					</div>
					<div className="border-2 border-border p-4 text-center">
						<span className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							<CalendarDays className="size-3.5" />
							{t("since")}
						</span>
						<span className="mt-1 block text-base font-bold capitalize">
							{joinDate}
						</span>
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
					<ProfileActions profile={profile} />
				</div>

				<ProfileAchievements
					messageCount={messageCount}
					friendCount={profile.friendCount}
					twoFactorEnabled={twoFactorEnabled}
				/>
			</div>
		</div>
	);
}
