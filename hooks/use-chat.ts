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
					const json = await res.json();
					const data: Message[] = json.messages ?? json;
					setMessages(data.reverse());
					setHasMore(json.hasMore ?? data.length === 50);
					if (json.nextCursor) {
						cursorRef.current = json.nextCursor;
					}
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
				const json = await res.json();
				const data: Message[] = json.messages ?? json;
				if (data.length > 0) {
					setMessages((prev) => [...data.reverse(), ...prev]);
				}
				setHasMore(json.hasMore ?? data.length === 50);
				if (json.nextCursor) {
					cursorRef.current = json.nextCursor;
				}
			}
		} catch {
			// Silently fail
		}
	}, [conversationId, hasMore, isLoading]);

	const sendMessage = useCallback(
		async (
			body: string,
			fileInfo?: {
				fileName: string;
				fileUrl: string;
				fileType: string;
				fileSize: number;
			},
		) => {
			const tempId = `temp-${crypto.randomUUID()}`;
			const optimisticMessage: Message = {
				id: tempId,
				conversationId,
				senderId: "",
				body,
				createdAt: new Date().toISOString(),
				status: "sending",
				...(fileInfo && {
					fileName: fileInfo.fileName,
					fileUrl: fileInfo.fileUrl,
					fileType: fileInfo.fileType,
					fileSize: fileInfo.fileSize,
				}),
			};

			setMessages((prev) => [...prev, optimisticMessage]);

			// Mark chat as read since user is actively viewing it
			fetch(`/api/conversations/${conversationId}/read`, {
				method: "POST",
			}).catch(() => {});

			const payload = {
				conversationId,
				body,
				...(fileInfo && {
					fileName: fileInfo.fileName,
					fileUrl: fileInfo.fileUrl,
					fileType: fileInfo.fileType,
					fileSize: fileInfo.fileSize,
				}),
			};

			if (socket?.connected) {
				socket.emit(
					"message:send",
					payload,
					(res: { ok?: boolean; message?: Message; error?: string }) => {
						if (res?.ok && res.message) {
							setMessages((prev) =>
								prev.map((m) =>
									m.id === tempId
										? { ...(res.message as Message), status: "sent" as const }
										: m,
								),
							);
						} else {
							setMessages((prev) =>
								prev.map((m) =>
									m.id === tempId ? { ...m, status: "error" as const } : m,
								),
							);
						}
					},
				);
				return;
			}

			try {
				const res = await fetch(
					`/api/conversations/${conversationId}/messages`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
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
		[conversationId, socket],
	);

	const retryMessage = useCallback(
		(messageId: string) => {
			const msg = messages.find((m) => m.id === messageId);
			if (msg?.status === "error") {
				setMessages((prev) => prev.filter((m) => m.id !== messageId));
				const fileInfo =
					msg.fileName && msg.fileUrl && msg.fileType && msg.fileSize
						? {
								fileName: msg.fileName,
								fileUrl: msg.fileUrl,
								fileType: msg.fileType,
								fileSize: msg.fileSize,
							}
						: undefined;
				sendMessage(msg.body, fileInfo);
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
