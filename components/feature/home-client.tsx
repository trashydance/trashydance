"use client";

import { MessageSquare, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatListItem } from "@/components/feature/chat-list-item";
import { EmptyState } from "@/components/feature/empty-state";
import { SearchBar } from "@/components/feature/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { type GroupedConversations, useChatList } from "@/hooks/use-chat-list";
import { usePresence } from "@/hooks/use-presence";
import { createConversation } from "@/lib/actions/conversations";
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

interface HomeClientProps {
	initialConversations: GroupedConversations;
}

export function HomeClient({ initialConversations }: HomeClientProps) {
	const router = useRouter();
	const { toast } = useToast();
	const { conversations } = useChatList(initialConversations);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] =
		useState<GlobalSearchResults | null>(null);
	const [searching, setSearching] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => doSearch(query), 300);
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [query, doSearch]);

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

	// Friend without a conversation yet: create it, then open the chat
	const handleStartChat = useCallback(
		async (partnerId: string) => {
			try {
				const res = await createConversation(partnerId);
				if (res.ok) {
					router.push(`/chat/${res.data.id}`);
				} else {
					toast(res.error, "error");
				}
			} catch {
				toast("Something went wrong", "error");
			}
		},
		[router, toast],
	);

	const isEmpty =
		conversations.friends.length === 0 && conversations.others.length === 0;

	return (
		<div className="space-y-6">
			<SearchBar
				value={query}
				onChange={setQuery}
				placeholder="Search conversations & messages..."
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
							<h2 className="mb-2 font-heading text-lg font-bold">Messages</h2>
							<div className="space-y-2">
								{searchResults.messages.map((msg) => (
									<Link
										key={msg.id}
										href={`/chat/${msg.conversationId}?messageId=${msg.id}`}
										className="block rounded-md border-2 border-border bg-background p-3 shadow-[4px_4px_0px_0px] shadow-border transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
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
							<h2 className="mb-3 font-heading text-lg font-bold">Following</h2>
							<div className="space-y-2">
								{displayConversations.friends.map((c) => (
									<ChatListItem
										key={c.id || c.partner.id}
										conversation={c}
										showOnlineIndicator
										isOnline={presenceMap.get(c.partner.id) ?? false}
										onStartChat={
											c.id ? undefined : () => handleStartChat(c.partner.id)
										}
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
