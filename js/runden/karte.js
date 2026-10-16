// Runden-Typ: KARTEN
// Eine Karte, die alle gleichzeitig sehen. Keine Eingabe nötig.
// Es gibt drei Arten (Feld "art" in fragen/karten.json):
//   'nie'     – Ich hab noch nie …   → wer es schon getan hat, trinkt
//   'pflicht' – Aufgabe für eine zufällige Person, sonst 3 Schlucke
//   'regel'   – neue Regel, gilt bis zur nächsten Regel-Karte (oben eingeblendet)
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben.

import { el } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import { zufaelligesElement } from '../spiel/zufall.js';
import * as B from '../ui/bausteine.js';

const ID = 'karte';

export default {
  id: ID,
  farbe: 'papier',
  minSpieler: 2,
  fragenDatei: 'karten.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    return {
      frageId: frage.id,
      art: frage.art,
      fuer: frage.art === 'pflicht' ? zufaelligesElement(spieler).id : null,
    };
  },

  eingabe() {
    // Karten brauchen keine Eingabe.
  },

  // Eine Karte ist sofort "fertig": Der Gastgeber tippt einfach auf "Weiter".
  fertig() {
    return true;
  },

  auswerten(runde) {
    // Eine Regel-Karte ersetzt die bisher gültige Regel (siehe spiel/ablauf.js).
    return { punkte: {}, neueRegel: runde.art === 'regel' ? runde.frageId : null };
  },

  // ---------- 2. SICHT ----------
  sichtFuer(runde) {
    return { frageId: runde.frageId, art: runde.art, fuer: runde.fuer };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht) {
    const r = sicht.runde;
    const text = frageText(frageNachId(ID, r.frageId));
    const person = r.fuer && B.spielerNach(sicht, r.fuer);

    return el(
      'section',
      { class: `runde karte-runde karte-${r.art}` },
      person && el('p', { class: 'karte-person' + (person.id === sicht.ich ? ' ich' : '') }, B.avatar(person, 'gross'), person.name),
      el('div', { class: 'spielkarte' }, el('p', { class: 'spielkarte-text', text })),
      el('p', { class: 'ergebnis-text', text: t(`spiele.karte.unterzeile.${r.art}`) }),
    );
  },
};
