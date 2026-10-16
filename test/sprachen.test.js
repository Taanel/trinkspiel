// Prüft, dass jede Sprache vollständig ist: gleiche Schlüssel in de/en/vi
// und jede Frage in allen drei Sprachen. Starten mit: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ALLE_TEXTE } from '../js/sprache/index.js';
import { fragenDateien, RUNDEN_TYPEN } from '../js/runden/index.js';

const SPRACHEN = ['de', 'en', 'vi'];

// Liste aller Schlüssel-Pfade, z. B. "lobby.titel"
function schluessel(objekt, prefix = '') {
  return Object.entries(objekt).flatMap(([name, wert]) => {
    const pfad = prefix ? `${prefix}.${name}` : name;
    return wert && typeof wert === 'object' && !Array.isArray(wert) ? schluessel(wert, pfad) : [pfad];
  });
}

test('Alle Sprachdateien haben dieselben Schlüssel', () => {
  const deutsch = schluessel(ALLE_TEXTE.de).sort();
  for (const sprache of ['en', 'vi']) {
    const andere = schluessel(ALLE_TEXTE[sprache]).sort();
    assert.deepEqual(andere.filter((k) => !deutsch.includes(k)), [], `${sprache}: zu viel`);
    assert.deepEqual(deutsch.filter((k) => !andere.includes(k)), [], `${sprache}: fehlt`);
  }
});

test('Jedes Spiel hat Name, Kurztext und Erklär-Schritte in allen Sprachen', () => {
  for (const sprache of SPRACHEN) {
    for (const typ of RUNDEN_TYPEN) {
      const texte = ALLE_TEXTE[sprache].spiele[typ.id];
      assert.ok(texte?.name && texte.kurz, `${sprache}/${typ.id}`);
      assert.ok(Array.isArray(texte.schritte) && texte.schritte.length >= 3, `${sprache}/${typ.id} schritte`);
    }
  }
});

test('Jede Frage gibt es in allen drei Sprachen, IDs sind eindeutig', () => {
  for (const [typ, datei] of Object.entries(fragenDateien())) {
    const eintraege = JSON.parse(readFileSync(new URL(`../fragen/${datei}`, import.meta.url), 'utf8'));
    assert.ok(eintraege.length >= 10, `${datei}: zu wenige Fragen`);
    const ids = new Set();
    for (const eintrag of eintraege) {
      assert.ok(eintrag.id && !ids.has(eintrag.id), `${datei}: id ${eintrag.id} fehlt oder doppelt`);
      ids.add(eintrag.id);
      for (const sprache of SPRACHEN) {
        assert.ok(eintrag[sprache], `${datei} ${eintrag.id}: ${sprache} fehlt`);
        // Bei Objekten (z. B. {frage, a, b}) müssen alle Felder gleich sein wie im Deutschen
        if (typeof eintrag.de === 'object') {
          assert.deepEqual(Object.keys(eintrag[sprache]).sort(), Object.keys(eintrag.de).sort(), `${datei} ${eintrag.id} ${sprache}`);
        }
      }
    }
    if (typ === 'schaetzfrage') for (const e of eintraege) assert.equal(typeof e.antwort, 'number', e.id);
    if (typ === 'karte') for (const e of eintraege) assert.ok(['nie', 'pflicht', 'regel'].includes(e.art), e.id);
  }
});
