// Task Node per la gestione del DB di test E2E (usati via cy.task).
// Il DB degli E2E è SEMPRE separato da local.db: gli script `e2e*` impostano
// DATABASE_URL=e2e.db sia per il server Next che per questo processo.
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const dbPath = resolve(process.cwd(), process.env.DATABASE_URL ?? "e2e.db");

/**
 * Riporta il DB di test a uno stato pulito e allineato allo schema corrente:
 * applica le migrazioni Drizzle (la stessa fonte di verità di local.db, così
 * ogni aggiornamento dello schema si riflette automaticamente sul DB di test)
 * e svuota tutte le tabelle applicative.
 */
export function resetDb(): null {
	const sqlite = new Database(dbPath);
	migrate(drizzle(sqlite), { migrationsFolder: "drizzle" });

	sqlite.pragma("foreign_keys = OFF");
	const tables = sqlite
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'",
		)
		.all() as { name: string }[];
	for (const { name } of tables) {
		sqlite.prepare(`DELETE FROM "${name}"`).run();
	}
	sqlite.pragma("foreign_keys = ON");
	sqlite.close();
	return null;
}
