const me = { username: "cytest", password: "password123" };
const friend = { username: "cyfriend", password: "password123" };
const other = { username: "cyother", password: "password123" };

describe("Home", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(me.username, me.password);
	});

	it("mostra l'empty state senza conversazioni", () => {
		cy.login(me.username, me.password);
		cy.visit("/home");

		cy.contains("No conversations yet");
		cy.contains("a", "Start your first chat").should(
			"have.attr",
			"href",
			"/search",
		);
	});

	context("con conversazioni seedate", () => {
		// Helper al posto di un beforeEach annidato (lint/noDuplicateTestHooks)
		const seedConversationsAndVisit = () => {
			cy.seedUser(friend.username, friend.password);
			cy.seedUser(other.username, other.password);
			cy.task("db:seedSocial", {
				friendships: [[me.username, friend.username]],
				conversations: [
					{
						between: [me.username, friend.username],
						messages: [{ from: friend.username, body: "Ciao dal tuo amico!" }],
					},
					{
						between: [me.username, other.username],
						messages: [
							{ from: other.username, body: "Messaggio dallo sconosciuto" },
						],
					},
				],
			});
			cy.login(me.username, me.password);
			cy.visit("/home");
		};

		it("raggruppa le conversazioni in Following e Others", () => {
			seedConversationsAndVisit();
			cy.contains("h2", "Following")
				.parent()
				.within(() => {
					cy.contains(friend.username);
					cy.contains("Ciao dal tuo amico!");
				});

			cy.contains("h2", "Others")
				.parent()
				.within(() => {
					cy.contains(other.username);
					cy.contains("Messaggio dallo sconosciuto");
				});
		});

		it("apre la chat cliccando una conversazione", () => {
			seedConversationsAndVisit();
			cy.contains(friend.username).click();
			cy.url().should("match", /\/chat\/[\w-]+/);
		});

		it("filtra le conversazioni per username del partner", () => {
			seedConversationsAndVisit();
			cy.get('input[placeholder="Search conversations & messages..."]').type(
				friend.username,
			);

			cy.contains("h2", "Following")
				.parent()
				.within(() => {
					cy.contains(friend.username);
				});
			cy.contains("h2", "Others").should("not.exist");
		});

		it("trova i messaggi con la ricerca globale", () => {
			seedConversationsAndVisit();
			cy.get('input[placeholder="Search conversations & messages..."]').type(
				"sconosciuto",
			);

			cy.contains("h2", "Messages")
				.parent()
				.within(() => {
					cy.contains("Messaggio dallo sconosciuto");
				});
		});

		it("mostra No results per una ricerca senza corrispondenze", () => {
			seedConversationsAndVisit();
			cy.get('input[placeholder="Search conversations & messages..."]').type(
				"zzznessunrisultato",
			);

			cy.contains("No results");
			cy.contains('No conversations or messages matching "zzznessunrisultato"');
		});
	});
});
