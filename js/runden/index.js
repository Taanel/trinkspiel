// Verzeichnis aller Runden-Typen.
//
// Jeder Eintrag hier erscheint automatisch im Spiele-Menü.
// NEUEN RUNDEN-TYP HINZUFÜGEN:
//   1. Eine bestehende Datei (z. B. mehrheit.js) kopieren und anpassen
//   2. Fragen-Datei in fragen/ anlegen
//   3. Hier importieren und in die Liste RUNDEN_TYPEN eintragen
//   4. Texte (Name, Erklärung) in js/sprache/de.js, en.js und vi.js unter "spiele.<id>" ergänzen

import werWuerdeEher from './wer-wuerde-eher.js';
import mehrheit from './mehrheit.js';
import luegner from './luegner.js';
import schaetzfrage from './schaetzfrage.js';
import karte from './karte.js';

export const RUNDEN_TYPEN = [werWuerdeEher, mehrheit, luegner, schaetzfrage, karte];

// Die Karten-Runde wird im Party-Mix nur zwischendurch eingestreut (siehe spiel/ablauf.js).
export const KARTEN_ID = karte.id;

// Sonder-Eintrag im Menü: alle Runden-Typen gemischt.
export const MIX_ID = 'mix';

export function rundenTyp(id) {
  return RUNDEN_TYPEN.find((typ) => typ.id === id);
}

// Für fragen.js: welcher Typ liest welche Datei.
export function fragenDateien() {
  return Object.fromEntries(RUNDEN_TYPEN.map((typ) => [typ.id, typ.fragenDatei]));
}
