// Wiederverwendbare Bausteine für die Runden-Bildschirme.
// Jeder Runden-Typ (js/runden/*.js) setzt seinen Bildschirm aus diesen Teilen zusammen,
// so sehen alle Spiele einheitlich aus.
//
// Drei Erkennungszeichen des Designs ("Lotterielos") stecken hier drin:
//   - stiftKreis(): Auswahl wird wie mit Kugelschreiber eingekreist
//   - Stanzloch: wer fertig ist, bekommt ein Loch am Avatar (CSS-Klasse "gelocht")
//   - data-roll: diese Zahlen rollen bei der Auflösung durch (siehe animationen.js)
//
// "data-merk" gibt Elementen einen festen Namen. So erkennt main.js beim Neuzeichnen,
// welche Elemente schon da waren, und spielt deren Animation nicht noch einmal ab.

import { el } from './helfer.js';
import { t, schlucke } from '../sprache/index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Farbe pro Spieler: kommt vom Gastgeber (Platz in der Liste, siehe baueSicht).
// Ersatz, falls sie fehlt: aus der id berechnet.
const FARBEN = 6;
export function farbNummer(id) {
  let summe = 0;
  for (const zeichen of id) summe = (summe * 31 + zeichen.charCodeAt(0)) % 997;
  return summe % FARBEN;
}

// Runder "Avatar" mit dem ersten Buchstaben des Namens.
export function avatar(spieler, groesse = '') {
  return el('span', {
    class: `avatar farbe-${spieler.farbe ?? farbNummer(spieler.id)} ${groesse}`,
    'aria-hidden': 'true',
    text: (spieler.name || '?').slice(0, 1).toUpperCase(),
  });
}

export function spielerNach(sicht, id) {
  return sicht.spieler.find((s) => s.id === id) ?? { id, name: '?' };
}

// Handgezogener Kreis um eine Auswahl (leicht schief, wie mit dem Kuli).
export function stiftKreis(merk) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'stift-kreis');
  svg.setAttribute('viewBox', '0 0 100 60');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.merk = merk;
  const pfad = document.createElementNS(SVG_NS, 'path');
  // Etwas mehr als eine Runde, damit sich die Enden überlappen wie bei echter Handschrift.
  pfad.setAttribute('d', 'M94 10 C78 0 18 0 4 12 C-2 26 2 56 50 58 C94 60 101 40 98 20 C96 9 86 3 70 2');
  svg.append(pfad);
  return svg;
}

// Die große Frage in der Mitte.
export function frage(text) {
  return el('h2', { class: 'frage' }, text);
}

// Raster mit einem Knopf pro Spieler (z. B. zum Abstimmen).
// optionen: { gewaehlt: id, ohne: id, beiWahl: (id) => ... }
export function spielerKnoepfe(sicht, { gewaehlt, ohne, beiWahl }) {
  const knoepfe = sicht.spieler
    .filter((s) => s.id !== ohne)
    .map((s) =>
      el(
        'button',
        {
          class: 'spieler-knopf' + (s.id === gewaehlt ? ' gewaehlt' : ''),
          'aria-pressed': s.id === gewaehlt ? 'true' : 'false',
          onclick: () => beiWahl(s.id),
        },
        avatar(s),
        el('span', { class: 'spieler-knopf-name', text: s.id === sicht.ich ? `${s.name} (${t('allgemein.du')})` : s.name }),
        s.id === gewaehlt && stiftKreis(`kreis-${s.id}`),
      ),
    );
  return el('div', { class: 'spieler-raster' }, knoepfe);
}

// Zeigt, wer schon fertig ist: eine Reihe Avatare (fertig = gelocht) und "3 von 5".
export function fortschritt(sicht, fertigeIds) {
  const aktive = sicht.spieler.filter((s) => s.verbunden);
  const fertig = aktive.filter((s) => fertigeIds.includes(s.id)).length;
  return el(
    'div',
    { class: 'fortschritt', role: 'status' },
    el('div', { class: 'fortschritt-avatare' }, aktive.map((s) => lochAvatar(s, fertigeIds.includes(s.id)))),
    el('span', { text: t('runde.fertig', { fertig, gesamt: aktive.length }) }),
  );
}

// Avatar, der ein Stanzloch bekommt, sobald der Spieler fertig ist.
export function lochAvatar(spieler, gelocht) {
  const a = avatar(spieler, 'klein');
  if (gelocht) {
    a.classList.add('gelocht');
    a.dataset.merk = `loch-${spieler.id}`;
  }
  return a;
}

// Hinweis "Warte auf die anderen …", nachdem man selbst gewählt hat.
export function gewartet(text = t('runde.gewaehlt')) {
  return el('p', { class: 'hinweis-gewaehlt' }, text);
}

// Ergebnis: Wer trinkt wie viel. schluckTabelle = { spielerId: anzahl }
// Die Zeile des eigenen Handys wird hervorgehoben (rot = du trinkst).
export function trinkListe(sicht, schluckTabelle) {
  const eintraege = Object.entries(schluckTabelle)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (eintraege.length === 0) {
    return el('p', { class: 'niemand-trinkt', text: t('runde.niemandTrinkt') });
  }
  return el(
    'ul',
    { class: 'trink-liste', 'aria-label': t('runde.werTrinkt') },
    eintraege.map(([id, n]) => {
      const s = spielerNach(sicht, id);
      const ich = id === sicht.ich;
      return el(
        'li',
        { class: 'trink-zeile' + (ich ? ' ich' : '') },
        avatar(s),
        el('span', { class: 'trink-name', text: ich ? t('runde.duTrinkst') : s.name }),
        el('span', { class: 'trink-anzahl', 'data-roll': '', text: schlucke(n) }),
      );
    }),
  );
}

// Text unter dem Ergebnis, der sagt, warum getrunken wird.
export function ergebnisText(text) {
  return el('p', { class: 'ergebnis-text' }, text);
}
