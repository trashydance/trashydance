"use client";

import { MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { ChatListItem } from "@/components/feature/chat-list-item";
import { EmptyState } from "@/components/feature/empty-state";
import { SearchBar } from "@/components/feature/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatList } from "@/hooks/use-chat-list";
import { usePresence } from "@/hooks/use-presence";
import { useSearch } from "@/hooks/use-search";

export default function HomePage() {
	const { conversations, isLoading } = useChatList();
	const { query, setQuery } = useSearch();

	const friendPartnerIds = useMemo(
		() => conversations.friends.map((c) => c.partner.id),
		[conversations.friends],
	);
	const presenceMap = usePresence(friendPartnerIds);

	const allConversations = useMemo(
		() => [...conversations.friends, ...conversations.others],
		[conversations],
	);

	const filtered = useMemo(() => {
		if (!query.trim()) return null;
		const lowerQ = query.toLowerCase();
		const matching = allConversations.filter(
			(c) =>
				c.partner.username.toLowerCase().includes(lowerQ) ||
				c.partner.name.toLowerCase().includes(lowerQ),
		);
		return {
			friends: matching.filter((c) => c.isFollowing),
			others: matching.filter((c) => !c.isFollowing),
		};
	}, [query, allConversations]);

	const displayConversations = filtered ?? conversations;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={`skel-${i.toString()}`} className="h-16 w-full" />
				))}
			</div>
		);
	}

	const isEmpty =
		displayConversations.friends.length === 0 &&
		displayConversations.others.length === 0;

	return (
		<div className="space-y-6">
			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder="Filter conversations..."
			/>

			{isEmpty ? (
				<EmptyState
					icon={MessageSquare}
					title="No conversations yet"
					description="Start your first chat by searching for users."
					actionLabel="Start your first chat"
					actionHref="/search"
				/>
			) : (
				<div className="space-y-6">
					{displayConversations.friends.length > 0 && (
						<section>
							<h2 className="mb-3 font-heading text-lg font-bold">Friends</h2>
							<div className="space-y-2">
								{displayConversations.friends.map((c) => (
									<ChatListItem
										key={c.id}
										conversation={c}
										showOnlineIndicator
										isOnline={presenceMap.get(c.partner.id) ?? false}
									/>
								))}
							</div>
						</section>
					)}

					{displayConversations.others.length > 0 && (
						<section>
							<h2 className="mb-3 font-heading text-lg font-bold">Others</h2>
							<div className="space-y-2">
								{displayConversations.others.map((c) => (
									<ChatListItem key={c.id} conversation={c} />
								))}
							</div>
						</section>
					)}
				</div>
			)}
		</div>
	);
}
