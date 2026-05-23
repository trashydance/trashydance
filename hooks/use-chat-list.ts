"use client";

import { useCallback, useEffect, useState } from "react";
import type { Conversation } from "@/lib/types";
import { useSocket } from "./use-socket";

interface GroupedConversations {
	friends: Conversation[];
	others: Conversation[];
}

export function useChatList() {
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
				const data: Conversation[] = await res.json();
				const friends = data.filter((c) => c.isFollowing);
				const others = data.filter((c) => !c.isFollowing);
				setConversations({ friends, others });
			}
		} catch {
			// Silently fail; user can reload
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchConversations();
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
					// New conversation from someone unknown, refetch
					fetchConversations();
					return prev;
				}

				const updated = {
					...allConvos[idx],
					lastMessage: {
						body: data.body,
						createdAt: data.createdAt,
						senderId: data.senderId,
					},
				};

				const rest = allConvos.filter((c) => c.id !== data.conversationId);
				const all = [updated, ...rest];
				return {
					friends: all.filter((c) => c.isFollowing),
					others: all.filter((c) => !c.isFollowing),
				};
			});
		}

		socket.on("message:new", handleNewMessage);
		return () => {
			socket.off("message:new", handleNewMessage);
		};
	}, [socket, fetchConversations]);

	return { conversations, isLoading };
}
