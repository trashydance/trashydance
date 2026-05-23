"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";
import { useSocket } from "./use-socket";

export function useChat(conversationId: string) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasMore, setHasMore] = useState(true);
	const cursorRef = useRef<string | null>(null);
	const { socket } = useSocket();

	// Load initial messages
	useEffect(() => {
		async function loadInitial() {
			setIsLoading(true);
			try {
				const res = await fetch(
					`/api/conversations/${conversationId}/messages?limit=50`,
				);
				if (res.ok) {
					const data: Message[] = await res.json();
					setMessages(data);
					if (data.length > 0) {
						cursorRef.current = data[0].id;
					}
					setHasMore(data.length === 50);
				}
			} catch {
				// Silently fail
			} finally {
				setIsLoading(false);
			}
		}

		loadInitial();
	}, [conversationId]);

	// Listen for incoming messages
	useEffect(() => {
		if (!socket) return;

		function handleIncoming(message: Message) {
			if (message.conversationId === conversationId) {
				setMessages((prev) => {
					// Prevent duplicates
					if (prev.some((m) => m.id === message.id)) return prev;
					return [...prev, message];
				});
			}
		}

		socket.on("message:new", handleIncoming);
		return () => {
			socket.off("message:new", handleIncoming);
		};
	}, [socket, conversationId]);

	const loadMore = useCallback(async () => {
		if (!hasMore || isLoading) return;

		try {
			const params = new URLSearchParams({ limit: "50" });
			if (cursorRef.current) {
				params.set("cursor", cursorRef.current);
			}
			const res = await fetch(
				`/api/conversations/${conversationId}/messages?${params.toString()}`,
			);
			if (res.ok) {
				const data: Message[] = await res.json();
				if (data.length > 0) {
					cursorRef.current = data[0].id;
					setMessages((prev) => [...data, ...prev]);
				}
				setHasMore(data.length === 50);
			}
		} catch {
			// Silently fail
		}
	}, [conversationId, hasMore, isLoading]);

	const sendMessage = useCallback(
		async (body: string) => {
			const tempId = `temp-${crypto.randomUUID()}`;
			const optimisticMessage: Message = {
				id: tempId,
				conversationId,
				senderId: "", // Will be filled by the caller
				body,
				createdAt: new Date().toISOString(),
				status: "sending",
			};

			setMessages((prev) => [...prev, optimisticMessage]);

			try {
				const res = await fetch(
					`/api/conversations/${conversationId}/messages`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ body }),
					},
				);

				if (res.ok) {
					const saved: Message = await res.json();
					setMessages((prev) =>
						prev.map((m) =>
							m.id === tempId ? { ...saved, status: "sent" as const } : m,
						),
					);
				} else {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === tempId ? { ...m, status: "error" as const } : m,
						),
					);
				}
			} catch {
				setMessages((prev) =>
					prev.map((m) =>
						m.id === tempId ? { ...m, status: "error" as const } : m,
					),
				);
			}
		},
		[conversationId],
	);

	const retryMessage = useCallback(
		(messageId: string) => {
			const msg = messages.find((m) => m.id === messageId);
			if (msg?.status === "error") {
				setMessages((prev) => prev.filter((m) => m.id !== messageId));
				sendMessage(msg.body);
			}
		},
		[messages, sendMessage],
	);

	return {
		messages,
		sendMessage,
		retryMessage,
		loadMore,
		isLoading,
		hasMore,
	};
}
