// Mehrsprachigkeit: Deutsch, Englisch, Vietnamesisch.
//
// Jede Sprache ist eine Datei (de.js, en.js, vi.js) mit denselben Schlüsseln.
// Im Code schreibt man nie direkt Text, sondern t('schluessel'), z. B.
//   t('lobby.titel')                 → "Wer ist dabei?"
//   t('runde.trinkt', { name: 'Max' }) → "Max trinkt"   ({name} wird ersetzt)
//
// Jeder Spieler wählt die Sprache für SEIN Handy. Sie wird im Browser gespeichert.

import de from './de.js';
import en from './en.js';
import vi from './vi.js';
import { speicherLesen, speicherSchreiben } from '../ui/helfer.js';

const TEXTE = { de, en, vi };

// Reihenfolge = Reihenfolge in der Sprachauswahl.
export const SPRACHEN = [
  { code: 'de', name: 'Deutsch', kurz: 'DE' },
  { code: 'en', name: 'English', kurz: 'EN' },
  { code: 'vi', name: 'Tiếng Việt', kurz: 'VI' },
];

const SPEICHER = 'trinkspiel-sprache-v1';

// Startsprache: gespeicherte Wahl, sonst Sprache des Handys, sonst Deutsch.
function startSprache() {
  const gespeichert = speicherLesen(SPEICHER);
  if (gespeichert && TEXTE[gespeichert]) return gespeichert;
  const handy = (globalThis.navigator?.language ?? 'de').slice(0, 2);
  return TEXTE[handy] ? handy : 'de';
}

let aktuell = startSprache();

export function sprache() {
  return aktuell;
}

export function setzeSprache(code) {
  if (!TEXTE[code]) return;
  aktuell = code;
  speicherSchreiben(SPEICHER, code);
  document.documentElement.lang = code;
}

// Holt einen Wert über einen Pfad wie "spiele.mehrheit.name".
function nachschlagen(objekt, pfad) {
  return pfad.split('.').reduce((teil, name) => teil?.[name], objekt);
}

// Text in der aktuellen Sprache. Fehlt er, wird Deutsch genommen,
// fehlt er auch dort, sieht man den Schlüssel (so fällt der Fehler auf).
export function t(schluessel, werte = {}) {
  let text = nachschlagen(TEXTE[aktuell], schluessel) ?? nachschlagen(TEXTE.de, schluessel) ?? schluessel;
  if (typeof text === 'function') return text(werte);
  if (typeof text !== 'string') return text; // z. B. Listen (Erklär-Schritte)
  for (const [name, wert] of Object.entries(werte)) {
    text = text.replaceAll(`{${name}}`, wert);
  }
  return text;
}

// "1 Schluck Bier" / "3 Schlucke vom Shot" (jede Sprache entscheidet selbst über die Mehrzahl).
export function schlucke(anzahl, getraenk) {
  return t('schlucke', { n: anzahl, g: getraenk });
}

// Text eines Fragen-Eintrags in der aktuellen Sprache.
// Beispiel: frageText(eintrag) → eintrag.vi (bzw. eintrag.de als Ersatz)
export function frageText(eintrag) {
  return eintrag?.[aktuell] ?? eintrag?.de;
}

// Für Tests: alle Sprachtabellen.
export const ALLE_TEXTE = TEXTE;
