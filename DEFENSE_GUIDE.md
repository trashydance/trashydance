# 🛡️ Guida alla Difesa (Evaluation Guide) per trashydance

Questo documento è stato creato per aiutarvi a **superare agevolmente la correzione** di `ft_transcendence`. Contiene tutte le risposte alle domande che vi faranno i valutatori (basate sull'Evaluation Sheet ufficiale), con i riferimenti esatti al codice.

---

## 🏗️ Architettura Generale (Cosa dire all'inizio)
**"Come funziona la vostra app?"**
* **Frontend e Backend**: Utilizziamo **Next.js 16 (App Router)** che ci permette di avere sia il frontend (React 19) sia le API del backend nello stesso progetto.
* **Database**: Utilizziamo **SQLite** con **Drizzle ORM** per avere query sicure e tipizzate in TypeScript.
* **Real-time**: Usiamo un server custom (`server.ts`) per condividere la stessa porta (3000) tra Next.js e **Socket.IO** (che gestisce WebSocket per la chat e le notifiche in tempo reale).
* **Autenticazione**: Usiamo **better-auth** che gestisce in modo sicuro le sessioni, le password hashate, l'OAuth di 42 e la 2FA (TOTP).

---

## 📋 Domande dell'Evaluation Sheet e Risposte

### 1. Sicurezza e Setup (.env e Docker)
* **Domanda (Evaluator)**: "Mostratemi che non ci sono password hardcodate e che usate variabili d'ambiente. Fatemi avviare il progetto con Docker."
* **Risposta (Voi)**: "Il file `.env` è nel `.gitignore` (puoi vederlo). Abbiamo un `.env.example`. Per avviare il progetto, basta lanciare lo script `bash certs/generate.sh` per i certificati HTTPS locali e poi `docker compose up`."
* **Codice da mostrare**: `compose.yaml`, `Dockerfile` e `.gitignore`.

### 2. Multi-User & Real Time
* **Domanda**: "Fatemi vedere che se apro due browser diversi posso loggarmi con due utenti e scambiarmi messaggi in tempo reale."
* **Risposta**: "Certamente." (Aprite due finestre incognito, create due utenti e scrivetevi). "Come vedi, non c'è bisogno di ricaricare la pagina grazie a Socket.IO."
* **Codice da mostrare**: `hooks/use-chat.ts` (dove ascoltiamo gli eventi `receive_message`) e `lib/socket/server.ts` (dove il server emette il messaggio).

### 3. Protezioni del Server (Rate Limiting)
* **Domanda**: "Avete protetto le API da spam e brute-force?"
* **Risposta**: "Sì, abbiamo un sistema di Rate Limiting in memoria. Blocchiamo gli utenti se inviano troppe richieste di login o troppi messaggi al secondo."
* **Codice da mostrare**: `lib/rate-limit.ts` e le API come `app/api/auth/[...all]/route.ts` o `app/api/conversations/[id]/messages/route.ts` (riga 110+ dove si usa `!rateLimit()`).

### 4. Database e ORM (Modulo Minor)
* **Domanda**: "Mostratemi la struttura del Database. Avete usato un ORM?"
* **Risposta**: "Sì, abbiamo usato Drizzle ORM. Non usiamo SQL puro ma query tipizzate per evitare SQL Injection."
* **Codice da mostrare**: Apri la cartella `schema/` (in particolare `schema/chat.ts` e `schema/auth.ts`) dove sono definite le tabelle.

### 5. Server-Side Rendering (Modulo Minor)
* **Domanda**: "Mostratemi che usate il Server-Side Rendering."
* **Risposta**: "Next.js usa i React Server Components di default. Le pagine del layout, dei termini legali e le inizializzazioni del profilo avvengono sul server, mandando al client solo HTML già pronto."
* **Codice da mostrare**: `app/(app)/profile/[username]/page.tsx` (mostrare che la funzione è `async` e non ha `"use client"` in cima) e `app/(legal)/terms/page.tsx`.

### 6. File Upload e Sicurezza (Modulo Minor)
* **Domanda**: "Come gestite il caricamento dei file? È sicuro?"
* **Risposta**: "Sì, non ci fidiamo solo dell'estensione del file. Controlliamo i 'Magic Bytes' sul server per assicurarci che un file sia davvero un'immagine o un PDF. C'è anche un limite di 5MB."
* **Codice da mostrare**: `app/api/uploads/route.ts` (mostrare la funzione `checkMagicBytes`).

### 7. Sistema di Notifiche e Amicizie (Modulo Major + Minor)
* **Domanda**: "Fatemi vedere le notifiche per i messaggi e gli amici."
* **Risposta**: "Se mi invii una richiesta d'amicizia, appare il badge rosso in tempo reale in cima alla barra di navigazione."
* **Codice da mostrare**: `components/feature/top-nav.tsx` e `hooks/use-friends.ts`.

### 8. Autenticazione OAuth e 2FA (Moduli Minor)
* **Domanda**: "Come funziona il login con 42 e la 2FA?"
* **Risposta**: "L'OAuth redirige all'Intra 42 e crea l'account. La 2FA usa TOTP (come Google Authenticator). Generiamo un QR Code sul server e chiediamo i codici di backup."
* **Codice da mostrare**: `lib/auth.ts` (configurazione dei plugin `twoFactor` e `socialProviders`) e `components/feature/settings/two-factor-section.tsx` (l'UI della 2FA).

### 9. Gamification (Modulo Minor)
* **Domanda**: "Mostratemi il sistema di Gamification."
* **Risposta**: "Sul profilo utente assegniamo dei badge automatici: 'Icebreaker' se invii un messaggio, 'Social Butterfly' se hai tanti amici, e 'Ironclad' se abiliti la 2FA."
* **Codice da mostrare**: `components/feature/profile-achievements.tsx` e `app/(app)/profile/[username]/page.tsx` (dove le query contano i messaggi e controllano la 2FA).

### 10. GDPR e Protezione Dati (Modulo Minor)
* **Domanda**: "Cosa avete fatto per la GDPR?"
* **Risposta**: "Abbiamo tre cose: un banner per il consenso dei cookie, la cancellazione definita e permanente dell'account, e l'esportazione di tutti i dati personali in JSON."
* **Codice da mostrare**: `lib/actions/profile.ts` (la funzione `exportUserData` che prende chat e amicizie e le formatta in JSON) e `components/feature/settings/delete-account-section.tsx`.

### 11. Custom Design System e CSS (Modulo Minor)
* **Domanda**: "Avete usato Bootstrap o roba pronta?"
* **Risposta**: "No, abbiamo costruito un Design System personalizzato usando lo stile *Neobrutalism* (bordi netti, ombre dure). Abbiamo creato oltre 19 componenti riutilizzabili."
* **Codice da mostrare**: `tailwind.css` (dove ci sono le variabili CSS come `--shadow` e `--radius`) e la cartella `components/ui/` (es. `button.tsx`).

### 12. Devops: Backups e Health Check (Modulo Minor)
* **Domanda**: "Come gestite i backup e il monitoraggio?"
* **Risposta**: "Abbiamo uno script bash che fa un dump del database SQLite e zippa le immagini caricate. Inoltre abbiamo un endpoint di Health Check per il server."
* **Codice da mostrare**: `scripts/backup.sh` e l'URL `/api/health` nel browser.

---

## 🎯 Suggerimenti per la Difesa (Golden Rules)
1. **Fate sempre parlare prima l'Evaluator**: Non affrettatevi a mostrare tutto subito. Rispondete esattamente a quello che chiede, punto per punto dal foglio.
2. **Mostrate con orgoglio l'UI**: L'interfaccia *Neobrutalista* è bellissima ed esce fuori dagli schemi rispetto ai classici progetti 42. Fatelo notare!
3. **Puntate a 20**: Ricordate al correttore di controllare la tabella dei Moduli nella `README.md`. Gli avete facilitato il lavoro elencandoli esattamente con le giustificazioni.
4. **Nessun Crash**: Se qualcosa dovesse impuntarsi (es. disconnessione), ricaricate la pagina tranquillamente, Socket.IO ha la riconnessione automatica e Drizzle gestisce le race conditions.

**In bocca al lupo! Siete andati oltre i requisiti e il codice è formidabile.**
