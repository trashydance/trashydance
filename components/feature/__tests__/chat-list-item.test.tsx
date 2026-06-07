import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatListItem } from "@/components/feature/chat-list-item";
import type { Conversation } from "@/lib/types";

function makeConversation(
	overrides: Partial<Conversation & { unreadCount?: number }> = {},
): Conversation & { unreadCount?: number } {
	return {
		id: "conv-1",
		partner: {
			id: "user-2",
			username: "bob",
			name: "Bob Rossi",
			image: null,
		},
		lastMessage: {
			body: "Ciao, come va?",
			createdAt: "2026-06-04T10:00:00.000Z",
			senderId: "user-2",
		},
		isFriend: true,
		...overrides,
	};
}

describe("ChatListItem", () => {
	it("mostra nome del partner e ultimo messaggio con link alla chat", () => {
		render(<ChatListItem conversation={makeConversation()} />);

		expect(screen.getByText("Bob Rossi")).toBeInTheDocument();
		expect(screen.getByText("Ciao, come va?")).toBeInTheDocument();
		expect(screen.getByRole("link")).toHaveAttribute("href", "/chat/conv-1");
	});

	it("tronca l'ultimo messaggio oltre i 60 caratteri", () => {
		const longBody = "a".repeat(80);
		render(
			<ChatListItem
				conversation={makeConversation({
					lastMessage: {
						body: longBody,
						createdAt: "2026-06-04T10:00:00.000Z",
						senderId: "user-2",
					},
				})}
			/>,
		);

		expect(screen.getByText(`${"a".repeat(60)}...`)).toBeInTheDocument();
	});

	it("non mostra l'anteprima se non c'è un ultimo messaggio", () => {
		render(
			<ChatListItem conversation={makeConversation({ lastMessage: null })} />,
		);

		expect(screen.queryByText("Ciao, come va?")).not.toBeInTheDocument();
	});

	it("mostra il badge dei non letti solo quando unreadCount > 0", () => {
		const { unmount } = render(
			<ChatListItem conversation={makeConversation({ unreadCount: 5 })} />,
		);
		expect(screen.getByText("5")).toBeInTheDocument();
		unmount();

		render(
			<ChatListItem conversation={makeConversation({ unreadCount: 0 })} />,
		);
		expect(screen.queryByText("0")).not.toBeInTheDocument();
	});

	it("mostra l'indicatore online quando richiesto", () => {
		render(
			<ChatListItem
				conversation={makeConversation()}
				showOnlineIndicator
				isOnline
			/>,
		);
		expect(screen.getByRole("status")).toHaveAccessibleName("Online");
	});

	it("non mostra l'indicatore online di default", () => {
		render(<ChatListItem conversation={makeConversation()} isOnline />);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
