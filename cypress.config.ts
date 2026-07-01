import { defineConfig } from "cypress";
import { generateSync } from "otplib";
import { resetDb, seedSocial } from "./cypress/support/db-tasks";

export default defineConfig({
	e2e: {
		// Porta dedicata agli E2E: mai in conflitto con il dev server (3000)
		baseUrl: "http://localhost:3100",
		supportFile: "cypress/support/e2e.ts",
		setupNodeEvents(on) {
			on("task", {
				"db:reset": resetDb,
				"db:seedSocial": seedSocial,
				// Genera un codice TOTP valido dal secret (lato Node, come
				// farebbe l'app di autenticazione dell'utente)
				"totp:generate": (secret: string) => generateSync({ secret }),
			});
		},
	},
	component: {
		devServer: {
			framework: "next",
			bundler: "webpack",
		},
		supportFile: "cypress/support/component.ts",
	},
});
