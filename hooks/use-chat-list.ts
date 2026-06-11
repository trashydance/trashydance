"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SocketEvent } from "@/lib/constants";
import type { Conversation } from "@/lib/types";
import { useSocket } from "./use-socket";

export interface GroupedConversations {
	friends: Conversation[];
	others: Conversation[];
}

export function useChatList(
	initialData: GroupedConversations,
	currentUserId?: string,
) {
	const router = useRouter();
	const [conversations, setConversations] =
		useState<GroupedConversations>(initialData);
	const { socket } = useSocket();

	// Server data is authoritative: re-sync whenever the server
	// component re-renders (router.refresh() after a socket event).
	useEffect(() => {
		setConversations(initialData);
	}, [initialData]);

	const refetch = useCallback(() => {
		router.refresh();
	}, [router]);

	useEffect(() => {
		function onFocus() {
			refetch();
		}
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, [refetch]);

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
					// Unknown conversation: let the server rebuild the list
					refetch();
					return prev;
				}

				const conv = allConvos[idx];
				const prevUnread = conv.unreadCount ?? 0;
				// Do not count messages sent by the current user as unread.
				const isOwnMessage =
					currentUserId !== undefined && data.senderId === currentUserId;

				const updated = {
					...conv,
					lastMessage: {
						body: data.body,
						createdAt: new Date(data.createdAt).getTime(),
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
			refetch();
		}

		socket.on(SocketEvent.MESSAGE_NEW, handleNewMessage);
		socket.on(SocketEvent.FRIEND_REQUEST_UPDATE, handleFriendUpdate);
		return () => {
			socket.off(SocketEvent.MESSAGE_NEW, handleNewMessage);
			socket.off(SocketEvent.FRIEND_REQUEST_UPDATE, handleFriendUpdate);
		};
	}, [socket, refetch, currentUserId]);

	return { conversations, refetch };
}
