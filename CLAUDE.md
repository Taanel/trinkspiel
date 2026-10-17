# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Một hai ba dô!", a multiplayer drinking game. Each player joins on their own phone (room code, QR or `?raum=CODE` link), picks their own UI language (de/en/vi), and plays secret-input rounds. Static site on GitHub Pages (repo `Taanel/trinkspiel`, public), live at https://taanel.github.io/trinkspiel/. `README.md` is the beginner-facing German guide (how to add questions and round types); keep it in sync.

## Commands

- `npm run dev`: static dev server on http://localhost:8080 (`werkzeuge/server.js`, also prints the LAN address)
- `npm test`: `node --test` (round rules, flow, secrecy of views, translation completeness)

No build step and no npm dependencies. Keep it that way. External code only via pinned CDN script tags in `index.html` (`peerjs@1.5.4`, `qrcode-generator@1.4.4`).

## Architecture

Host-authoritative over PeerJS (WebRTC). The host's browser holds the only real game state; clients send actions and render whatever view the host sends.

- `js/spiel/zustand.js`: plain-data state (serializable; persisted in localStorage `trinkspiel-gastgeber-v1` so the host can reload and "continue").
- `js/spiel/getraenke.js`: drink conversion. Round modules award **points** (`auswerten` returns `punkte`); `ablauf.abschliessen` converts them per player drink (bier ×1, mix ×⅔, shot ×⅓, rounded up, min 1) into `ergebnis.getrunken` and accumulates `spieler.punkte` (ranking) and `spieler.schlucke` (what was actually drunk). Players must pick a drink on the explanation screen before "Verstanden".
- `js/spiel/ablauf.js`: every state transition (menu, start, explanation, rounds, force, next, end) plus `baueSicht(zustand, spielerId)`, the per-player view. No DOM here.
- Round types: wer-wuerde-eher, mehrheit, luegner, schaetzfrage, kartoffel (timer-ended, secret fuse in `endetUm`, never sent), reaktion (no question file, each phone measures its own reaction time with `performance.now()`), herde (answers grouped via `vereinheitliche`, questions must have language-neutral answers), karte.
- `js/runden/*.js`: one module per round type with the same shape: `erstelle`, `eingabe`, `fertig`, `auswerten` (returns `{ punkte: { id: n }, … }`), optional `erzwingen`, `sichtFuer`, `zeichne`. Registered in `js/runden/index.js` (`RUNDEN_TYPEN`), which also drives the game menu.
- `js/netz/`: `gastgeber.js` (peer id `schluckauf-<CODE>`, action permission check via `AKTIONEN` in `nachrichten.js`, broadcasts views, round timer for `runde.endetUm` → `ablauf.zeitPruefen`), `mitspieler.js` (auto-reconnect loop). Presence: clients PING every 5 s, host answers PONG; any message on the current connection marks the player connected again; host marks a pinging player offline after 20 s silence; client reconnects after 15 s without host traffic or when the page becomes visible with a closed connection.
- **PeerJS emits `close` synchronously inside `close()`.** Always update `verbindungen` (host) / `verbindung` (client) BEFORE closing the old connection, otherwise the close handler marks a live player offline. `test/netz.test.js` guards this with a fake PeerJS.
- `js/ui/`: `bildschirme.js` (all non-round screens), `bausteine.js` (shared round UI), `animationen.js` (the results "draw"), `qr.js`. `main.js` re-renders the whole screen on each change while preserving typed input/focus; `data-merk` keys stop replaying animations for elements that already existed.
- `js/sprache/`: `t('key')` with de/en/vi tables (same keys; values may be functions for plurals). Questions are sent over the network as ids only; each client looks up text in its own language (`frageText`). Exception: the liar round sends the player's own question variant texts so the other variant never reaches that client.
- `fragen/*.json`: one entry per line, every entry has `id` and `de`/`en`/`vi`.

## Rules

- **Secrets stay secret:** `sichtFuer` must never leak other players' votes, the liar's identity, the other liar question, or the estimate answer before the result. Add a test when touching a view.
- **Every language is first-class:** any new UI text goes into all three `js/sprache/*.js` files; any new question needs all three languages. `npm test` checks both. Fonts must support Vietnamese.
- **Design:** documented in `DESIGN.md` (direction "Vé số", street lottery ticket). Red (`--rot`) only means "you drink". One ticket owns each screen; guilloche only on the active ticket; selection = pen circle (`stiftKreis`), done = punch hole (`.gelocht`). No emoji as icons, no eyebrow labels above headings, no gradients/glows. Run `impeccable detect --json index.html css/style.css` after UI changes.
- **Motion:** every animation has a `prefers-reduced-motion` fallback; content is visible without animation.
- **Beginner-friendly code:** identifiers and comments are German, comments explain the non-obvious parts (network, views). Keep files small and the round-module shape identical.
- Content tone is "spicy" by the owner's choice: cheeky and suggestive, never explicit, degrading or targeting identity traits.
