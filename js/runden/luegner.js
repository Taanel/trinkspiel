// Runden-Typ: DER LÜGNER
// Alle bekommen dieselbe Frage, EINE Person heimlich eine leicht andere
// (und weiß das nicht!). Alle tippen eine kurze Antwort.
// Dann sehen alle die echte Frage und alle Antworten, diskutieren und stimmen ab,
// wer die andere Frage hatte.
//   - Lügner erwischt  → Lügner trinkt 3
//   - nicht erwischt   → alle anderen trinken 2
//
// Phasen: 'antworten' → 'abstimmen' → Ergebnis
// Aufbau der Datei wie in wer-wuerde-eher.js beschrieben.

import { el } from '../ui/helfer.js';
import { frageText, t } from '../sprache/index.js';
import { frageNachId } from '../spiel/fragen.js';
import { zufaelligesElement, mischen } from '../spiel/zufall.js';
import * as B from '../ui/bausteine.js';

const ID = 'luegner';
const MAX_ZEICHEN = 40;
const SCHLUCKE_ERWISCHT = 3;
const SCHLUCKE_ENTKOMMEN = 2;

// Holt aus einem Fragen-Eintrag eine Variante ('echt' oder 'luege') in allen Sprachen:
// { de: '...', en: '...', vi: '...' }
function variante(frageId, welche) {
  const eintrag = frageNachId(ID, frageId);
  const ergebnis = {};
  for (const [sprache, texte] of Object.entries(eintrag)) {
    if (texte && typeof texte === 'object') ergebnis[sprache] = texte[welche];
  }
  return ergebnis;
}

export default {
  id: ID,
  farbe: 'flieder',
  minSpieler: 3,
  fragenDatei: 'luegner.json',

  // ---------- 1. SPIELREGELN ----------
  erstelle(spieler, frage) {
    return {
      frageId: frage.id,
      phase: 'antworten',
      luegnerId: zufaelligesElement(spieler).id,
      teilnehmer: spieler.map((s) => s.id),
      antworten: {}, // { spielerId: 'Text' }
      stimmen: {}, // { wählerId: verdächtigteId }
      reihenfolge: mischen(spieler.map((s) => s.id)), // Antworten in zufälliger Reihenfolge zeigen
    };
  },

  eingabe(runde, spielerId, wert, spieler) {
    if (!runde.teilnehmer.includes(spielerId)) return; // erst später beigetreten

    if (runde.phase === 'antworten') {
      const text = String(wert ?? '').trim().slice(0, MAX_ZEICHEN);
      if (!text) return;
      runde.antworten[spielerId] = text;
      // Haben alle verbundenen Teilnehmer geantwortet? Dann weiter zum Abstimmen.
      const aktive = spieler.filter((s) => s.verbunden && runde.teilnehmer.includes(s.id));
      if (aktive.every((s) => runde.antworten[s.id])) runde.phase = 'abstimmen';
      return;
    }

    if (runde.phase === 'abstimmen') {
      if (wert === spielerId || !runde.teilnehmer.includes(wert)) return; // nicht sich selbst
      runde.stimmen[spielerId] = wert;
    }
  },

  fertig(runde, aktive) {
    if (runde.phase !== 'abstimmen') return false;
    return aktive.filter((s) => runde.teilnehmer.includes(s.id)).every((s) => runde.stimmen[s.id]);
  },

  // Der Gastgeber drückt "Nicht mehr warten": Beim Antworten geht es zum Abstimmen weiter.
  // Gibt true zurück, wenn die Runde damit noch NICHT fertig ist.
  erzwingen(runde) {
    if (runde.phase === 'antworten') {
      runde.phase = 'abstimmen';
      return true;
    }
    return false;
  },

  auswerten(runde) {
    const zaehlung = {};
    for (const id of Object.values(runde.stimmen)) zaehlung[id] = (zaehlung[id] ?? 0) + 1;
    const meiste = Math.max(0, ...Object.values(zaehlung));
    const anDerSpitze = Object.keys(zaehlung).filter((id) => zaehlung[id] === meiste);
    // Erwischt nur, wenn der Lügner ALLEIN die meisten Stimmen hat.
    const erwischt = anDerSpitze.length === 1 && anDerSpitze[0] === runde.luegnerId;

    const schlucke = {};
    if (erwischt) schlucke[runde.luegnerId] = SCHLUCKE_ERWISCHT;
    else for (const id of runde.teilnehmer) if (id !== runde.luegnerId) schlucke[id] = SCHLUCKE_ENTKOMMEN;

    return { erwischt, zaehlung, luegnerId: runde.luegnerId, schlucke };
  },

  // ---------- 2. SICHT ----------
  // Hier steckt der Trick: Während des Antwortens bekommt jedes Handy NUR den Text
  // seiner eigenen Frage. Der Lügner bekommt nie die echte Frage, die anderen nie
  // die Lügen-Frage, und niemand bekommt die Info, wer der Lügner ist.
  sichtFuer(runde, spielerId) {
    const sicht = { phase: runde.phase, teilnehmer: runde.teilnehmer };

    if (runde.phase === 'antworten') {
      const welche = spielerId === runde.luegnerId ? 'luege' : 'echt';
      sicht.meineFrage = variante(runde.frageId, welche);
      sicht.meineAntwort = runde.antworten[spielerId] ?? null;
      sicht.fertig = Object.keys(runde.antworten);
      return sicht;
    }

    sicht.echteFrage = variante(runde.frageId, 'echt');
    sicht.meineAntwort = runde.antworten[spielerId] ?? null;
    sicht.antworten = runde.reihenfolge.map((id) => ({ id, text: runde.antworten[id] ?? '—' }));
    sicht.meineStimme = runde.stimmen[spielerId] ?? null;
    sicht.fertig = Object.keys(runde.stimmen);

    if (runde.ergebnis) {
      sicht.ergebnis = runde.ergebnis;
      sicht.luegenFrage = variante(runde.frageId, 'luege');
    }
    return sicht;
  },

  // ---------- 3. BILDSCHIRM ----------
  zeichne(sicht, sende) {
    const r = sicht.runde;
    const dabei = r.teilnehmer.includes(sicht.ich);

    // Phase 1: Frage beantworten
    if (r.phase === 'antworten') {
      const kinder = [B.frage(frageText(r.meineFrage))];
      if (!dabei) {
        kinder.push(el('p', { class: 'anleitung', text: t('runde.naechsteRunde') }));
      } else if (r.meineAntwort) {
        kinder.push(el('p', { class: 'meine-antwort', text: r.meineAntwort }), B.gewartet(t('spiele.luegner.geantwortet')));
      } else {
        const feld = el('input', {
          id: 'luegner-antwort', // id, damit das Feld beim Neuzeichnen erhalten bleibt
          class: 'eingabe',
          type: 'text',
          maxlength: String(MAX_ZEICHEN),
          autocomplete: 'off',
          enterkeyhint: 'send',
          placeholder: t('spiele.luegner.platzhalter'),
          'aria-label': t('spiele.luegner.platzhalter'),
        });
        const abschicken = (e) => {
          e.preventDefault();
          if (feld.value.trim()) sende(feld.value);
        };
        kinder.push(
          el('p', { class: 'anleitung', text: t('spiele.luegner.auftragAntworten') }),
          el('form', { class: 'eingabe-zeile', onsubmit: abschicken }, feld,
            el('button', { class: 'knopf haupt', type: 'submit', text: t('allgemein.senden') })),
        );
      }
      kinder.push(B.fortschritt({ ...sicht, spieler: sicht.spieler.filter((s) => r.teilnehmer.includes(s.id)) }, r.fertig));
      return el('section', { class: 'runde' }, kinder);
    }

    // Phase 2 + Ergebnis: echte Frage, alle Antworten, abstimmen
    const kinder = [
      el('p', { class: 'klein-titel', text: t('spiele.luegner.echteFrageWar') }),
      B.frage(frageText(r.echteFrage)),
    ];

    const erg = r.ergebnis;
    const liste = el(
      'ul',
      { class: 'antwort-liste' },
      r.antworten.map(({ id, text }, i) => {
        const s = B.spielerNach(sicht, id);
        const kannWaehlen = !erg && dabei && id !== sicht.ich;
        const istLuegner = erg && id === erg.luegnerId;
        const inhalt = [
          B.avatar(s),
          el('span', { class: 'antwort-name', text: s.name }),
          el('span', { class: 'antwort-text', text: text }),
          !erg && r.meineStimme === id && B.stiftKreis(`kreis-${id}`),
          erg && el('span', { class: 'antwort-stimmen', 'data-roll': '', text: t('runde.stimmen', { n: erg.zaehlung[id] ?? 0 }) }),
        ];
        return el(
          'li',
          { style: { '--i': i } },
          kannWaehlen
            ? el('button', {
                class: 'antwort' + (r.meineStimme === id ? ' gewaehlt' : ''),
                'aria-pressed': String(r.meineStimme === id),
                onclick: () => sende(id),
              }, inhalt)
            : el('div', { class: 'antwort' + (istLuegner ? ' entlarvt' : '') + (id === sicht.ich ? ' ich' : '') }, inhalt),
        );
      }),
    );

    if (erg) {
      const luegner = B.spielerNach(sicht, erg.luegnerId);
      kinder.push(
        el('div', { class: 'enthuellung' },
          el('p', { class: 'klein-titel', text: t('spiele.luegner.luegnerWar') }),
          el('p', { class: 'enthuellung-name' }, B.avatar(luegner, 'gross'), luegner.name),
          el('p', { class: 'klein-titel', text: t('spiele.luegner.seineFrage') }),
          el('p', { class: 'luegen-frage', text: frageText(r.luegenFrage) }),
        ),
        liste,
        B.ergebnisText(t(erg.erwischt ? 'spiele.luegner.erwischt' : 'spiele.luegner.entkommen', { name: luegner.name })),
        B.trinkListe(sicht, erg.schlucke),
      );
    } else {
      kinder.push(
        el('p', { class: 'anleitung', text: dabei ? t('spiele.luegner.auftragAbstimmen') : t('runde.naechsteRunde') }),
        liste,
        r.meineStimme ? B.gewartet() : null,
        B.fortschritt({ ...sicht, spieler: sicht.spieler.filter((s) => r.teilnehmer.includes(s.id)) }, r.fertig),
      );
    }
    return el('section', { class: 'runde' }, kinder);
  },
};
