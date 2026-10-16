// Runden-Typ: SCHÄTZFRAGE
// Zahlenfrage ("Wie hoch ist der Eiffelturm?"). Jeder tippt geheim eine Zahl.
// Wer am weitesten daneben liegt, trinkt 3. Wer am nächsten dran ist,
// darf 2 Schlucke an jemanden verteilen (das macht ihr am Tisch aus).
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben.

import { el } from '../ui/helfer.js';
import { frageText, sprache, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import * as B from '../ui/bausteine.js';

const ID = 'schaetzfrage';
const PUNKTE_WEITESTE = 3;

// Zahl schön formatiert, z. B. 1.500.000 (de) oder 1,500,000 (en).
// Jahreszahlen ohne Tausender-Punkt (1989, nicht 1.989): "format": "jahr" in der Fragen-Datei.
function zahl(n, format) {
  return new Intl.NumberFormat(sprache(), { useGrouping: format !== 'jahr' }).format(n);
}

export default {
  id: ID,
  farbe: 'aprikose',
  minSpieler: 2,
  fragenDatei: 'schaetzfragen.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    return { frageId: frage.id, antwort: frage.antwort, schaetzungen: {} };
  },

  eingabe(runde, spielerId, wert) {
    const n = Number(wert);
    if (!Number.isFinite(n)) return;
    runde.schaetzungen[spielerId] = n;
  },

  fertig(runde, aktive) {
    return aktive.every((s) => runde.schaetzungen[s.id] !== undefined);
  },

  auswerten(runde) {
    // Liste aller Schätzungen, sortiert von "am nächsten dran" bis "am weitesten weg".
    const liste = Object.entries(runde.schaetzungen)
      .map(([id, wert]) => ({ id, wert, abstand: Math.abs(wert - runde.antwort) }))
      .sort((a, b) => a.abstand - b.abstand);

    const punkte = {};
    let beste = [];
    if (liste.length > 1) {
      const kleinster = liste[0].abstand;
      const groesster = liste[liste.length - 1].abstand;
      if (kleinster !== groesster) {
        beste = liste.filter((e) => e.abstand === kleinster).map((e) => e.id);
        for (const e of liste) if (e.abstand === groesster) punkte[e.id] = PUNKTE_WEITESTE;
      }
    }
    return { antwort: runde.antwort, liste, beste, punkte };
  },

  // ---------- 2. SICHT ----------
  // Die richtige Antwort wird erst mit dem Ergebnis verschickt.
  sichtFuer(runde, spielerId) {
    return {
      frageId: runde.frageId,
      meineSchaetzung: runde.schaetzungen[spielerId] ?? null,
      fertig: Object.keys(runde.schaetzungen),
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const eintrag = frageNachId(ID, r.frageId);
    const f = frageText(eintrag);
    const kinder = [B.frage(f.frage)];

    if (r.ergebnis) {
      const erg = r.ergebnis;
      kinder.push(
        el('div', { class: 'loesung' },
          el('p', { class: 'klein-titel', text: t('spiele.schaetzfrage.richtig') }),
          el('p', { class: 'loesung-zahl' }, zahl(erg.antwort, eintrag.format), el('span', { class: 'einheit', text: ` ${f.einheit}` })),
        ),
        el('ol', { class: 'schaetz-liste' },
          erg.liste.map((e, i) => {
            const s = B.spielerNach(sicht, e.id);
            return el('li', {
              class: 'schaetz-zeile' + (erg.beste.includes(e.id) ? ' beste' : '') + (erg.punkte[e.id] ? ' weiteste' : ''),
              style: { '--i': i },
            },
            B.avatar(s),
            el('span', { class: 'schaetz-name', text: s.name }),
            el('span', { class: 'schaetz-wert', text: `${zahl(e.wert, eintrag.format)} ${f.einheit}` }));
          }),
        ),
      );
      if (erg.beste.length) {
        const namen = erg.beste.map((id) => B.spielerNach(sicht, id).name).join(', ');
        kinder.push(B.ergebnisText(t('spiele.schaetzfrage.verteilen', { name: namen })));
      }
      kinder.push(B.trinkListe(sicht, erg));
      return el('section', { class: 'runde' }, kinder);
    }

    if (r.meineSchaetzung !== null) {
      kinder.push(el('p', { class: 'meine-antwort', text: `${zahl(r.meineSchaetzung, eintrag.format)} ${f.einheit}` }), B.gewartet());
    } else {
      const feld = el('input', {
        id: 'schaetzung', // id, damit das Feld beim Neuzeichnen erhalten bleibt
        class: 'eingabe zahl',
        type: 'number',
        inputmode: 'decimal',
        step: 'any',
        enterkeyhint: 'send',
        placeholder: '0',
        'aria-label': t('spiele.schaetzfrage.platzhalter'),
      });
      const abschicken = (e) => {
        e.preventDefault();
        if (feld.value !== '') sende(feld.value);
      };
      kinder.push(
        el('form', { class: 'eingabe-zeile', onsubmit: abschicken },
          el('label', { class: 'zahl-feld' }, feld, el('span', { class: 'einheit', text: f.einheit })),
          el('button', { class: 'knopf haupt', type: 'submit', text: t('allgemein.senden') })),
      );
    }
    kinder.push(B.fortschritt(sicht, r.fertig));
    return el('section', { class: 'runde' }, kinder);
  },
};
