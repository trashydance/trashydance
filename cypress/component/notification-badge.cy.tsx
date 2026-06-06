import { NotificationBadge } from "../../components/feature/notification-badge";

describe("<NotificationBadge />", () => {
	it("non renderizza nulla con count zero o negativo", () => {
		cy.mount(<NotificationBadge count={0} />);
		cy.get("span").should("not.exist");

		cy.mount(<NotificationBadge count={-3} />);
		cy.get("span").should("not.exist");
	});

	it("mostra il conteggio", () => {
		cy.mount(<NotificationBadge count={7} />);
		cy.contains("span", "7").should("be.visible");
	});

	it("mostra 99+ oltre la soglia", () => {
		cy.mount(<NotificationBadge count={100} />);
		cy.contains("span", "99+").should("be.visible");
	});
});
