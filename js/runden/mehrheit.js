// Runden-Typ: MEHRHEIT GEWINNT
// Entweder-oder-Frage ("Strand oder Berge?"). Jeder wählt geheim A oder B.
// Die Minderheit trinkt 2 Schlucke. Gleichstand: alle trinken 1.
// Aufbau wie in wer-wuerde-eher.js beschrieben.

import { el } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import * as B from '../ui/bausteine.js';

const ID = 'mehrheit';
const SCHLUCKE_MINDERHEIT = 2;
const SCHLUCKE_GLEICHSTAND = 1;

export default {
  id: ID,
  farbe: 'minze',
  minSpieler: 3,
  fragenDatei: 'mehrheit.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    return { frageId: frage.id, wahl: {} }; // wahl: { spielerId: 'a' | 'b' }
  },

  eingabe(runde, spielerId, wert) {
    if (wert !== 'a' && wert !== 'b') return;
    runde.wahl[spielerId] = wert;
  },

  fertig(runde, aktive) {
    return aktive.every((s) => runde.wahl[s.id]);
  },

  auswerten(runde) {
    const a = Object.keys(runde.wahl).filter((id) => runde.wahl[id] === 'a');
    const b = Object.keys(runde.wahl).filter((id) => runde.wahl[id] === 'b');
    const schlucke = {};
    let ausgang;
    if (a.length === b.length) {
      ausgang = 'gleichstand';
      for (const id of [...a, ...b]) schlucke[id] = SCHLUCKE_GLEICHSTAND;
    } else if (a.length === 0 || b.length === 0) {
      ausgang = 'einig'; // alle gleicher Meinung → niemand trinkt
    } else {
      ausgang = 'minderheit';
      const minderheit = a.length < b.length ? a : b;
      for (const id of minderheit) schlucke[id] = SCHLUCKE_MINDERHEIT;
    }
    return { a, b, ausgang, schlucke };
  },

  // ---------- 2. SICHT ----------
  sichtFuer(runde, spielerId) {
    return {
      frageId: runde.frageId,
      meineWahl: runde.wahl[spielerId] ?? null,
      fertig: Object.keys(runde.wahl),
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const f = frageText(frageNachId(ID, r.frageId));

    // Die beiden Seiten sind die zwei Hälften EINES Loses, getrennt an der Abreißkante.
    // Eine Hälfte ist ein großer Knopf, im Ergebnis eine Spalte mit Zahl und Avataren.
    const seite = (buchstabe) => {
      const namen = r.ergebnis?.[buchstabe] ?? [];
      return el(
        r.ergebnis ? 'div' : 'button',
        {
          class: `seite seite-${buchstabe}` + (r.meineWahl === buchstabe ? ' gewaehlt' : ''),
          onclick: r.ergebnis ? null : () => sende(buchstabe),
          'aria-pressed': r.ergebnis ? null : String(r.meineWahl === buchstabe),
        },
        el('span', { class: 'seite-text', text: f[buchstabe] }),
        r.ergebnis &&
          el('span', { class: 'seite-zahl', 'data-roll': '', text: namen.length }),
        r.ergebnis &&
          el('div', { class: 'seite-avatare' }, namen.map((id) => B.avatar(B.spielerNach(sicht, id), 'klein'))),
        !r.ergebnis && r.meineWahl === buchstabe && B.stiftKreis(`kreis-${buchstabe}`),
      );
    };

    const kinder = [
      B.frage(f.frage),
      el('div', { class: 'seiten' }, seite('a'), el('span', { class: 'oder', 'aria-hidden': 'true', text: t('allgemein.oder') }), seite('b')),
    ];

    if (r.ergebnis) {
      kinder.push(B.ergebnisText(t(`spiele.mehrheit.ausgang.${r.ergebnis.ausgang}`)));
      kinder.push(B.trinkListe(sicht, r.ergebnis.schlucke));
    } else {
      if (r.meineWahl) kinder.push(B.gewartet());
      kinder.push(B.fortschritt(sicht, r.fertig));
    }
    return el('section', { class: 'runde' }, kinder);
  },
};
