const me = { username: "cytest", password: "password123" };
const buddy = { username: "cybuddy", password: "password123" };

describe("Profilo", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(me.username, me.password);
	});

	it("mostra il profilo di un altro utente con il bottone Follow", () => {
		cy.seedUser(buddy.username, buddy.password);
		cy.login(me.username, me.password);
		cy.visit(`/profile/${buddy.username}`);

		cy.contains("h1", buddy.username);
		cy.contains("button", "Follow");
	});

	it("mostra User not found per un profilo inesistente", () => {
		cy.login(me.username, me.password);
		cy.visit("/profile/utenteinesistente");
		cy.contains("User not found");
	});

	it("modifica nome e bio del proprio profilo con persistenza", () => {
		cy.login(me.username, me.password);
		cy.visit(`/profile/${me.username}`);

		cy.contains("button", "Edit profile").click();
		cy.get("#edit-name").clear();
		cy.get("#edit-name").type("Nuovo Nome");
		cy.get("#edit-bio").type("Bio scritta dal test E2E");
		cy.contains("button", "Save").click();

		cy.contains("Bio scritta dal test E2E");
		cy.reload();
		cy.contains("Bio scritta dal test E2E");
	});
});

describe("Impostazioni — Two-Factor Authentication", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(me.username, me.password);
	});

	it("abilita il 2FA (QR → TOTP → backup codes) e richiede il codice al login", () => {
		cy.login(me.username, me.password);
		cy.visit("/settings");
		cy.contains("2FA is not enabled");

		// Intercetta la risposta di enable per estrarre il secret TOTP
		// (equivale a "scansionare il QR" con l'app di autenticazione)
		cy.intercept("POST", "/api/auth/two-factor/enable").as("enable2fa");

		cy.contains("button", "Enable 2FA").click();
		cy.get('input[placeholder="Your password"]').type(me.password);
		cy.contains("button", "Continue").click();

		cy.wait("@enable2fa").then(({ response }) => {
			const totpURI: string = response?.body?.totpURI ?? "";
			const secret = /[?&]secret=([^&]+)/.exec(totpURI)?.[1];
			expect(secret, "secret TOTP estratto dal totpURI").to.be.a("string");
			cy.wrap(secret).as("totpSecret");
		});

		cy.get("canvas[aria-label]").should("be.visible");
		cy.contains("button", "I have scanned the code").click();

		cy.get("@totpSecret").then((secret) => {
			cy.task("totp:generate", String(secret)).then((code) => {
				cy.get('input[placeholder="000000"]').type(String(code));
			});
		});
		cy.contains("button", "Verify and enable").click();

		cy.contains("Save your backup codes now!");
		cy.contains("button", "I have saved my codes").click();

		// Logout: il prossimo login deve chiedere il secondo fattore
		cy.clearCookies();
		cy.visit("/login");
		cy.get("#username").type(me.username);
		cy.get("#password").type(me.password);
		cy.contains("button", "Login").click();

		cy.contains("h1", "Two-Factor Authentication");
		cy.get("@totpSecret").then((secret) => {
			cy.task("totp:generate", String(secret)).then((code) => {
				cy.get("#totp-code").type(String(code));
			});
		});
		cy.contains("button", "Verify").click();

		cy.url().should("include", "/home");
	});
});
