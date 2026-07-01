describe("Smoke", () => {
	it("mostra la landing page con la CTA Get in", () => {
		cy.visit("/");

		cy.get('img[alt="Title"]').should("be.visible");
		cy.contains("a", "Get in").should("have.attr", "href", "/home");
	});

	it("redirige gli utenti non autenticati da /home a /login", () => {
		cy.visit("/");
		cy.contains("a", "Get in").click();

		// Il proxy redirige le route protette verso /login?from=...
		cy.url().should("include", "/login");
		cy.url().should("include", "from=%2Fhome");
	});
});
