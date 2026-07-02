import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileInfoCard } from "@/components/feature/profile-info-card";
import { getProfileByUsername } from "@/lib/data/profile";
import { getCurrentUser, requireUser } from "@/lib/data/session";
import db from "@/lib/db";
import { message, user } from "@/schema";

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

	const profileUserObj = db
		.select({ twoFactorEnabled: user.twoFactorEnabled })
		.from(user)
		.where(eq(user.id, profile.id))
		.get();
	const twoFactorEnabled = profileUserObj?.twoFactorEnabled ?? false;

	const messageCountResult = db
		.select({ value: count() })
		.from(message)
		.where(eq(message.senderId, profile.id))
		.get();
	const messageCount = messageCountResult?.value ?? 0;

	return (
		<ProfileInfoCard
			profile={profile}
			twoFactorEnabled={twoFactorEnabled}
			messageCount={messageCount}
		/>
	);
}
