"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/feature/chat-header";
import { MessageBubble } from "@/components/feature/message-bubble";
import { MessageInput } from "@/components/feature/message-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/use-chat";

interface ConversationMeta {
	partnerId: string;
	partnerUsername: string;
	partnerImage: string | null;
	isFollowing: boolean;
	currentUserId: string;
}

export default function ChatPage() {
	const params = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const highlightMessageId = searchParams.get("messageId");

	const conversationId = params.id;
	const { messages, sendMessage, retryMessage, loadMore, isLoading, hasMore } =
		useChat(conversationId);

	const [meta, setMeta] = useState<ConversationMeta | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const highlightedRef = useRef<HTMLDivElement>(null);
	const [highlightActive, setHighlightActive] = useState(false);

	// Fetch conversation metadata
	useEffect(() => {
		async function fetchMeta() {
			try {
				const res = await fetch(`/api/conversations/${conversationId}`);
				if (res.ok) {
					const data = await res.json();
					setMeta({
						partnerId: data.partner.id,
						partnerUsername: data.partner.username,
						partnerImage: data.partner.image,
						isFollowing: data.isFollowing,
						currentUserId: data.currentUserId,
					});
				}
			} catch {
				// Silently fail
			}
		}
		fetchMeta();
	}, [conversationId]);

	// Scroll to bottom on new messages
	useEffect(() => {
		if (messages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Scroll to highlighted message
	useEffect(() => {
		if (highlightMessageId && !isLoading) {
			setHighlightActive(true);
			const timer = setTimeout(() => setHighlightActive(false), 2000);
			highlightedRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			return () => clearTimeout(timer);
		}
	}, [highlightMessageId, isLoading]);

	// Scroll-to-load-more
	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (el && el.scrollTop === 0 && hasMore && !isLoading) {
			loadMore();
		}
	}, [hasMore, isLoading, loadMore]);

	if (!meta) {
		return (
			<div className="flex h-[calc(100svh-8rem)] flex-col gap-4 p-4">
				<Skeleton className="h-14 w-full" />
				<div className="flex-1 space-y-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton
							key={`msg-skel-${i.toString()}`}
							className={`h-12 ${i % 2 === 0 ? "ml-auto w-2/3" : "w-2/3"}`}
						/>
					))}
				</div>
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100svh-8rem)] flex-col -mx-4 -my-6">
			<ChatHeader
				partnerId={meta.partnerId}
				partnerUsername={meta.partnerUsername}
				partnerImage={meta.partnerImage}
				isFollowing={meta.isFollowing}
			/>

			<div
				ref={containerRef}
				onScroll={handleScroll}
				className="custom-scroll flex-1 overflow-y-auto px-4 py-4"
			>
				{isLoading && (
					<div className="mb-4 space-y-2">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton
								key={`load-skel-${i.toString()}`}
								className="h-10 w-1/2"
							/>
						))}
					</div>
				)}

				<div className="space-y-3">
					{messages.map((msg) => {
						const isSelf = msg.senderId === meta.currentUserId;
						const isHighlighted =
							highlightActive && msg.id === highlightMessageId;

						return (
							<div
								key={msg.id}
								ref={msg.id === highlightMessageId ? highlightedRef : undefined}
								className={
									isHighlighted
										? "rounded-md ring-2 ring-primary animate-pulse"
										: undefined
								}
							>
								<MessageBubble
									body={msg.body}
									createdAt={msg.createdAt}
									isSelf={isSelf}
									status={isSelf ? (msg.status ?? "sent") : undefined}
									onRetry={
										msg.status === "error"
											? () => retryMessage(msg.id)
											: undefined
									}
								/>
							</div>
						);
					})}
				</div>
				<div ref={messagesEndRef} />
			</div>

			<div className="border-t-2 border-foreground bg-card px-4 py-3">
				<MessageInput onSend={sendMessage} />
			</div>
		</div>
	);
}
