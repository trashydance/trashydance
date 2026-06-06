"use client";

import { MessageSquare, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatListItem } from "@/components/feature/chat-list-item";
import { EmptyState } from "@/components/feature/empty-state";
import { SearchBar } from "@/components/feature/search-bar";
import { SectionHeader } from "@/components/feature/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatList } from "@/hooks/use-chat-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePresence } from "@/hooks/use-presence";
import { authClient } from "@/lib/auth-client";
import { DEBOUNCE_MS } from "@/lib/constants";
import { formatRelativeTime, truncateText } from "@/lib/utils";

interface SearchResultMessage {
	id: string;
	conversationId: string;
	body: string;
	createdAt: number | null;
	sender: { name: string; username: string | null };
}

interface SearchResultUser {
	id: string;
	name: string;
	username: string | null;
	image: string | null;
}

interface GlobalSearchResults {
	users: SearchResultUser[];
	messages: SearchResultMessage[];
}

export default function HomePage() {
	const { data: session } = authClient.useSession();
	const { conversations, isLoading } = useChatList(session?.user?.id);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] =
		useState<GlobalSearchResults | null>(null);
	const [searching, setSearching] = useState(false);
	const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

	const friendPartnerIds = useMemo(
		() => conversations.friends.map((c) => c.partner.id),
		[conversations.friends],
	);
	const presenceMap = usePresence(friendPartnerIds);

	const allConversations = useMemo(
		() => [...conversations.friends, ...conversations.others],
		[conversations],
	);

	const doSearch = useCallback(async (q: string) => {
		if (!q.trim()) {
			setSearchResults(null);
			setSearching(false);
			return;
		}
		setSearching(true);
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
			if (res.ok) {
				const data = await res.json();
				setSearchResults(data);
			}
		} catch {
			// silently fail
		} finally {
			setSearching(false);
		}
	}, []);

	useEffect(() => {
		doSearch(debouncedQuery);
	}, [debouncedQuery, doSearch]);

	const filteredConversations = useMemo(() => {
		if (!query.trim()) return null;
		const lowerQ = query.toLowerCase();
		const matching = allConversations.filter(
			(c) =>
				(c.partner.username ?? "").toLowerCase().includes(lowerQ) ||
				c.partner.name.toLowerCase().includes(lowerQ),
		);
		return {
			friends: matching.filter((c) => c.isFriend),
			others: matching.filter((c) => !c.isFriend),
		};
	}, [query, allConversations]);

	const displayConversations = filteredConversations ?? conversations;
	const hasSearchResults =
		searchResults &&
		(searchResults.users.length > 0 || searchResults.messages.length > 0);

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
		conversations.friends.length === 0 && conversations.others.length === 0;

	return (
		<div className="space-y-6">
			<h1 className="font-heading text-5xl">Inbox.</h1>

			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder="Search people, or words inside chats..."
			/>

			{searching && (
				<div className="space-y-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			)}

			{query.trim() && hasSearchResults && !searching && (
				<div className="space-y-4">
					{searchResults.messages.length > 0 && (
						<section>
							<SectionHeader
								title="Messages"
								count={searchResults.messages.length}
							/>
							<div className="space-y-2">
								{searchResults.messages.map((msg) => (
									<Link
										key={msg.id}
										href={`/chat/${msg.conversationId}?messageId=${msg.id}`}
										className="block rounded-base border-2 border-border bg-card p-3 transition-all hover:brutal-lift-hover"
									>
										<div className="flex items-center justify-between gap-2">
											<span className="text-xs font-medium text-muted-foreground">
												{msg.sender.username ?? msg.sender.name}
											</span>
											{msg.createdAt && (
												<span className="text-xs text-muted-foreground">
													{formatRelativeTime(msg.createdAt.toString())}
												</span>
											)}
										</div>
										<p className="mt-1 text-sm">{truncateText(msg.body, 80)}</p>
									</Link>
								))}
							</div>
						</section>
					)}
				</div>
			)}

			{query.trim() &&
				!hasSearchResults &&
				!searching &&
				displayConversations.friends.length === 0 &&
				displayConversations.others.length === 0 && (
					<EmptyState
						icon={SearchIcon}
						title="No results"
						description={`No conversations or messages matching "${query}".`}
					/>
				)}

			{isEmpty && !query.trim() ? (
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
							<SectionHeader
								title="Following"
								count={displayConversations.friends.length}
							/>
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
							<SectionHeader
								title="Others"
								count={displayConversations.others.length}
							/>
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
