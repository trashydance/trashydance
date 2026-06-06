// Support file per i component test: monta i componenti React in isolamento.
// https://on.cypress.io/component-testing
import { mount } from "cypress/react";
import "./commands";
import "../../app/globals.css";

Cypress.Commands.add("mount", mount);

declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount;
		}
	}
}
