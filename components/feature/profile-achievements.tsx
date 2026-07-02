"use client";

import { Award, Star, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ProfileAchievementsProps {
	messageCount: number;
	friendCount: number;
	twoFactorEnabled: boolean;
}

export function ProfileAchievements({
	messageCount,
	friendCount,
	twoFactorEnabled,
}: ProfileAchievementsProps) {
	const { t } = useI18n();

	const achievements = [
		{
			id: "first_msg",
			title: t("achievementFirstMsg"),
			desc: t("achievementFirstMsgDesc"),
			unlocked: messageCount > 0,
			icon: Star,
			color: "bg-main",
		},
		{
			id: "socializer",
			title: t("achievementSocializer"),
			desc: t("achievementSocializerDesc"),
			unlocked: friendCount > 0,
			icon: Trophy,
			color: "bg-secondary",
		},
		{
			id: "secure",
			title: t("achievement2fa"),
			desc: t("achievement2faDesc"),
			unlocked: twoFactorEnabled,
			icon: Award,
			color: "bg-green-400",
		},
	];

	return (
		<div className="mt-6 rounded-base border-4 border-border bg-accent p-6 text-accent-foreground shadow-shadow">
			<h3 className="font-heading text-lg mb-4 uppercase tracking-wide flex items-center gap-2">
				<Trophy className="size-5" />
				{t("gamificationTitle")}
			</h3>
			<div className="grid gap-3 sm:grid-cols-3">
				{achievements.map((ach) => {
					const Icon = ach.icon;
					return (
						<div
							key={ach.id}
							className={`relative flex flex-col items-center p-4 border-2 border-border text-center rounded-base transition-all duration-200 ${
								ach.unlocked
									? "bg-card text-foreground shadow-shadow"
									: "bg-muted text-muted-foreground opacity-50 select-none"
							}`}
						>
							<div
								className={`p-2 border-2 border-border rounded-full mb-2 ${
									ach.unlocked ? ach.color : "bg-neutral-300 text-neutral-500"
								}`}
							>
								<Icon className="size-5" />
							</div>
							<p className="text-xs font-black uppercase tracking-wide">
								{ach.title}
							</p>
							<p className="text-[10px] mt-1 text-muted-foreground leading-snug">
								{ach.desc}
							</p>
							{ach.unlocked && (
								<span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] font-black border-2 border-border px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
									✓
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
