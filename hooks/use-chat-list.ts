"use client";

import { useCallback, useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import type { Conversation } from "@/lib/types";
import { useSocket } from "./use-socket";

interface GroupedConversations {
	friends: Conversation[];
	others: Conversation[];
}

export function useChatList(currentUserId?: string) {
	const [conversations, setConversations] = useState<GroupedConversations>({
		friends: [],
		others: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const { socket } = useSocket();

	const fetchConversations = useCallback(async () => {
		try {
			const res = await fetch("/api/conversations");
			if (res.ok) {
				const data = await res.json();
				setConversations({
					friends: data.friends ?? [],
					others: data.others ?? [],
				});
			}
		} catch {
			// Silently fail; user can reload
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchConversations();
		function onFocus() {
			fetchConversations();
		}
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [fetchConversations]);

	useEffect(() => {
		if (!socket) return;

		function handleNewMessage(data: {
			conversationId: string;
			body: string;
			createdAt: string;
			senderId: string;
		}) {
			setConversations((prev) => {
				const allConvos = [...prev.friends, ...prev.others];
				const idx = allConvos.findIndex((c) => c.id === data.conversationId);
				if (idx === -1) {
					fetchConversations();
					return prev;
				}

				const conv = allConvos[idx];
				const prevUnread =
					(conv as Conversation & { unreadCount?: number }).unreadCount ?? 0;
				// Do not count messages sent by the current user as unread.
				const isOwnMessage =
					currentUserId !== undefined && data.senderId === currentUserId;

				const updated = {
					...conv,
					lastMessage: {
						body: data.body,
						createdAt: data.createdAt,
						senderId: data.senderId,
					},
					unreadCount: isOwnMessage ? prevUnread : prevUnread + 1,
				};

				const rest = allConvos.filter((c) => c.id !== data.conversationId);
				const all = [updated, ...rest];
				return {
					friends: all.filter((c) => c.isFriend),
					others: all.filter((c) => !c.isFriend),
				};
			});
		}

		function handleFriendUpdate() {
			fetchConversations();
		}

		socket.on(SocketEvent.MESSAGE_NEW, handleNewMessage);
		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, handleFriendUpdate);
		return () => {
			socket.off(SocketEvent.MESSAGE_NEW, handleNewMessage);
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, handleFriendUpdate);
		};
	}, [socket, fetchConversations, currentUserId]);

	return { conversations, isLoading, refetch: fetchConversations };
}
