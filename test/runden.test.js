// Tests für die Spielregeln. Starten mit: npm test
// Alle Namen und Daten hier sind erfunden.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { setzeFragen } from '../js/spiel/fragen.js';
import { fragenDateien, rundenTyp } from '../js/runden/index.js';
import { neuerZustand, spielerBeitreten, spielerGetrennt } from '../js/spiel/zustand.js';
import * as A from '../js/spiel/ablauf.js';
import { umrechnen } from '../js/spiel/getraenke.js';

// Echte Fragen-Dateien laden, wie im Browser.
const fragen = {};
for (const [typ, datei] of Object.entries(fragenDateien())) {
  fragen[typ] = JSON.parse(readFileSync(new URL(`../fragen/${datei}`, import.meta.url), 'utf8'));
}
setzeFragen(fragen);

const spieler = (...ids) => ids.map((id) => ({ id, name: id, verbunden: true }));

// Ein Raum mit Gastgeber "anna" und weiteren Spielern.
function raum(...weitere) {
  const z = neuerZustand('TEST', { id: 'anna', name: 'Anna' });
  for (const id of weitere) spielerBeitreten(z, { id, name: id });
  return z;
}

// ---------- Wer würde eher ----------

test('Wer würde eher: meiste Stimmen trinkt so viele Schlucke wie Stimmen', () => {
  const typ = rundenTyp('wer-wuerde-eher');
  const r = typ.erstelle(spieler('a', 'b', 'c', 'd'), fragen['wer-wuerde-eher'][0]);
  const alle = spieler('a', 'b', 'c', 'd');
  typ.eingabe(r, 'a', 'b', alle);
  typ.eingabe(r, 'b', 'c', alle);
  typ.eingabe(r, 'c', 'b', alle);
  assert.equal(typ.fertig(r, alle), false);
  typ.eingabe(r, 'd', 'b', alle);
  assert.equal(typ.fertig(r, alle), true);
  assert.deepEqual(typ.auswerten(r).punkte, { b: 3 });
});

test('Wer würde eher: Gleichstand → alle an der Spitze trinken', () => {
  const typ = rundenTyp('wer-wuerde-eher');
  const alle = spieler('a', 'b', 'c', 'd');
  const r = typ.erstelle(alle, fragen['wer-wuerde-eher'][0]);
  typ.eingabe(r, 'a', 'b', alle);
  typ.eingabe(r, 'b', 'a', alle);
  typ.eingabe(r, 'c', 'a', alle);
  typ.eingabe(r, 'd', 'b', alle);
  assert.deepEqual(typ.auswerten(r).punkte, { a: 2, b: 2 });
});

test('Wer würde eher: Sicht verrät nicht, wer wen gewählt hat', () => {
  const typ = rundenTyp('wer-wuerde-eher');
  const alle = spieler('a', 'b', 'c');
  const r = typ.erstelle(alle, fragen['wer-wuerde-eher'][0]);
  typ.eingabe(r, 'a', 'c', alle);
  const sicht = typ.sichtFuer(r, 'b');
  assert.equal(sicht.meineStimme, null);
  assert.deepEqual(sicht.fertig, ['a']);
  assert.ok(!JSON.stringify(sicht).includes('"c"'));
});

test('Wer würde eher: ungültige Stimme wird ignoriert', () => {
  const typ = rundenTyp('wer-wuerde-eher');
  const alle = spieler('a', 'b', 'c');
  const r = typ.erstelle(alle, fragen['wer-wuerde-eher'][0]);
  typ.eingabe(r, 'a', 'gibts-nicht', alle);
  assert.deepEqual(r.stimmen, {});
});

// ---------- Mehrheit gewinnt ----------

test('Mehrheit: Minderheit trinkt 2', () => {
  const typ = rundenTyp('mehrheit');
  const r = typ.erstelle([], fragen.mehrheit[0]);
  for (const [id, wahl] of [['a', 'a'], ['b', 'a'], ['c', 'b']]) typ.eingabe(r, id, wahl);
  const erg = typ.auswerten(r);
  assert.equal(erg.ausgang, 'minderheit');
  assert.deepEqual(erg.punkte, { c: 2 });
});

test('Mehrheit: Gleichstand → alle trinken 1, Einigkeit → niemand', () => {
  const typ = rundenTyp('mehrheit');
  const r = typ.erstelle([], fragen.mehrheit[0]);
  for (const [id, wahl] of [['a', 'a'], ['b', 'b']]) typ.eingabe(r, id, wahl);
  assert.deepEqual(typ.auswerten(r).punkte, { a: 1, b: 1 });

  const r2 = typ.erstelle([], fragen.mehrheit[0]);
  for (const id of ['a', 'b', 'c']) typ.eingabe(r2, id, 'b');
  const erg = typ.auswerten(r2);
  assert.equal(erg.ausgang, 'einig');
  assert.deepEqual(erg.punkte, {});
});

// ---------- Der Lügner ----------

function luegnerRunde() {
  const typ = rundenTyp('luegner');
  const alle = spieler('a', 'b', 'c', 'd');
  const r = typ.erstelle(alle, fragen.luegner[0]);
  r.luegnerId = 'c'; // für den Test festlegen
  return { typ, alle, r };
}

test('Lügner: Lügner bekommt nur die Lügen-Frage, die anderen nur die echte', () => {
  const { typ, r } = luegnerRunde();
  const eintrag = fragen.luegner[0];
  const fuerLuegner = JSON.stringify(typ.sichtFuer(r, 'c'));
  const fuerAndere = JSON.stringify(typ.sichtFuer(r, 'a'));
  assert.ok(fuerLuegner.includes(eintrag.de.luege));
  assert.ok(!fuerLuegner.includes(eintrag.de.echt));
  assert.ok(fuerAndere.includes(eintrag.de.echt));
  assert.ok(!fuerAndere.includes(eintrag.de.luege));
  // Niemand erfährt vor der Auflösung, wer der Lügner ist
  assert.ok(!fuerAndere.includes('luegnerId'));
});

test('Lügner: nach allen Antworten geht es zum Abstimmen, erwischt → Lügner trinkt 3', () => {
  const { typ, alle, r } = luegnerRunde();
  for (const s of alle) typ.eingabe(r, s.id, `Antwort ${s.id}`, alle);
  assert.equal(r.phase, 'abstimmen');
  typ.eingabe(r, 'a', 'a', alle); // sich selbst wählen ist nicht erlaubt
  assert.equal(r.stimmen.a, undefined);
  typ.eingabe(r, 'a', 'c', alle);
  typ.eingabe(r, 'b', 'c', alle);
  typ.eingabe(r, 'c', 'a', alle);
  typ.eingabe(r, 'd', 'c', alle);
  assert.equal(typ.fertig(r, alle), true);
  const erg = typ.auswerten(r);
  assert.equal(erg.erwischt, true);
  assert.deepEqual(erg.punkte, { c: 3 });
});

test('Lügner: nicht erwischt (auch bei Gleichstand) → alle anderen trinken 2', () => {
  const { typ, alle, r } = luegnerRunde();
  for (const s of alle) typ.eingabe(r, s.id, 'x', alle);
  typ.eingabe(r, 'a', 'c', alle);
  typ.eingabe(r, 'b', 'd', alle);
  typ.eingabe(r, 'c', 'd', alle);
  typ.eingabe(r, 'd', 'c', alle);
  const erg = typ.auswerten(r);
  assert.equal(erg.erwischt, false);
  assert.deepEqual(erg.punkte, { a: 2, b: 2, d: 2 });
});

// ---------- Schätzfrage ----------

test('Schätzfrage: weiteste trinkt 3, beste wird genannt', () => {
  const typ = rundenTyp('schaetzfrage');
  const r = typ.erstelle([], { id: 'x', antwort: 100 });
  typ.eingabe(r, 'a', '90');
  typ.eingabe(r, 'b', 150);
  typ.eingabe(r, 'c', 'kein-wert'); // wird ignoriert
  typ.eingabe(r, 'c', 300);
  const erg = typ.auswerten(r);
  assert.deepEqual(erg.punkte, { c: 3 });
  assert.deepEqual(erg.beste, ['a']);
});

test('Schätzfrage: alle gleich weit weg → niemand trinkt', () => {
  const typ = rundenTyp('schaetzfrage');
  const r = typ.erstelle([], { id: 'x', antwort: 100 });
  typ.eingabe(r, 'a', 90);
  typ.eingabe(r, 'b', 110);
  assert.deepEqual(typ.auswerten(r).punkte, {});
});

test('Schätzfrage: Antwort wird erst mit dem Ergebnis verschickt', () => {
  const typ = rundenTyp('schaetzfrage');
  const r = typ.erstelle([], { id: 'x', antwort: 12345 });
  assert.ok(!JSON.stringify(typ.sichtFuer(r, 'a')).includes('12345'));
});

// ---------- Ablauf ----------

test('Ablauf: Spiel mit Erklärung, Runden, Schlucke und Ende', () => {
  const z = raum('ben', 'cem');
  A.waehleSpiel(z, 'mehrheit');
  A.setzeRundenAnzahl(z, 15);
  assert.equal(A.spielStarten(z), true);
  assert.equal(z.phase, 'erklaerung');
  // Ohne Getränk geht "Verstanden" nicht
  A.verstanden(z, 'anna');
  assert.equal(z.spieler.find((s) => s.id === 'anna').verstanden, false);
  A.waehleGetraenk(z, 'anna', 'bier');
  A.waehleGetraenk(z, 'ben', 'mix');
  A.waehleGetraenk(z, 'cem', 'shot');
  A.waehleGetraenk(z, 'cem', 'wodka-pur'); // gibt es nicht → bleibt Shot
  for (const id of ['anna', 'ben', 'cem']) A.verstanden(z, id);
  assert.equal(z.phase, 'runde');

  A.rundenEingabe(z, 'anna', 'a');
  A.rundenEingabe(z, 'ben', 'a');
  A.rundenEingabe(z, 'cem', 'b');
  assert.ok(z.runde.ergebnis);
  // cem ist Minderheit: 2 Punkte, trinkt Shot → 1 Schluck vom Shot
  const cem = z.spieler.find((s) => s.id === 'cem');
  assert.equal(cem.punkte, 2);
  assert.equal(cem.schlucke, 1);
  assert.deepEqual(z.runde.ergebnis.getrunken, { cem: { schlucke: 1, getraenk: 'shot' } });

  // Restliche Runden mit "Nicht mehr warten" durchklicken: keine Erklärung mehr dazwischen
  for (let i = 0; i < 14; i++) {
    A.weiter(z);
    assert.equal(z.phase, 'runde');
    A.erzwingen(z);
  }
  A.weiter(z);
  assert.equal(z.phase, 'ende');
});

test('Ablauf: Party-Mix hat jede 4. Runde eine Karte und nie zweimal denselben Typ hintereinander', () => {
  const plan = A.erstellePlan('mix', 40, 5);
  assert.equal(plan.length, 40);
  plan.forEach((typ, i) => assert.equal(typ === 'karte', (i + 1) % 4 === 0));
  const ohneKarten = plan.filter((typ) => typ !== 'karte');
  for (let i = 1; i < ohneKarten.length; i++) assert.notEqual(ohneKarten[i], ohneKarten[i - 1]);
});

test('Ablauf: Spiele mit zu wenigen Spielern sind nicht wählbar', () => {
  const z = raum('ben');
  assert.ok(!A.verfuegbareSpiele(z).includes('luegner'));
  A.waehleSpiel(z, 'luegner');
  assert.equal(A.spielStarten(z), false);
});

test('Ablauf: wer die Verbindung verliert, wird nicht mehr abgewartet', () => {
  const z = raum('ben', 'cem');
  A.waehleSpiel(z, 'mehrheit');
  A.spielStarten(z);
  A.erzwingen(z); // Erklärung überspringen
  A.rundenEingabe(z, 'anna', 'a');
  A.rundenEingabe(z, 'ben', 'b');
  assert.equal(z.runde.ergebnis, undefined);
  spielerGetrennt(z, 'cem');
  A.nachVerbindungsAenderung(z);
  assert.ok(z.runde.ergebnis);
});

test('Ablauf: Regel-Karte bleibt aktiv', () => {
  const z = raum('ben');
  setzeFragen({ ...fragen, karte: fragen.karte.filter((k) => k.art === 'regel').slice(0, 1) });
  A.waehleSpiel(z, 'karte');
  A.spielStarten(z);
  A.erzwingen(z);
  assert.equal(z.regel, fragen.karte.find((k) => k.art === 'regel').id);
  setzeFragen(fragen);
});

test('Sicht: Mitspieler sehen fremde Eingaben nicht', () => {
  const z = raum('ben', 'cem');
  A.waehleSpiel(z, 'wer-wuerde-eher');
  A.spielStarten(z);
  A.erzwingen(z);
  A.rundenEingabe(z, 'anna', 'cem');
  const sicht = A.baueSicht(z, 'ben');
  assert.equal(sicht.istGastgeber, false);
  assert.equal(sicht.runde.meineStimme, null);
  assert.ok(!('stimmen' in sicht.runde));
});

test('Getränke: Punkte werden je nach Getränk in Schlucke umgerechnet', () => {
  assert.deepEqual([1, 2, 3, 4, 6].map((p) => umrechnen(p, 'bier')), [1, 2, 3, 4, 6]);
  assert.deepEqual([1, 2, 3, 4, 6].map((p) => umrechnen(p, 'mix')), [1, 2, 2, 3, 4]);
  assert.deepEqual([1, 2, 3, 4, 6].map((p) => umrechnen(p, 'shot')), [1, 1, 1, 2, 2]);
  assert.equal(umrechnen(0, 'shot'), 0);
  assert.equal(umrechnen(3, undefined), 3); // ohne Wahl wie Bier
});
