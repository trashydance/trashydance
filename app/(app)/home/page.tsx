import type { Metadata } from "next";
import { HomeClient } from "@/components/feature/home-client";
import { getConversationList } from "@/lib/data/conversations";
import { requireUser } from "@/lib/data/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Chat",
};

export default async function HomePage() {
	const me = await requireUser();
	const conversations = await getConversationList(me.id);

	return (
		<HomeClient initialConversations={conversations} currentUserId={me.id} />
	);
}
