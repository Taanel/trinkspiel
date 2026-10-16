// Runden-Typ: WER WÜRDE EHER
// Eine Frage ("Wer würde eher im Urlaub den Flug verpassen?"), jeder wählt geheim
// eine Person. Wer die meisten Stimmen hat, trinkt so viele Schlucke wie Stimmen.
//
// Aufbau jeder Runden-Datei (gleich in allen Dateien in diesem Ordner):
//   1. SPIELREGELN  – laufen nur auf dem Gastgeber-Handy, kein Bildschirm-Code
//   2. SICHT        – was ein einzelner Spieler wissen darf
//   3. BILDSCHIRM   – zeichnet die Runde auf dem Handy

import { el } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import * as B from '../ui/bausteine.js';

const ID = 'wer-wuerde-eher';

export default {
  id: ID,
  farbe: 'rosa',
  minSpieler: 3,
  fragenDatei: 'wer-wuerde-eher.json',

  // ---------- 1. SPIELREGELN ----------

  // Neue Runde anlegen. "frage" ist ein Eintrag aus fragen/wer-wuerde-eher.json.
  erstelle(spieler, frage) {
    return { frageId: frage.id, stimmen: {} }; // stimmen: { wählerId: gewählteId }
  },

  // Ein Spieler hat abgestimmt. "wert" ist die id der gewählten Person.
  eingabe(runde, spielerId, wert, alleSpieler) {
    if (!alleSpieler.some((s) => s.id === wert)) return; // ungültige Wahl ignorieren
    runde.stimmen[spielerId] = wert;
  },

  // Fertig, wenn alle verbundenen Spieler abgestimmt haben.
  fertig(runde, aktive) {
    return aktive.every((s) => runde.stimmen[s.id]);
  },

  // Stimmen zählen. Meiste Stimmen → so viele Schlucke wie Stimmen.
  auswerten(runde) {
    const zaehlung = {};
    for (const gewaehlt of Object.values(runde.stimmen)) {
      zaehlung[gewaehlt] = (zaehlung[gewaehlt] ?? 0) + 1;
    }
    const meiste = Math.max(0, ...Object.values(zaehlung));
    const punkte = {};
    for (const [id, anzahl] of Object.entries(zaehlung)) {
      if (anzahl === meiste) punkte[id] = anzahl;
    }
    return { zaehlung, punkte };
  },

  // ---------- 2. SICHT ----------
  // Niemand erfährt, wer wen gewählt hat: Wir schicken nur die eigene Stimme,
  // die Liste, wer schon gewählt hat, und am Ende die Anzahl pro Person.
  sichtFuer(runde, spielerId) {
    return {
      frageId: runde.frageId,
      meineStimme: runde.stimmen[spielerId] ?? null,
      fertig: Object.keys(runde.stimmen),
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const text = frageText(frageNachId(ID, r.frageId));

    if (r.ergebnis) {
      const sortiert = Object.entries(r.ergebnis.zaehlung).sort((a, b) => b[1] - a[1]);
      return el(
        'section',
        { class: 'runde' },
        B.frage(text),
        el(
          'ul',
          { class: 'stimmen-liste' },
          sortiert.map(([id, anzahl], i) =>
            el(
              'li',
              { class: 'stimmen-zeile', style: { '--i': i, '--anteil': anzahl / sicht.spieler.length } },
              B.avatar(B.spielerNach(sicht, id)),
              el('span', { class: 'stimmen-name', text: B.spielerNach(sicht, id).name }),
              el('span', { class: 'stimmen-anzahl', 'data-roll': '', text: t('runde.stimmen', { n: anzahl }) }),
            ),
          ),
        ),
        B.trinkListe(sicht, r.ergebnis),
      );
    }

    return el(
      'section',
      { class: 'runde' },
      B.frage(text),
      r.meineStimme
        ? B.gewartet()
        : el('p', { class: 'anleitung', text: t('spiele.wer-wuerde-eher.auftrag') }),
      B.spielerKnoepfe(sicht, { gewaehlt: r.meineStimme, beiWahl: (id) => sende(id) }),
      B.fortschritt(sicht, r.fertig),
    );
  },
};
