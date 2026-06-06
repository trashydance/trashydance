import { useState } from "react";
import { SearchBar } from "../../components/feature/search-bar";

// Wrapper con stato per testare il componente controllato come nell'app
function StatefulSearchBar({ placeholder }: { placeholder?: string }) {
	const [value, setValue] = useState("");
	return (
		<SearchBar value={value} onChange={setValue} placeholder={placeholder} />
	);
}

describe("<SearchBar />", () => {
	it("usa il placeholder di default e quello custom", () => {
		cy.mount(<StatefulSearchBar />);
		cy.get('input[placeholder="Search..."]').should("exist");

		cy.mount(<StatefulSearchBar placeholder="Cerca utenti..." />);
		cy.get('input[placeholder="Cerca utenti..."]').should("exist");
	});

	it("aggiorna il valore digitando", () => {
		cy.mount(<StatefulSearchBar />);
		cy.get("input").type("trashydance");
		cy.get("input").should("have.value", "trashydance");
	});

	it("mostra la X solo con testo e la usa per svuotare", () => {
		cy.mount(<StatefulSearchBar />);
		cy.get('button[aria-label="Clear search"]').should("not.exist");

		cy.get("input").type("query");
		cy.get('button[aria-label="Clear search"]').click();
		cy.get("input").should("have.value", "");
		cy.get('button[aria-label="Clear search"]').should("not.exist");
	});

	it("propaga ogni cambio al callback onChange", () => {
		const onChange = cy.stub().as("onChange");
		cy.mount(<SearchBar value="" onChange={onChange} />);

		cy.get("input").type("a");
		cy.get("@onChange").should("have.been.calledWith", "a");
	});
});
