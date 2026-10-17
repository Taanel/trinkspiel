// Runden-Typ: HEISSE KARTOFFEL
// Ein Thema erscheint (z. B. "Biermarken"). Wer die Bombe hat, sagt laut ein
// passendes Wort und gibt die Bombe mit einem Tipp weiter. Die Zündschnur ist
// geheim (20–45 Sekunden). Bei wem die Bombe explodiert, der trinkt.
//
// Besonderheit: Diese Runde endet durch ZEIT, nicht durch Eingaben.
// Sie setzt runde.endetUm; der Gastgeber stellt dafür einen Timer
// (siehe zeitPruefen in spiel/ablauf.js und stelleRundenTimer in netz/gastgeber.js).
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben.

import { el, ikon } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import { mischen } from '../spiel/zufall.js';
import * as B from '../ui/bausteine.js';

const ID = 'kartoffel';
const ZUENDSCHNUR_MIN_MS = 20000;
const ZUENDSCHNUR_MAX_MS = 45000;
const SPERRE_MS = 1500; // so lange kann man die Bombe nicht sofort weitergeben
const PUNKTE_EXPLOSION = 3;

export default {
  id: ID,
  farbe: 'lachs',
  minSpieler: 3,
  fragenDatei: 'kartoffel.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    const reihenfolge = mischen(spieler.map((s) => s.id));
    const jetzt = Date.now();
    return {
      frageId: frage.id,
      reihenfolge, // in dieser Reihenfolge wandert die Bombe
      halter: reihenfolge[0],
      seit: jetzt, // seit wann der Halter die Bombe hat
      weitergaben: 0,
      // GEHEIM: Wann die Bombe explodiert. Wird nie an die Handys geschickt.
      endetUm: jetzt + ZUENDSCHNUR_MIN_MS + Math.random() * (ZUENDSCHNUR_MAX_MS - ZUENDSCHNUR_MIN_MS),
    };
  },

  // Nur wer die Bombe hält, kann "weiter" schicken. Sie geht an den nächsten
  // verbundenen Spieler in der Reihenfolge.
  eingabe(runde, spielerId, wert, spieler) {
    if (wert !== 'weiter' || spielerId !== runde.halter) return;
    if (Date.now() - runde.seit < SPERRE_MS) return;
    const verbunden = new Set(spieler.filter((s) => s.verbunden).map((s) => s.id));
    const start = runde.reihenfolge.indexOf(runde.halter);
    for (let schritt = 1; schritt <= runde.reihenfolge.length; schritt++) {
      const naechster = runde.reihenfolge[(start + schritt) % runde.reihenfolge.length];
      if (verbunden.has(naechster) && naechster !== runde.halter) {
        runde.halter = naechster;
        runde.seit = Date.now();
        runde.weitergaben += 1;
        return;
      }
    }
  },

  // Fertig ist die Runde nur durch die Zeit (oder "Nicht mehr warten" = sofortige Explosion).
  fertig() {
    return false;
  },

  auswerten(runde) {
    return {
      halterId: runde.halter,
      weitergaben: runde.weitergaben,
      punkte: { [runde.halter]: PUNKTE_EXPLOSION },
    };
  },

  // ---------- 2. SICHT ----------
  // endetUm wird NICHT verschickt, sonst könnte man die Explosion vorhersagen.
  sichtFuer(runde, spielerId) {
    return {
      frageId: runde.frageId,
      halter: runde.halter,
      ichHalte: runde.halter === spielerId,
      // Wie lange der Knopf noch gesperrt ist (Millisekunden ab jetzt)
      sperreMs: Math.max(0, runde.seit + SPERRE_MS - Date.now()),
      weitergaben: runde.weitergaben,
      ergebnis: runde.ergebnis ?? null,
    };
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const thema = frageText(frageNachId(ID, r.frageId));
    const halter = B.spielerNach(sicht, r.halter);

    if (r.ergebnis) {
      const opfer = B.spielerNach(sicht, r.ergebnis.halterId);
      return el(
        'section',
        { class: 'runde kartoffel' },
        el('div', { class: 'bumm' },
          el('div', { class: 'bombe explodiert' }, ikon('bombe')),
          el('p', { class: 'bumm-text', text: t('spiele.kartoffel.bumm') })),
        B.ergebnisText(t('spiele.kartoffel.explodiert', { name: opfer.name, n: r.ergebnis.weitergaben })),
        B.trinkListe(sicht, r.ergebnis),
      );
    }

    // Thema als Los der Runde
    const kinder = [el('p', { class: 'klein-titel', text: t('spiele.kartoffel.thema') }), B.frage(thema)];

    if (r.ichHalte) {
      const knopf = el('button', {
        class: 'knopf haupt weitergeben',
        type: 'button',
        disabled: r.sperreMs > 0,
        onclick: () => sende('weiter'),
        text: t('spiele.kartoffel.weitergeben'),
      });
      // Kurze Sperre nach dem Bekommen, damit niemand sofort zurückspielt
      if (r.sperreMs > 0) setTimeout(() => { if (knopf.isConnected) knopf.disabled = false; }, r.sperreMs);
      kinder.push(
        el('div', { class: 'bombe-halter ich' },
          el('div', { class: 'bombe tickt' }, ikon('bombe')),
          el('p', { class: 'bombe-text', text: t('spiele.kartoffel.deineBombe') })),
        el('p', { class: 'anleitung', text: t('spiele.kartoffel.auftrag') }),
        knopf,
      );
    } else {
      kinder.push(
        el('div', { class: 'bombe-halter' },
          el('div', { class: 'bombe tickt' }, ikon('bombe')),
          el('p', { class: 'bombe-text' }, B.avatar(halter), t('spiele.kartoffel.hatBombe', { name: halter.name }))),
      );
    }
    return el('section', { class: 'runde kartoffel' }, kinder);
  },
};
