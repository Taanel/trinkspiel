// Runden-Typ: HERDENTRIEB
// Eine offene Frage ("Eine Automarke?"). Jeder tippt geheim ein Wort.
// Ziel: dasselbe antworten wie die meisten. Wer nicht zur größten Gruppe
// ("Herde") gehört, trinkt 2. Gibt es keine eindeutige Herde, trinken alle 1.
//
// Die Fragen sind so gewählt, dass die Antworten in jeder Sprache gleich sind
// (Eigennamen, Marken, Zahlen), weil Spieler verschiedene Sprachen nutzen können.
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben.

import { el } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import * as B from '../ui/bausteine.js';

const ID = 'herde';
const MAX_ZEICHEN = 30;
const PUNKTE_AUSSERHALB = 2;
const PUNKTE_KEINE_HERDE = 1;

// Macht Antworten vergleichbar: "B.M.W." = "bmw", "Hà Nội" = "hanoi", "Müller" = "muller".
export function vereinheitliche(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Akzente und Umlaut-Punkte entfernen
    .replace(/[đĐ]/g, 'd')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Leerzeichen und Satzzeichen weg
}

export default {
  id: ID,
  farbe: 'himmel',
  minSpieler: 3,
  fragenDatei: 'herde.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    return { frageId: frage.id, antworten: {} }; // { spielerId: 'Text' }
  },

  eingabe(runde, spielerId, wert) {
    const text = String(wert ?? '').trim().slice(0, MAX_ZEICHEN);
    if (!vereinheitliche(text)) return; // leere Antwort ignorieren
    runde.antworten[spielerId] = text;
  },

  fertig(runde, aktive) {
    return aktive.every((s) => runde.antworten[s.id]);
  },

  auswerten(runde) {
    // Gleiche Antworten zu Gruppen zusammenfassen
    const gruppenNachSchluessel = new Map();
    for (const [id, text] of Object.entries(runde.antworten)) {
      const schluessel = vereinheitliche(text);
      if (!gruppenNachSchluessel.has(schluessel)) gruppenNachSchluessel.set(schluessel, { antwort: text, ids: [] });
      gruppenNachSchluessel.get(schluessel).ids.push(id);
    }
    const gruppen = [...gruppenNachSchluessel.values()].sort((a, b) => b.ids.length - a.ids.length);

    // Eine Herde gibt es nur, wenn die größte Gruppe mindestens 2 Leute hat
    // und echt größer ist als die zweitgrößte.
    const groesste = gruppen[0];
    const herde = groesste && groesste.ids.length >= 2 && (gruppen.length === 1 || groesste.ids.length > gruppen[1].ids.length)
      ? groesste
      : null;

    const punkte = {};
    for (const id of Object.keys(runde.antworten)) {
      if (!herde) punkte[id] = PUNKTE_KEINE_HERDE;
      else if (!herde.ids.includes(id)) punkte[id] = PUNKTE_AUSSERHALB;
    }
    return { gruppen, herdeAntwort: herde?.antwort ?? null, punkte };
  },

  // ---------- 2. SICHT ----------
  sichtFuer(runde, spielerId) {
    return {
      frageId: runde.frageId,
      meineAntwort: runde.antworten[spielerId] ?? null,
      fertig: Object.keys(runde.antworten),
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const text = frageText(frageNachId(ID, r.frageId));
    const kinder = [B.frage(text)];

    if (r.ergebnis) {
      const erg = r.ergebnis;
      kinder.push(
        el('ul', { class: 'antwort-liste' },
          erg.gruppen.map((gruppe) =>
            el('li', {},
              el('div', { class: 'antwort herden-gruppe' + (gruppe.antwort === erg.herdeAntwort ? ' herde' : '') },
                el('span', { class: 'antwort-text', text: gruppe.antwort }),
                el('span', { class: 'antwort-stimmen', 'data-roll': '', text: gruppe.ids.length }),
                el('div', { class: 'gruppen-avatare' }, gruppe.ids.map((id) => B.avatar(B.spielerNach(sicht, id), 'klein'))))),
          )),
        B.ergebnisText(erg.herdeAntwort
          ? t('spiele.herde.herde', { antwort: erg.herdeAntwort })
          : t('spiele.herde.keineHerde')),
        B.trinkListe(sicht, erg),
      );
      return el('section', { class: 'runde' }, kinder);
    }

    if (r.meineAntwort) {
      kinder.push(el('p', { class: 'meine-antwort', text: r.meineAntwort }), B.gewartet());
    } else {
      const feld = el('input', {
        id: 'herde-antwort', // id, damit das Feld beim Neuzeichnen erhalten bleibt
        class: 'eingabe',
        type: 'text',
        maxlength: String(MAX_ZEICHEN),
        autocomplete: 'off',
        enterkeyhint: 'send',
        placeholder: t('spiele.herde.platzhalter'),
        'aria-label': t('spiele.herde.platzhalter'),
      });
      const abschicken = (e) => {
        e.preventDefault();
        if (feld.value.trim()) sende(feld.value);
      };
      kinder.push(
        el('p', { class: 'anleitung', text: t('spiele.herde.auftrag') }),
        el('form', { class: 'eingabe-zeile', onsubmit: abschicken }, feld,
          el('button', { class: 'knopf haupt', type: 'submit', text: t('allgemein.senden') })),
      );
    }
    kinder.push(B.fortschritt(sicht, r.fertig));
    return el('section', { class: 'runde' }, kinder);
  },
};
