import { CalendarDays, ExternalLink, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileActions } from "@/components/feature/profile-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfileByUsername } from "@/lib/data/profile";
import { getCurrentUser, requireUser } from "@/lib/data/session";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { username } = await params;
	const me = await getCurrentUser();
	if (!me) return {};
	const profile = await getProfileByUsername(me.id, username);
	if (!profile) return {};
	return { title: profile.username || profile.name };
}

export default async function ProfilePage({ params }: Props) {
	const { username } = await params;
	const me = await requireUser();
	const profile = await getProfileByUsername(me.id, username);
	if (!profile) notFound();

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

			<ProfileActions profile={profile} />
		</div>
	);
}
