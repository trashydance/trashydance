"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Message } from "@/lib/types";
import { useSocket } from "./use-socket";

const SOCKET_ACK_TIMEOUT_MS = 10_000;

function generateUUID(): string {
	try {
		// Prefer native randomUUID when available (Node 18+ / modern browsers)
		if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
			// biome-ignore lint/suspicious/noExplicitAny: fallback for environments without typed randomUUID
			return (crypto as any).randomUUID();
		}

		// Fallback to Web Crypto API if present
		if (
			typeof window !== "undefined" &&
			window.crypto &&
			window.crypto.getRandomValues
		) {
			const buf = new Uint8Array(16);
			window.crypto.getRandomValues(buf);
			// Per RFC4122 v4
			buf[6] = (buf[6] & 0x0f) | 0x40;
			buf[8] = (buf[8] & 0x3f) | 0x80;
			const hex = Array.from(buf)
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
		}
	} catch {
		// ignore
	}

	// Last-resort fallback (not RFC-compliant but reasonably unique for temp ids)
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(
	conversationId: string,
	initialMessages?: Message[],
	initialHasMore?: boolean,
	initialCursor?: number | null,
) {
	const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
	const [isLoading, setIsLoading] = useState(!initialMessages);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(initialHasMore ?? true);
	const cursorRef = useRef<string | number | null>(initialCursor ?? null);
	const { socket } = useSocket();
	const { t } = useI18n();

	// Seeded by the server component: skip the initial fetch entirely.
	const seededRef = useRef(Boolean(initialMessages));

	useEffect(() => {
		if (seededRef.current) return;

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

	useEffect(() => {
		if (!socket) return;

		function handleIncoming(message: Message) {
			if (message.conversationId === conversationId) {
				setMessages((prev) => {
					if (prev.some((m) => m.id === message.id)) return prev;
					return [...prev, message];
				});
			}
		}

		socket.on(SocketEvent.MESSAGE_NEW, handleIncoming);
		return () => {
			socket.off(SocketEvent.MESSAGE_NEW, handleIncoming);
		};
	}, [socket, conversationId]);

	const loadMore = useCallback(async () => {
		if (!hasMore || isLoading || isLoadingMore) return;

		setIsLoadingMore(true);
		try {
			const params = new URLSearchParams({ limit: "50" });
			if (cursorRef.current) {
				params.set("cursor", String(cursorRef.current));
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
		} finally {
			setIsLoadingMore(false);
		}
	}, [conversationId, hasMore, isLoading, isLoadingMore]);

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
			let finalBody = body;
			const trimmed = body.trim().toLowerCase();
			if (
				trimmed === "/flip" ||
				trimmed === "/coin" ||
				trimmed === "/coinflip"
			) {
				const isHeads = Math.random() < 0.5;
				finalBody = isHeads ? t("coinFlipHeads") : t("coinFlipTails");
			}

			const tempId = `temp-${generateUUID()}`;
			const optimisticMessage: Message = {
				id: tempId,
				conversationId,
				senderId: "",
				body: finalBody,
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

			fetch(`/api/conversations/${conversationId}/read`, {
				method: "POST",
			}).catch(() => {});

			const payload = {
				conversationId,
				body: finalBody,
				...(fileInfo && {
					fileName: fileInfo.fileName,
					fileUrl: fileInfo.fileUrl,
					fileType: fileInfo.fileType,
					fileSize: fileInfo.fileSize,
				}),
			};

			if (socket?.connected) {
				// Guard against a missing ack leaving the message stuck on "sending".
				let acked = false;
				const ackTimeout = setTimeout(() => {
					if (acked) return;
					acked = true;
					setMessages((prev) =>
						prev.map((m) =>
							m.id === tempId ? { ...m, status: "error" as const } : m,
						),
					);
				}, SOCKET_ACK_TIMEOUT_MS);

				socket.emit(
					SocketEvent.MESSAGE_SEND,
					payload,
					(res: { ok?: boolean; message?: Message; error?: string }) => {
						if (acked) return;
						acked = true;
						clearTimeout(ackTimeout);
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
		[conversationId, socket, t],
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
		isLoadingMore,
		hasMore,
		setMessages,
	};
}
