"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/feature/chat-header";
import { MessageBubble } from "@/components/feature/message-bubble";
import { MessageInput } from "@/components/feature/message-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/use-chat";
import { HIGHLIGHT_DURATION_MS } from "@/lib/constants";
import type { FriendStatus, Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConversationMetaProps {
	partnerId: string;
	partnerUsername: string;
	partnerName?: string;
	partnerImage: string | null;
	friendStatus: FriendStatus;
	friendRequestId?: string;
	currentUserId: string;
}

interface ChatClientProps {
	conversationId: string;
	meta: ConversationMetaProps;
	initialMessages: Message[];
	initialHasMore: boolean;
	initialCursor: number | null;
}

export function ChatClient({
	conversationId,
	meta,
	initialMessages,
	initialHasMore,
	initialCursor,
}: ChatClientProps) {
	const searchParams = useSearchParams();
	const highlightMessageId = searchParams.get("messageId");

	const {
		messages,
		sendMessage,
		retryMessage,
		loadMore,
		isLoading,
		isLoadingMore,
		hasMore,
	} = useChat(conversationId, initialMessages, initialHasMore, initialCursor);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const highlightedRef = useRef<HTMLDivElement>(null);
	const [highlightActive, setHighlightActive] = useState(false);

	useEffect(() => {
		fetch(`/api/conversations/${conversationId}/read`, {
			method: "POST",
		}).catch(() => {});
	}, [conversationId]);

	const hasScrolledToHighlight = useRef(false);
	const prevMessageCount = useRef(0);

	// Scroll to bottom for new messages (skip when navigating to a highlighted message)
	useEffect(() => {
		if (highlightMessageId) {
			prevMessageCount.current = messages.length;
			return;
		}
		if (messages.length > 0 && prevMessageCount.current === 0) {
			requestAnimationFrame(() => {
				const el = containerRef.current;
				if (el) el.scrollTop = el.scrollHeight;
			});
		} else if (
			messages.length > prevMessageCount.current &&
			prevMessageCount.current > 0
		) {
			requestAnimationFrame(() => {
				const el = containerRef.current;
				if (el) el.scrollTop = el.scrollHeight;
			});
		}
		prevMessageCount.current = messages.length;
	}, [messages, highlightMessageId]);

	// Scroll to highlighted message — load older pages until found
	useEffect(() => {
		if (!highlightMessageId || hasScrolledToHighlight.current) return;
		if (isLoading || isLoadingMore) return;

		const target = messages.find((m) => m.id === highlightMessageId);
		if (!target) {
			if (hasMore) loadMore();
			return;
		}

		hasScrolledToHighlight.current = true;
		setHighlightActive(true);

		setTimeout(() => {
			highlightedRef.current?.scrollIntoView({
				behavior: "instant",
				block: "center",
			});
		}, 50);

		const timer = setTimeout(
			() => setHighlightActive(false),
			HIGHLIGHT_DURATION_MS,
		);
		return () => clearTimeout(timer);
	}, [
		highlightMessageId,
		isLoading,
		isLoadingMore,
		messages,
		hasMore,
		loadMore,
	]);

	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (el && el.scrollTop === 0 && hasMore && !isLoading && !isLoadingMore) {
			loadMore();
		}
	}, [hasMore, isLoading, isLoadingMore, loadMore]);

	// Allow dismissing the highlight by clicking the messages container
	const handleContainerClick = useCallback(() => {
		if (highlightActive) setHighlightActive(false);
	}, [highlightActive]);

	// Dismiss highlight with Escape key
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && highlightActive) setHighlightActive(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [highlightActive]);

	return (
		<div className="flex h-[calc(100svh-8rem)] flex-col -mx-4 -my-6">
			<ChatHeader
				partnerId={meta.partnerId}
				partnerUsername={meta.partnerUsername}
				partnerName={meta.partnerName}
				partnerImage={meta.partnerImage}
				friendStatus={meta.friendStatus}
				friendRequestId={meta.friendRequestId}
			/>

			{/* biome-ignore lint/a11y/noStaticElementInteractions: container click dismisses highlight */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: escape key handler is already registered */}
			<div
				ref={containerRef}
				onScroll={handleScroll}
				onClick={handleContainerClick}
				className="custom-scroll flex-1 overflow-y-auto px-4 py-4"
			>
				{(isLoading || isLoadingMore) && (
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
						const isSelf =
							msg.senderId === meta.currentUserId || msg.id.startsWith("temp-");
						const isHighlighted =
							highlightActive && msg.id === highlightMessageId;

						return (
							<div
								key={msg.id}
								ref={msg.id === highlightMessageId ? highlightedRef : undefined}
								className={cn(
									"relative",
									isHighlighted &&
										"rounded-md ring-3 ring-primary bg-primary/10 transition-all duration-500 p-1",
								)}
							>
								{isHighlighted && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setHighlightActive(false);
											const url = new URL(window.location.href);
											url.searchParams.delete("messageId");
											window.history.replaceState(
												{},
												"",
												url.pathname + url.search,
											);
										}}
										className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full border-2 border-border bg-destructive text-destructive-foreground shadow-brutal-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
										title="Remove highlight"
									>
										<span className="text-[10px] font-bold">X</span>
									</button>
								)}
								<MessageBubble
									partnerName={meta.partnerName}
									partnerImage={meta.partnerImage}
									body={msg.body}
									createdAt={msg.createdAt}
									isSelf={isSelf}
									status={isSelf ? (msg.status ?? "sent") : undefined}
									onRetry={
										msg.status === "error"
											? () => retryMessage(msg.id)
											: undefined
									}
									fileName={msg.fileName}
									fileUrl={msg.fileUrl}
									fileType={msg.fileType}
									fileSize={msg.fileSize}
								/>
							</div>
						);
					})}
				</div>
				<div ref={messagesEndRef} />
			</div>

			<div className="border-t-2 border-border bg-background px-4 py-3">
				<MessageInput onSend={sendMessage} conversationId={conversationId} />
			</div>
		</div>
	);
}
