import { ChatListItem } from "../../components/feature/chat-list-item";
import type { Conversation } from "../../lib/types";

const baseConversation: Conversation = {
	id: "conv-1",
	partner: {
		id: "user-2",
		username: "cybuddy",
		name: "Cy Buddy",
		image: null,
	},
	lastMessage: {
		body: "Ultimo messaggio della conversazione",
		createdAt: new Date().toISOString(),
		senderId: "user-2",
	},
	isFriend: true,
};

describe("<ChatListItem />", () => {
	it("mostra username del partner, ultimo messaggio e link alla chat", () => {
		cy.mount(<ChatListItem conversation={baseConversation} />);

		cy.contains("cybuddy").should("be.visible");
		cy.contains("Ultimo messaggio della conversazione").should("be.visible");
		cy.get('a[href="/chat/conv-1"]').should("exist");
	});

	it("usa il nome quando lo username manca e mostra le iniziali", () => {
		cy.mount(
			<ChatListItem
				conversation={{
					...baseConversation,
					partner: { ...baseConversation.partner, username: null },
				}}
			/>,
		);

		cy.contains("Cy Buddy").should("be.visible");
		cy.contains("CY").should("be.visible");
	});

	it("mostra il conteggio non letti e il cap a 99+", () => {
		cy.mount(
			<ChatListItem conversation={{ ...baseConversation, unreadCount: 5 }} />,
		);
		cy.contains("span", "5").should("be.visible");

		cy.mount(
			<ChatListItem conversation={{ ...baseConversation, unreadCount: 150 }} />,
		);
		cy.contains("span", "99+").should("be.visible");
	});

	it("non mostra il badge senza messaggi non letti", () => {
		cy.mount(<ChatListItem conversation={baseConversation} />);
		cy.get(".bg-sky-500").should("not.exist");
	});
});
