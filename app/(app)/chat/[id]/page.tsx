import { notFound } from "next/navigation";
import { ChatClient } from "@/components/feature/chat-client";
import {
	getConversationMeta,
	getInitialMessages,
} from "@/lib/data/conversations";
import { requireUser } from "@/lib/data/session";

type Props = { params: Promise<{ id: string }> };

export default async function ChatPage({ params }: Props) {
	const { id } = await params;
	const me = await requireUser();

	const meta = await getConversationMeta(me.id, id);
	if (!meta || meta === "forbidden") notFound();

	const initial = await getInitialMessages(me.id, id);
	if (!initial) notFound();

	return (
		<ChatClient
			conversationId={id}
			meta={{
				partnerId: meta.partner.id,
				partnerUsername: meta.partner.username,
				partnerImage: meta.partner.image,
				friendStatus: meta.friendStatus,
				friendRequestId: meta.friendRequestId ?? undefined,
				currentUserId: meta.currentUserId,
			}}
			initialMessages={initial.messages}
			initialHasMore={initial.hasMore}
			initialCursor={initial.nextCursor}
		/>
	);
}
