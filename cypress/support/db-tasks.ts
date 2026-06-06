// Task Node per la gestione del DB di test E2E (usati via cy.task).
// Il DB degli E2E è SEMPRE separato da local.db: gli script `e2e*` impostano
// DATABASE_URL=e2e.db sia per il server Next che per questo processo.
import { randomUUID } from "node:crypto";
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

interface SeedMessage {
	from: string;
	body: string;
}

interface SeedConversation {
	between: [string, string];
	messages?: SeedMessage[];
}

export interface SeedSocialPayload {
	/** Coppie di username con richiesta di amicizia accettata */
	friendships?: [string, string][];
	conversations?: SeedConversation[];
}

/**
 * Inserisce amicizie, conversazioni e messaggi tra utenti già esistenti
 * (creati prima via cy.seedUser, così le password sono hashate da better-auth).
 * Gli utenti sono referenziati per username.
 */
export function seedSocial(payload: SeedSocialPayload): null {
	const sqlite = new Database(dbPath);
	const userId = (username: string): string => {
		const row = sqlite
			.prepare("SELECT id FROM user WHERE username = ?")
			.get(username) as { id: string } | undefined;
		if (!row) throw new Error(`seedSocial: utente "${username}" non trovato`);
		return row.id;
	};

	const now = Date.now();

	for (const [sender, receiver] of payload.friendships ?? []) {
		sqlite
			.prepare(
				"INSERT INTO friend_request (id, sender_id, receiver_id, status, created_at, updated_at) VALUES (?, ?, ?, 'accepted', ?, ?)",
			)
			.run(randomUUID(), userId(sender), userId(receiver), now, now);
	}

	// Le conversazioni più in alto nel payload risultano le più recenti
	let offset = 0;
	for (const conv of payload.conversations ?? []) {
		const convId = randomUUID();
		const [a, b] = conv.between;
		const messages = conv.messages ?? [];
		const lastAt = now - offset * 60_000;
		sqlite
			.prepare(
				"INSERT INTO conversation (id, user_a_id, user_b_id, created_at, last_message_at) VALUES (?, ?, ?, ?, ?)",
			)
			.run(
				convId,
				userId(a),
				userId(b),
				lastAt - (messages.length + 1) * 1000,
				lastAt,
			);
		messages.forEach((msg, i) => {
			sqlite
				.prepare(
					"INSERT INTO message (id, conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)",
				)
				.run(
					randomUUID(),
					convId,
					userId(msg.from),
					msg.body,
					lastAt - (messages.length - 1 - i) * 1000,
				);
		});
		offset++;
	}

	sqlite.close();
	return null;
}
