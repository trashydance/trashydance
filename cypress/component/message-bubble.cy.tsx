import { MessageBubble } from "../../components/feature/message-bubble";

describe("<MessageBubble />", () => {
	const createdAt = new Date().toISOString();

	it("mostra un messaggio altrui allineato a sinistra", () => {
		cy.mount(
			<MessageBubble
				body="Ciao, come va?"
				createdAt={createdAt}
				isSelf={false}
			/>,
		);

		cy.contains("p", "Ciao, come va?").should("be.visible");
		cy.get(".justify-start").should("exist");
		cy.get(".bg-primary").should("not.exist");
	});

	it("mostra un messaggio proprio con stile primary e spunta di invio", () => {
		cy.mount(
			<MessageBubble
				body="Tutto bene!"
				createdAt={createdAt}
				isSelf={true}
				status="sent"
			/>,
		);

		cy.contains("p", "Tutto bene!").should("be.visible");
		cy.get(".justify-end").should("exist");
		cy.get(".bg-primary").should("exist");
	});

	it("mostra il retry su errore e invoca onRetry al click", () => {
		const onRetry = cy.stub().as("onRetry");
		cy.mount(
			<MessageBubble
				body="Messaggio fallito"
				createdAt={createdAt}
				isSelf={true}
				status="error"
				onRetry={onRetry}
			/>,
		);

		cy.get('button[aria-label="Retry sending message"]')
			.should("contain.text", "Retry")
			.click();
		cy.get("@onRetry").should("have.been.calledOnce");
	});

	it("mostra l'allegato documento come link scaricabile", () => {
		cy.mount(
			<MessageBubble
				body=""
				createdAt={createdAt}
				isSelf={false}
				fileName="report.pdf"
				fileUrl="/api/uploads/report.pdf"
				fileType="application/pdf"
				fileSize={2048}
			/>,
		);

		cy.contains("a", "report.pdf")
			.should("have.attr", "href", "/api/uploads/report.pdf")
			.should("have.attr", "download", "report.pdf");
	});
});
