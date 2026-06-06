const user = { username: "cytest", password: "password123" };

describe("Registrazione", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.visit("/register");
	});

	it("mostra gli errori di validazione su submit vuoto e input non validi", () => {
		cy.contains("button", "Create Account").click();
		cy.contains("Username must be at least 3 characters");
		cy.contains("Password is required");
		cy.contains("Please confirm your password");

		cy.get("#username").type("ab!");
		cy.get("#password").type("short");
		cy.get("#confirmPassword").type("short");
		cy.contains("button", "Create Account").click();
		cy.contains("Username can only contain letters, numbers, and underscores");
		cy.contains("Password must be at least 8 characters");
	});

	it("segnala password non coincidenti", () => {
		cy.get("#username").type(user.username);
		cy.get("#password").type(user.password);
		cy.get("#confirmPassword").type(`${user.password}x`);
		cy.contains("button", "Create Account").click();
		cy.contains("Passwords don't match");
	});

	it("registra un nuovo utente e reindirizza a /home", () => {
		cy.get("#username").type(user.username);
		cy.get("#password").type(user.password);
		cy.get("#confirmPassword").type(user.password);
		cy.contains("button", "Create Account").click();
		cy.url().should("include", "/home");
	});

	it("rifiuta uno username già registrato", () => {
		cy.seedUser(user.username, user.password);
		cy.get("#username").type(user.username);
		cy.get("#password").type(user.password);
		cy.get("#confirmPassword").type(user.password);
		cy.contains("button", "Create Account").click();
		// Errore per-campo sotto username (codice USERNAME_IS_ALREADY_TAKEN)
		cy.contains("Username already taken");
	});
});

describe("Login", () => {
	beforeEach(() => {
		cy.task("db:reset");
		cy.seedUser(user.username, user.password);
	});

	// better-auth risponde sempre INVALID_USERNAME_OR_PASSWORD (anti
	// user-enumeration): la UI mostra il messaggio generico in entrambi i casi
	it("segnala un utente inesistente", () => {
		cy.visit("/login");
		cy.get("#username").type("ghost");
		cy.get("#password").type("whatever123");
		cy.contains("button", "Login").click();
		cy.contains("Invalid username or password");
	});

	it("segnala una password errata", () => {
		cy.visit("/login");
		cy.get("#username").type(user.username);
		cy.get("#password").type("wrongpass123");
		cy.contains("button", "Login").click();
		cy.contains("Invalid username or password");
	});

	it("autentica dalla UI e reindirizza a /home", () => {
		cy.visit("/login");
		cy.get("#username").type(user.username);
		cy.get("#password").type(user.password);
		cy.contains("button", "Login").click();
		cy.url().should("include", "/home");
	});

	it("redirige l'utente già autenticato da /login a /home", () => {
		cy.login(user.username, user.password);
		cy.visit("/login");
		cy.url().should("include", "/home");
	});
});
