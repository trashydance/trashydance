import type { SeedSocialResult } from "../support/db-tasks";

const me = { username: "cytest", password: "password123" };
const buddy = { username: "cybuddy", password: "password123" };

describe("Chat", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(me.username, me.password);
		cy.seedUser(buddy.username, buddy.password);
	});

	const seedConversation = () =>
		cy
			.task("db:seedSocial", {
				conversations: [
					{
						between: [me.username, buddy.username],
						messages: [
							{ from: buddy.username, body: "Messaggio seedato di benvenuto" },
						],
					},
				],
			})
			.then((result) => (result as SeedSocialResult).conversations[0].id);

	it("mostra il partner e i messaggi esistenti", () => {
		seedConversation().then((conversationId) => {
			cy.login(me.username, me.password);
			cy.visit(`/chat/${conversationId}`);

			cy.contains(buddy.username);
			cy.contains("Messaggio seedato di benvenuto");
		});
	});

	it("invia un messaggio che persiste dopo il reload", () => {
		seedConversation().then((conversationId) => {
			cy.login(me.username, me.password);
			cy.visit(`/chat/${conversationId}`);

			cy.get('textarea[placeholder="Type a message..."]').type(
				"Ciao dal test E2E!",
			);
			cy.get('button[aria-label="Send message"]').click();
			cy.contains("Ciao dal test E2E!");

			cy.reload();
			cy.contains("Ciao dal test E2E!");
		});
	});

	it("riceve in realtime un messaggio dell'altro utente senza reload", () => {
		// Cattura il cookie di sessione di buddy PRIMA di aprire la sessione di
		// me, così la cookie jar del browser resta pulita
		cy.request("POST", "/api/auth/sign-in/username", {
			username: buddy.username,
			password: buddy.password,
		}).then((res) => {
			const setCookie = res.headers["set-cookie"];
			const cookies = Array.isArray(setCookie) ? setCookie : [setCookie ?? ""];
			const sessionCookie = cookies
				.map((c) => c.split(";")[0])
				.filter((c) => c.includes("session_token"))
				.join("; ");
			cy.wrap(sessionCookie).as("buddyCookie");
		});
		cy.clearCookies();

		seedConversation().then((conversationId) => {
			cy.login(me.username, me.password);
			cy.visit(`/chat/${conversationId}`);
			cy.contains("Messaggio seedato di benvenuto");

			// buddy invia via API HTTP (che fa broadcast Socket.IO al partner)
			cy.get("@buddyCookie").then((buddyCookie) => {
				cy.request({
					method: "POST",
					url: `/api/conversations/${conversationId}/messages`,
					headers: { Cookie: String(buddyCookie) },
					body: { conversationId, body: "Realtime dal buddy!" },
				});
			});

			// Il messaggio appare SENZA reload, via Socket.IO
			cy.contains("Realtime dal buddy!");
		});
	});
});
