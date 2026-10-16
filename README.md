# Một hai ba dô! 🍻

Ein Trinkspiel für Freunde. Jeder spielt mit dem **eigenen Handy**, in seiner Sprache (Deutsch, English, Tiếng Việt). Abstimmungen und Antworten sind geheim, aufgelöst wird gemeinsam.

**Spielen:** https://taanel.github.io/trinkspiel/

## So spielt ihr

1. Eine Person (der **Gastgeber**) öffnet die Seite, gibt ihren Namen ein und tippt **„Neuen Raum erstellen“**.
2. Die anderen scannen den **QR-Code**, öffnen den geteilten **Link** oder geben den **4-Buchstaben-Code** ein.
3. Der Gastgeber wählt ein Spiel und die Rundenzahl und startet.
4. Vor jedem Spiel erklärt ein Bildschirm in 3–4 Schritten, wie es geht. Dort wählt jeder auch sein Getränk (Bier, Mix oder Shot) und tippt dann „Verstanden“.
5. Am Ende zeigt die Tafel, wer am meisten getrunken hat.

| Spiel | Worum es geht |
|---|---|
| Party-Mix | Alle Spiele gemischt, jede 4. Runde eine Karte |
| Wer würde eher | Geheim abstimmen, wer am ehesten … Meiste Stimmen trinkt |
| Mehrheit gewinnt | Entweder-oder. Die Minderheit trinkt |
| Der Lügner | Eine Person hat heimlich eine andere Frage. Findet sie! |
| Schätzfrage | Zahl schätzen. Wer am weitesten weg liegt, trinkt |
| Karten | Ich hab noch nie, Pflicht-Aufgaben und Regeln |

**Getränke und Schlucke**

Die Spielregeln vergeben Punkte (z. B. „Minderheit: 2“). Je nach Getränk wird daraus eine andere Zahl Schlucke, weil Shots stärker sind als Bier:

| Getränk | Umrechnung | Beispiel: 3 Punkte |
|---|---|---|
| Bier | 1 Punkt = 1 Schluck | 3 Schlucke Bier |
| Mix | etwa ⅔, aufgerundet | 2 Schlucke Mix |
| Shot | etwa ⅓, aufgerundet | 1 Schluck vom Shot |

Wer trinken muss, trinkt immer mindestens 1 Schluck. Die Rangliste am Ende zählt die Punkte, damit es fair bleibt. Die Werte kannst du in `js/spiel/getraenke.js` ändern.

**Gut zu wissen**
- Das Gastgeber-Handy ist der „Server“. Wenn der Gastgeber die Seite schließt, pausiert das Spiel. Lädt er neu, tippt er auf „Spiel fortsetzen“, und die anderen verbinden sich automatisch wieder.
- Wer die Seite neu lädt, kommt mit demselben Namen und denselben Schlucken zurück.
- Trinkt verantwortungsvoll. Ein Schluck darf auch Wasser sein.

## Auf dem eigenen Rechner starten

Du brauchst [Node.js](https://nodejs.org) (Version 20 oder neuer).

```bash
npm run dev     # startet http://localhost:8080
npm test        # prüft Spielregeln und Übersetzungen
```

`npm run dev` zeigt auch eine Adresse mit deiner WLAN-IP. Die kannst du auf dem Handy öffnen und so mit Handy und Rechner gleichzeitig testen. Zum Testen allein: mehrere Browser-Fenster öffnen (eins davon im privaten Modus, damit es ein anderer Spieler ist).

## Ordner und Dateien

```
index.html              die einzige Seite
css/style.css           das ganze Aussehen (Farben ganz oben als Variablen)
fragen/                 ALLE Fragen, je Eintrag in de / en / vi
js/
  main.js               Einstieg: verbindet alles
  netz/                 Verbindung zwischen den Handys (PeerJS)
  spiel/                Spielablauf, Spielzustand, Getränke-Umrechnung (nur Logik, kein Bildschirm)
  runden/               eine Datei pro Spiel (Regeln + Bildschirm)
  sprache/              Texte der Oberfläche: de.js, en.js, vi.js
  ui/                   Bildschirme, Bausteine, Animationen, QR-Code
test/                   automatische Tests (npm test)
werkzeuge/server.js     kleiner Test-Server für npm run dev
DESIGN.md               das Design-System (Farben, Schriften, Regeln)
```

## Fragen ergänzen

Öffne die passende Datei in `fragen/` und füge eine Zeile hinzu. Jede Frage braucht eine **neue, eindeutige `id`** und **alle drei Sprachen**. Vorlage, z. B. für `fragen/wer-wuerde-eher.json`:

```json
{"id": "w41", "de": "Wer würde eher …?", "en": "Who is most likely to …?", "vi": "Ai dễ … nhất?"},
```

Achte auf die Kommas zwischen den Zeilen (nach der letzten Zeile kein Komma). Danach `npm test` ausführen: Der Test meldet fehlende Sprachen oder doppelte IDs.

| Datei | Form eines Eintrags |
|---|---|
| `wer-wuerde-eher.json` | `{"id", "de", "en", "vi"}` (Text) |
| `mehrheit.json` | `{"id", "de": {"frage", "a", "b"}, "en": {…}, "vi": {…}}` |
| `luegner.json` | `{"id", "de": {"echt", "luege"}, …}`: zwei ähnliche Fragen, deren Antworten ähnlich aussehen (z. B. beide eine Zahl) |
| `schaetzfragen.json` | `{"id", "antwort": 330, "de": {"frage", "einheit"}, …}`, bei Jahreszahlen zusätzlich `"format": "jahr"` |
| `karten.json` | `{"id", "art": "nie" / "pflicht" / "regel", "de", "en", "vi"}` |

## Neues Spiel (Runden-Typ) bauen

1. Eine Datei in `js/runden/` kopieren, z. B. `mehrheit.js` → `meinspiel.js`. Jede Datei hat drei Teile: **Spielregeln**, **Sicht** (was ein Spieler sehen darf) und **Bildschirm**. Die Kommentare in `wer-wuerde-eher.js` erklären jeden Teil.
2. `id`, `farbe`, `minSpieler` und `fragenDatei` anpassen, Fragen-Datei in `fragen/` anlegen.
3. In `js/runden/index.js` importieren und in `RUNDEN_TYPEN` eintragen. Damit erscheint das Spiel automatisch im Menü und im Party-Mix.
4. In `js/sprache/de.js`, `en.js` und `vi.js` unter `spiele` einen Eintrag mit `name`, `kurz` und `schritte` (Erklärung) ergänzen.
5. `npm test` laufen lassen und einen Test in `test/runden.test.js` dazuschreiben.

## Veröffentlichen

Jeder Push auf `main` wird von GitHub Pages automatisch veröffentlicht (Einstellung: *Settings → Pages → Deploy from branch → main / root*). Nach 1–2 Minuten ist die neue Version online.

## Technik in Kürze

- Reines HTML, CSS und JavaScript, **kein Build-Schritt**, keine npm-Pakete.
- [PeerJS](https://peerjs.com) verbindet die Handys direkt (WebRTC). Der kostenlose PeerJS-Vermittler hilft nur beim ersten Kennenlernen.
- Schriften: Bricolage Grotesque und Be Vietnam Pro (Google Fonts), beide mit vietnamesischen Zeichen.
