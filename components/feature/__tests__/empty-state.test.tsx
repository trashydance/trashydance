import { render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/feature/empty-state";

describe("EmptyState", () => {
	it("mostra titolo e descrizione", () => {
		render(
			<EmptyState
				icon={Inbox}
				title="Nessuna chat"
				description="Inizia una conversazione"
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Nessuna chat" }),
		).toBeInTheDocument();
		expect(screen.getByText("Inizia una conversazione")).toBeInTheDocument();
	});

	it("mostra il link di azione quando label e href sono presenti", () => {
		render(
			<EmptyState
				icon={Inbox}
				title="Nessun amico"
				description="Cerca nuovi amici"
				actionLabel="Cerca"
				actionHref="/friends"
			/>,
		);
		const link = screen.getByRole("link", { name: "Cerca" });
		expect(link).toHaveAttribute("href", "/friends");
	});

	it("non mostra alcuna azione se label o href mancano", () => {
		render(
			<EmptyState
				icon={Inbox}
				title="Vuoto"
				description="Niente qui"
				actionLabel="Senza href"
			/>,
		);
		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});
});
