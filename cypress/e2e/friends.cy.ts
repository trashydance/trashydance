const me = { username: "cytest", password: "password123" };
const buddy = { username: "cybuddy", password: "password123" };

describe("Ricerca utenti e amicizie", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(me.username, me.password);
		cy.seedUser(buddy.username, buddy.password);
	});

	it("elenca gli utenti in /search e gestisce le query senza risultati", () => {
		cy.login(me.username, me.password);
		cy.visit("/search");

		cy.contains("h2", "Others")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});

		cy.get('input[placeholder="Search by username or name..."]').type(
			"zzznessuno",
		);
		cy.contains("No users found");
	});

	it("invia una richiesta di follow da /search", () => {
		cy.login(me.username, me.password);
		cy.visit("/search");

		cy.contains("button", "Follow").click();
		cy.contains("button", "Pending...");

		cy.visit("/friends");
		cy.contains("h2", "Sent")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});
	});

	it("completa il flusso follow → badge → accettazione tra due utenti", () => {
		// me invia la richiesta dalla UI
		cy.login(me.username, me.password);
		cy.visit("/search");
		cy.contains("button", "Follow").click();
		cy.contains("button", "Pending...");

		// buddy vede il badge di notifica sul link Friends e accetta
		cy.login(buddy.username, buddy.password);
		cy.visit("/home");
		cy.get('a[href="/friends"]').within(() => {
			cy.contains("1");
		});
		cy.visit("/friends");
		cy.contains("h2", "Received")
			.parent()
			.within(() => {
				cy.contains(me.username);
			});
		cy.contains("button", "Accept").click();
		cy.contains("h2", "Following")
			.parent()
			.within(() => {
				cy.contains(me.username);
			});

		// me ritrova buddy tra i Following
		cy.login(me.username, me.password);
		cy.visit("/friends");
		cy.contains("h2", "Following")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});
	});

	it("rifiuta una richiesta ricevuta", () => {
		cy.task("db:seedSocial", {
			pendingRequests: [[buddy.username, me.username]],
		});
		cy.login(me.username, me.password);
		cy.visit("/friends");

		cy.contains("h2", "Received")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});
		cy.contains("button", "Reject").click();
		cy.contains("No requests yet");
	});

	it("annulla una richiesta inviata", () => {
		cy.task("db:seedSocial", {
			pendingRequests: [[me.username, buddy.username]],
		});
		cy.login(me.username, me.password);
		cy.visit("/friends");

		cy.contains("h2", "Sent")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});
		cy.contains("button", "Cancel").click();
		cy.contains("No requests yet");
	});

	it("smette di seguire un amico", () => {
		cy.task("db:seedSocial", {
			friendships: [[me.username, buddy.username]],
		});
		cy.login(me.username, me.password);
		cy.visit("/friends");

		cy.contains("h2", "Following")
			.parent()
			.within(() => {
				cy.contains(buddy.username);
			});
		cy.contains("button", "Unfollow").click();
		cy.contains("No requests yet");
	});
});
