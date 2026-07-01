// Comandi custom condivisi tra test E2E e component test.
// https://on.cypress.io/custom-commands

declare global {
	namespace Cypress {
		interface Chainable {
			/**
			 * Crea un utente via API better-auth (signup reale → password hashata
			 * correttamente). Scarta la sessione creata dal signup.
			 */
			seedUser(username: string, password: string): Chainable<void>;
			/**
			 * Autentica via API better-auth senza passare dalla UI, con cache
			 * della sessione tra i test (cy.session).
			 */
			login(username: string, password: string): Chainable<void>;
		}
	}
}

Cypress.Commands.add("seedUser", (username: string, password: string) => {
	cy.request({
		method: "POST",
		url: "/api/auth/sign-up/email",
		body: {
			// Stessa email generata dal RegisterForm
			email: `${username.toLowerCase()}@trashydance.local`,
			password,
			name: username,
			username,
		},
	});
	// Il signup apre anche una sessione: la scartiamo, il login resta esplicito.
	cy.clearCookies();
});

Cypress.Commands.add("login", (username: string, password: string) => {
	cy.session(
		[username],
		() => {
			cy.request({
				method: "POST",
				url: "/api/auth/sign-in/username",
				body: { username, password },
			});
		},
		{
			// Evita di riusare sessioni in cache che puntano a un DB resettato
			validate() {
				cy.request("/api/auth/get-session").its("body.user").should("exist");
			},
		},
	);
});

export {};
