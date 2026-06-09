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

	// --- Black Hole Feature States & Effects ---
	const [blackHoleActive, setBlackHoleActive] = useState(false);
	const [absorbedMessageIds, setAbsorbedMessageIds] = useState<Set<string>>(
		new Set(),
	);
	const initialActiveMessageIdsRef = useRef<Set<string>>(new Set());
	const blackHoleActiveRef = useRef(blackHoleActive);

	useEffect(() => {
		blackHoleActiveRef.current = blackHoleActive;
	}, [blackHoleActive]);

	useEffect(() => {
		if (!blackHoleActive) {
			setAbsorbedMessageIds(new Set());
			initialActiveMessageIdsRef.current = new Set();
			return;
		}

		// Keep track of which messages are initially present when mode is turned ON
		const initialIds = new Set(messages.map((m) => m.id));
		initialActiveMessageIdsRef.current = initialIds;

		setAbsorbedMessageIds((prev) => {
			const next = new Set(prev);
			for (const msg of messages) {
				if (!next.has(msg.id)) {
					const isInitiallyNew = prev.size > 0;
					if (isInitiallyNew) {
						// Delay absorption of new messages by 5s so they can be read
						setTimeout(() => {
							if (blackHoleActiveRef.current) {
								setAbsorbedMessageIds((curr) => {
									const updated = new Set(curr);
									updated.add(msg.id);
									return updated;
								});
							}
						}, 5000);
					} else {
						// Absorb existing messages immediately (staggered delay will handle the visual staggered effect)
						next.add(msg.id);
					}
				}
			}
			return next;
		});
	}, [blackHoleActive, messages]);
	// -------------------------------------------

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
			<style>{`
				@keyframes blackhole-absorption {
					0% {
						transform: translateY(0) scale(1) rotate(0deg);
						opacity: 1;
						max-height: 200px;
						margin-bottom: 12px;
					}
					80% {
						transform: translateY(-80px) scale(0.3) rotate(180deg);
						opacity: 0.5;
						max-height: 200px;
						margin-bottom: 12px;
					}
					100% {
						transform: translateY(-150px) scale(0) rotate(360deg);
						opacity: 0;
						max-height: 0;
						margin-bottom: 0;
						padding-top: 0;
						padding-bottom: 0;
						border-width: 0;
						overflow: hidden;
					}
				}
				.animate-blackhole-absorb {
					animation: blackhole-absorption 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
				}
			`}</style>

			<ChatHeader
				partnerId={meta.partnerId}
				partnerUsername={meta.partnerUsername}
				partnerName={meta.partnerName}
				partnerImage={meta.partnerImage}
				friendStatus={meta.friendStatus}
				friendRequestId={meta.friendRequestId}
				blackHoleActive={blackHoleActive}
				onToggleBlackHole={() => setBlackHoleActive((active) => !active)}
			/>

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

				{/* Animated Black Hole Visual Header */}
				{blackHoleActive && (
					<div className="mb-6 flex flex-col items-center justify-center p-6 border-4 border-border bg-black text-white rounded-base shadow-brutal-sm relative overflow-hidden animate-in fade-in zoom-in duration-300">
						{/* Cosmic background stars */}
						<div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

						{/* Pulsing and spinning black hole */}
						<div className="relative w-20 h-20 flex items-center justify-center">
							{/* Outer accretion disk */}
							<div
								className="absolute inset-0 rounded-full border-4 border-dashed border-main animate-spin"
								style={{ animationDuration: "6s" }}
							></div>
							{/* Inner glowing orange/magenta disk */}
							<div
								className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-accent via-pink-500 to-main opacity-80 blur-sm animate-ping"
								style={{ animationDuration: "3s" }}
							></div>
							{/* The event horizon (black center) */}
							<div className="absolute w-10 h-10 rounded-full bg-black border-2 border-white shadow-[0_0_15px_#fff]"></div>
						</div>

						<p className="mt-3 font-heading text-lg uppercase tracking-wider text-main animate-pulse">
							Black Hole Active
						</p>
						<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
							Absorbing messages...
						</p>
					</div>
				)}

				<div className="space-y-3">
					{messages.map((msg) => {
						const isSelf =
							msg.senderId === meta.currentUserId || msg.id.startsWith("temp-");
						const isHighlighted =
							highlightActive && msg.id === highlightMessageId;
						const isAbsorbed = absorbedMessageIds.has(msg.id);
						const isInitial = initialActiveMessageIdsRef.current.has(msg.id);
						const staggerDelay = isInitial ? messages.indexOf(msg) * 100 : 0;

						return (
							<div
								key={msg.id}
								ref={msg.id === highlightMessageId ? highlightedRef : undefined}
								style={
									isAbsorbed
										? { animationDelay: `${staggerDelay}ms` }
										: undefined
								}
								className={cn(
									isHighlighted &&
										"rounded-md ring-3 ring-primary bg-primary/10 transition-all duration-500",
									isAbsorbed && "animate-blackhole-absorb",
								)}
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
