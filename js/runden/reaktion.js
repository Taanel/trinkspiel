// Runden-Typ: SCHNELLSTER FINGER
// Alle starren aufs Handy. Nach ein paar Sekunden wird das Feld gelb: sofort tippen!
// Wer zu früh tippt, trinkt. Wer am langsamsten ist, trinkt auch.
//
// Gemessen wird auf JEDEM Handy selbst (performance.now()), deshalb spielt
// es keine Rolle, wie schnell das Internet ist. Geschickt werden nur die Millisekunden.
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben. Diese Runde braucht keine Fragen.

import { el } from '../ui/helfer.js';
import { t } from '../sprache/index.js';
import * as B from '../ui/bausteine.js';

const ID = 'reaktion';
const WARTEN_MIN_MS = 2000;
const WARTEN_MAX_MS = 6000;
const PUNKTE_ZU_FRUEH = 2;
const PUNKTE_LANGSAMSTE = 2;
const ZU_FRUEH = 'frueh';

// Die Zeitmessung muss das Neuzeichnen überleben (der Bildschirm wird bei jeder
// Nachricht vom Gastgeber neu gebaut). Deshalb merken wir sie hier, pro Runde.
let messung = { schluessel: null, gelbAb: 0, gesendet: false };

export default {
  id: ID,
  farbe: 'limette',
  minSpieler: 2,
  fragenDatei: null,

  // ---------- 1. SPIELREGELN ----------
  erstelle() {
    return {
      // Für alle gleich: so lange bleibt das Feld dunkel
      wartenMs: Math.round(WARTEN_MIN_MS + Math.random() * (WARTEN_MAX_MS - WARTEN_MIN_MS)),
      zeiten: {}, // { spielerId: Millisekunden | 'frueh' }
    };
  },

  eingabe(runde, spielerId, wert) {
    if (runde.zeiten[spielerId] !== undefined) return; // nur ein Versuch
    if (wert === ZU_FRUEH) {
      runde.zeiten[spielerId] = ZU_FRUEH;
      return;
    }
    const ms = Number(wert);
    if (Number.isFinite(ms) && ms >= 0 && ms < 10000) runde.zeiten[spielerId] = Math.round(ms);
  },

  fertig(runde, aktive) {
    return aktive.every((s) => runde.zeiten[s.id] !== undefined);
  },

  auswerten(runde) {
    const punkte = {};
    const zuFrueh = Object.keys(runde.zeiten).filter((id) => runde.zeiten[id] === ZU_FRUEH);
    for (const id of zuFrueh) punkte[id] = PUNKTE_ZU_FRUEH;

    // Gültige Zeiten, schnellste zuerst
    const gueltig = Object.entries(runde.zeiten)
      .filter(([, ms]) => ms !== ZU_FRUEH)
      .map(([id, ms]) => ({ id, ms }))
      .sort((a, b) => a.ms - b.ms);

    let schnellste = [];
    if (gueltig.length > 0) {
      const bester = gueltig[0].ms;
      schnellste = gueltig.filter((e) => e.ms === bester).map((e) => e.id);
    }
    // Der Langsamste trinkt nur, wenn es mindestens zwei gültige Zeiten gibt
    // und nicht alle gleich schnell waren.
    if (gueltig.length >= 2) {
      const schlechtester = gueltig.at(-1).ms;
      if (schlechtester !== gueltig[0].ms) {
        for (const e of gueltig) if (e.ms === schlechtester) punkte[e.id] = PUNKTE_LANGSAMSTE;
      }
    }
    return { liste: [...gueltig, ...zuFrueh.map((id) => ({ id, ms: ZU_FRUEH }))], schnellste, punkte };
  },

  // ---------- 2. SICHT ----------
  sichtFuer(runde, spielerId) {
    return {
      wartenMs: runde.wartenMs,
      meineZeit: runde.zeiten[spielerId] ?? null,
      fertig: Object.keys(runde.zeiten),
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;

    if (r.ergebnis) {
      const erg = r.ergebnis;
      const schnell = erg.schnellste.map((id) => B.spielerNach(sicht, id).name).join(', ');
      return el(
        'section',
        { class: 'runde reaktion' },
        el('ol', { class: 'schaetz-liste' },
          erg.liste.map(({ id, ms }) => {
            const s = B.spielerNach(sicht, id);
            return el('li', {
              class: 'schaetz-zeile' + (erg.schnellste.includes(id) ? ' beste' : '') + (ms === ZU_FRUEH ? ' zu-frueh' : ''),
            },
            B.avatar(s),
            el('span', { class: 'schaetz-name', text: s.name }),
            ms === ZU_FRUEH
              ? el('span', { class: 'schaetz-wert', text: t('spiele.reaktion.zuFrueh') })
              : el('span', { class: 'schaetz-wert', 'data-roll': '', text: t('spiele.reaktion.ms', { n: ms }) }));
          }),
        ),
        schnell && B.ergebnisText(t('spiele.reaktion.schnellste', { name: schnell })),
        B.trinkListe(sicht, erg),
      );
    }

    // Schon getippt: eigene Zeit zeigen und warten
    if (r.meineZeit !== null) {
      return el(
        'section',
        { class: 'runde reaktion' },
        el('p', { class: 'meine-antwort' },
          r.meineZeit === ZU_FRUEH ? t('spiele.reaktion.zuFrueh') : t('spiele.reaktion.ms', { n: r.meineZeit })),
        B.gewartet(),
        B.fortschritt(sicht, r.fertig),
      );
    }

    // Das Reaktions-Feld. Beim ersten Zeichnen dieser Runde startet die Messung.
    const schluessel = `${sicht.raum}-${sicht.rundeNr}`;
    if (messung.schluessel !== schluessel) {
      messung = { schluessel, gelbAb: performance.now() + r.wartenMs, gesendet: false };
    }
    const istGelb = () => performance.now() >= messung.gelbAb;

    const feld = el('button', {
      type: 'button',
      class: 'reaktions-feld' + (istGelb() ? ' jetzt' : ''),
      // pointerdown statt click: reagiert sofort beim Berühren, nicht erst beim Loslassen
      onpointerdown: (e) => {
        e.preventDefault();
        if (messung.gesendet) return;
        messung.gesendet = true;
        const jetzt = performance.now();
        sende(jetzt < messung.gelbAb ? ZU_FRUEH : Math.round(jetzt - messung.gelbAb));
      },
    }, el('span', { class: 'reaktions-text', text: istGelb() ? t('spiele.reaktion.jetzt') : t('spiele.reaktion.warte') }));

    // Zum richtigen Zeitpunkt gelb werden (ohne das ganze Bild neu zu bauen)
    if (!istGelb()) {
      setTimeout(() => {
        if (!feld.isConnected) return;
        feld.classList.add('jetzt');
        feld.querySelector('.reaktions-text').textContent = t('spiele.reaktion.jetzt');
      }, messung.gelbAb - performance.now());
    }

    return el(
      'section',
      { class: 'runde reaktion' },
      el('p', { class: 'anleitung', text: t('spiele.reaktion.anleitung') }),
      feld,
      B.fortschritt(sicht, r.fertig),
    );
  },
};
