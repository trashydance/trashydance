import { MessageCircle } from "lucide-react";
import { EmptyState } from "../../components/feature/empty-state";

describe("<EmptyState />", () => {
	it("mostra titolo e descrizione", () => {
		cy.mount(
			<EmptyState
				icon={MessageCircle}
				title="Nessuna chat"
				description="Inizia una conversazione per vederla qui."
			/>,
		);

		cy.contains("h3", "Nessuna chat").should("be.visible");
		cy.contains("p", "Inizia una conversazione per vederla qui.").should(
			"be.visible",
		);
	});

	it("mostra la CTA solo quando label e href sono presenti", () => {
		cy.mount(
			<EmptyState
				icon={MessageCircle}
				title="Nessuna chat"
				description="Inizia una conversazione."
				actionLabel="Cerca utenti"
				actionHref="/search"
			/>,
		);

		cy.contains("a", "Cerca utenti").should("have.attr", "href", "/search");
	});

	it("non mostra la CTA senza actionLabel", () => {
		cy.mount(
			<EmptyState
				icon={MessageCircle}
				title="Nessuna chat"
				description="Inizia una conversazione."
			/>,
		);

		cy.get("a").should("not.exist");
	});
});
