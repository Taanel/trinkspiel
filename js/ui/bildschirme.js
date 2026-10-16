// Alle Bildschirme außer den Runden selbst (die zeichnet jeder Runden-Typ in js/runden/).
//
// zeichneApp(app) bekommt alles, was gerade bekannt ist, und gibt EIN Element zurück,
// das main.js in die Seite setzt. Es wird nach jeder Änderung komplett neu gebaut.
//
// "app" enthält:
//   sicht      – was der Gastgeber geschickt hat (oder null vor dem Beitreten)
//   status     – Verbindungsstatus ('verbinde', 'bereit', 'getrennt', …)
//   start      – Daten für die Startseite { raumAusLink, fortsetzenRaum, name, fehler }
//   hilfeOffen – ob die Spielerklärung über der Runde eingeblendet ist
//   tun        – Funktionen für Knöpfe (siehe main.js)

import { el, ikon } from './helfer.js';
import { qrSvg } from './qr.js';
import * as B from './bausteine.js';
import { SPRACHEN, sprache, t, frageText, schlucke } from '../sprache/index.js';
import { RUNDEN_TYPEN, MIX_ID, rundenTyp } from '../runden/index.js';
import { frageNachId } from '../spiel/fragen.js';
import { RUNDEN_AUSWAHL } from '../spiel/zustand.js';

export function zeichneApp(app) {
  const { sicht, status } = app;

  // Endgültige Fehler: eigener Bildschirm
  if (['voll', 'entfernt', 'fehler'].includes(status)) return meldungBildschirm(app, status);
  if (!app.verbunden) return startBildschirm(app);
  if (!sicht) return meldungBildschirm(app, status === 'nichtGefunden' ? 'nichtGefunden' : 'verbinde');

  const inhalt = {
    lobby: lobbyBildschirm,
    erklaerung: erklaerBildschirm,
    runde: rundenBildschirm,
    ende: endBildschirm,
  }[sicht.phase](app);

  return el(
    'div',
    { class: `bildschirm phase-${sicht.phase}` },
    kopfzeile(app),
    verbindungsBand(status),
    sicht.regel && sicht.phase === 'runde' && regelBand(sicht.regel),
    inhalt,
    app.hilfeOffen && sicht.runde && hilfeBlatt(app, sicht.runde.typ),
  );
}

// ---------- Teile, die überall vorkommen ----------

function sprachWahl(app) {
  return el(
    'div',
    { class: 'sprach-wahl', role: 'group', 'aria-label': t('allgemein.sprache') },
    SPRACHEN.map((s) =>
      el('button', {
        class: 'sprach-knopf',
        lang: s.code,
        title: s.name,
        'aria-label': s.name,
        'aria-pressed': String(s.code === sprache()),
        onclick: () => app.tun.spracheWechseln(s.code),
        text: s.kurz,
      }),
    ),
  );
}

function kopfzeile(app) {
  const { sicht } = app;
  let mitte = null;
  if (sicht.phase === 'runde' || sicht.phase === 'erklaerung') {
    const typId = sicht.runde?.typ ?? sicht.erklaerTyp;
    const name = typId === 'karte' && sicht.runde ? t(`spiele.karte.arten.${sicht.runde.art}`) : t(`spiele.${typId}.name`);
    mitte = el(
      'div',
      { class: 'kopf-runde' },
      el('span', { class: 'kopf-spiel', text: name }),
      el('span', { class: 'kopf-zaehler', text: t('runde.nummer', { nr: sicht.rundeNr, gesamt: sicht.rundenGesamt }) }),
    );
  }
  return el(
    'header',
    { class: 'kopf' },
    el('p', { class: 'serie', 'aria-label': t('lobby.raumCode', { code: sicht.raum }) }, el('span', { class: 'serie-nr', text: `${t('lobby.raum')} №` }), sicht.raum),
    mitte,
    el(
      'div',
      { class: 'kopf-rechts' },
      sicht.phase === 'runde' &&
        el('button', { class: 'hilfe-knopf', 'aria-label': t('runde.hilfe'), onclick: app.tun.hilfe }, ikon('frage')),
      sprachWahl(app),
    ),
  );
}

function verbindungsBand(status) {
  if (!['getrennt', 'nichtGefunden', 'verbinde'].includes(status)) return null;
  return el('p', { class: 'verbindungs-band', role: 'status', text: t(`verbindung.${status}`) });
}

function regelBand(regelId) {
  return el('p', { class: 'regel-band' }, el('strong', { text: t('runde.regel') }), ' ', frageText(frageNachId('karte', regelId)));
}

// Unterer Bereich mit dem Hauptknopf, im Daumenbereich festgeheftet.
function aktionsLeiste(...kinder) {
  return el('div', { class: 'aktions-leiste' }, kinder);
}

function knopf(text, beiKlick, art = 'haupt', extra = {}) {
  return el('button', { class: `knopf ${art}`, type: 'button', onclick: beiKlick, text, ...extra });
}

function gastgeberName(sicht) {
  return B.spielerNach(sicht, sicht.gastgeberId).name;
}

// ---------- Startseite ----------

function startBildschirm(app) {
  const { start, tun } = app;
  const nameFeld = el('input', {
    id: 'name',
    class: 'eingabe',
    type: 'text',
    maxlength: '16',
    autocomplete: 'nickname',
    enterkeyhint: 'go',
    value: start.name ?? '',
    'aria-describedby': start.fehler ? 'start-fehler' : null,
  });
  const name = () => nameFeld.value.trim();

  const teile = [
    el('h1', { class: 'titel', lang: 'vi' }, 'Một hai', el('br'), 'ba dô!'),
    el('p', { class: 'unterzeile', text: t('start.unterzeile') }),
    el('label', { class: 'feld' }, el('span', { class: 'feld-name', text: t('start.deinName') }), nameFeld),
    start.fehler && el('p', { id: 'start-fehler', class: 'feld-fehler', role: 'alert', text: t(`start.fehler.${start.fehler}`) }),
  ];

  if (start.raumAusLink) {
    // Über einen Einladungslink gekommen: nur beitreten.
    teile.push(
      el('p', { class: 'einladung-text' }, t('start.eingeladen'), ' ', el('strong', { class: 'serie-inline', text: start.raumAusLink })),
      knopf(t('start.beitreten'), () => tun.beitreten(name(), start.raumAusLink)),
      el('button', { class: 'text-knopf', type: 'button', onclick: tun.linkVergessen, text: t('start.andererRaum') }),
    );
  } else {
    const codeFeld = el('input', {
      id: 'code',
      class: 'eingabe code',
      type: 'text',
      maxlength: '4',
      autocapitalize: 'characters',
      autocomplete: 'off',
      spellcheck: 'false',
      placeholder: 'KXPT',
      'aria-label': t('start.raumCode'),
    });
    teile.push(
      start.fortsetzenRaum &&
        el('button', { class: 'los-knopf fortsetzen', type: 'button', onclick: () => tun.fortsetzen(name()) },
          el('span', { class: 'los-titel', text: t('start.fortsetzen') }),
          el('span', { class: 'serie-inline', text: start.fortsetzenRaum })),
      knopf(t('start.erstellen'), () => tun.erstellen(name())),
      el('form', {
        class: 'code-zeile',
        onsubmit: (e) => {
          e.preventDefault();
          tun.beitreten(name(), codeFeld.value);
        },
      },
      el('label', { class: 'feld' }, el('span', { class: 'feld-name', text: t('start.oderCode') }), codeFeld),
      el('button', { class: 'knopf zweit', type: 'submit', text: t('start.beitreten') })),
    );
  }

  teile.push(el('p', { class: 'verantwortung', text: t('start.verantwortung') }));

  return el(
    'div',
    { class: 'bildschirm phase-start' },
    el('header', { class: 'kopf' }, el('span'), el('div', { class: 'kopf-rechts' }, sprachWahl(app))),
    el('main', { class: 'start' }, teile),
  );
}

// Warten auf Verbindung oder Fehlermeldung.
function meldungBildschirm(app, art) {
  const endgueltig = ['voll', 'entfernt', 'fehler'].includes(art);
  return el(
    'div',
    { class: 'bildschirm phase-meldung' },
    el('header', { class: 'kopf' }, el('span'), el('div', { class: 'kopf-rechts' }, sprachWahl(app))),
    el(
      'main',
      { class: 'meldung' },
      !endgueltig && el('div', { class: 'warte-los', 'aria-hidden': 'true' }),
      el('h1', { class: 'meldung-titel', text: t(`verbindung.${art}`) }),
      el('p', { text: t(`verbindung.${art}Text`) }),
      knopf(endgueltig ? t('allgemein.zurStartseite') : t('allgemein.abbrechen'), app.tun.verlassen, endgueltig ? 'haupt' : 'zweit'),
    ),
  );
}

// ---------- Lobby mit Spiele-Menü ----------

function lobbyBildschirm(app) {
  const { sicht, tun } = app;
  const aktive = sicht.spieler.filter((s) => s.verbunden);

  const spielerListe = el(
    'ul',
    { class: 'spieler-liste', 'aria-label': t('lobby.spieler') },
    sicht.spieler.map((s) =>
      el(
        'li',
        { class: 'spieler-chip' + (s.verbunden ? '' : ' offline') },
        B.avatar(s),
        el('span', { text: s.id === sicht.ich ? `${s.name} (${t('allgemein.du')})` : s.name }),
        s.id === sicht.gastgeberId && el('span', { class: 'chip-zusatz', text: t('lobby.gastgeber') }),
        !s.verbunden && el('span', { class: 'chip-zusatz', text: t('lobby.offline') }),
        sicht.istGastgeber && s.id !== sicht.ich &&
          el('button', {
            class: 'chip-weg',
            type: 'button',
            'aria-label': t('lobby.entfernen', { name: s.name }),
            onclick: () => tun.aktion('entfernen', s.id),
          }, ikon('kreuz')),
      ),
    ),
  );

  return el(
    'main',
    { class: 'lobby' },
    el('h1', { class: 'titel klein', lang: 'vi', text: 'Một hai ba dô!' }),
    el('p', { class: 'unterzeile', text: t('lobby.dabei', { n: aktive.length }) }),
    spielerListe,
    einladung(app, aktive.length < 3),
    el('h2', { class: 'abschnitt', text: t('lobby.spielWaehlen') }),
    spieleMenue(app),
    rundenWahl(app),
    el('button', { class: 'text-knopf', type: 'button', onclick: tun.verlassen, text: t('lobby.verlassen') }),
    aktionsLeiste(
      sicht.istGastgeber
        ? knopf(t('lobby.starten'), () => tun.aktion('starten'), 'haupt', { disabled: !sicht.verfuegbar.includes(sicht.auswahl.spiel) })
        : el('p', { class: 'warte-text', text: t('lobby.warteAufGastgeber', { name: gastgeberName(sicht) }) }),
    ),
  );
}

// Einladung: QR-Code + Link teilen. Offen, solange weniger als 3 Leute da sind.
function einladung(app, offen) {
  const link = app.einladungsLink;
  return el(
    'details',
    { class: 'einladung', open: offen },
    el('summary', { class: 'einladung-kopf', text: t('lobby.einladen') }),
    el(
      'div',
      { class: 'einladung-los' },
      qrSvg(link),
      el('div', { class: 'einladung-info' },
        el('p', { text: t('lobby.scannen') }),
        el('p', { class: 'einladung-code' }, t('lobby.oderCode'), ' ', el('strong', { text: app.sicht.raum })),
        knopf(t('lobby.teilen'), app.tun.teilen, 'zweit dunkel')),
    ),
  );
}

// Die Spiele als farbige Lose. Der Gastgeber tippt eins an, alle anderen sehen die Wahl.
function spieleMenue(app) {
  const { sicht, tun } = app;
  const eintraege = [{ id: MIX_ID, farbe: 'zitrone', minSpieler: 2 }, ...RUNDEN_TYPEN];

  const lose = eintraege.map((typ, nummer) => {
    const gewaehlt = sicht.auswahl.spiel === typ.id;
    const moeglich = sicht.verfuegbar.includes(typ.id);
    const inhalt = [
      // Der Kuli-Kreis kreist nur den Namen ein, damit er keinen anderen Text durchstreicht
      el('span', { class: 'los-titel' }, t(`spiele.${typ.id}.name`), gewaehlt && B.stiftKreis(`menue-${typ.id}`)),
      el('span', { class: 'los-text', text: moeglich ? t(`spiele.${typ.id}.kurz`) : t('lobby.abSpielern', { n: typ.minSpieler }) }),
      // Seriennummer wie auf einem echten Los, klein in der Ecke
      el('span', { class: 'los-serie', 'aria-hidden': 'true', text: `${sicht.raum}·${String(nummer).padStart(2, '0')}` }),
    ];
    const klassen = `los farbe-${typ.farbe}` + (typ.id === MIX_ID ? ' gross' : '') + (gewaehlt ? ' gewaehlt' : '');
    return sicht.istGastgeber
      ? el('button', {
          class: klassen,
          type: 'button',
          disabled: !moeglich,
          'aria-pressed': String(gewaehlt),
          onclick: () => tun.aktion('spielWaehlen', typ.id),
        }, inhalt)
      : el('div', { class: klassen + (moeglich ? '' : ' gesperrt'), 'aria-current': gewaehlt ? 'true' : null }, inhalt);
  });
  return el('div', { class: 'lose' }, lose);
}

function rundenWahl(app) {
  const { sicht, tun } = app;
  if (sicht.istGastgeber) {
    return el(
      'div',
      { class: 'runden-wahl', role: 'group', 'aria-label': t('lobby.runden') },
      el('span', { class: 'runden-wahl-name', text: t('lobby.runden') }),
      el('div', { class: 'segment' },
        RUNDEN_AUSWAHL.map((n) =>
          el('button', {
            type: 'button',
            class: 'segment-knopf',
            'aria-pressed': String(sicht.auswahl.rundenAnzahl === n),
            disabled: !sicht.istGastgeber,
            onclick: () => tun.aktion('rundenAnzahl', n),
            text: n,
          }),
        )),
    );
  }
  return el('p', { class: 'runden-wahl-name', text: t('lobby.rundenText', { n: sicht.auswahl.rundenAnzahl }) });
}

// ---------- Erklärung vor einem Spiel ----------

function erklaerung(typId) {
  const typ = rundenTyp(typId);
  return el(
    'div',
    { class: `los erklaer-los farbe-${typ.farbe}` },
    el('h1', { class: 'los-titel', text: t(`spiele.${typId}.name`) }),
    el('p', { class: 'los-text', text: t(`spiele.${typId}.kurz`) }),
    el('ol', { class: 'schritte' }, t(`spiele.${typId}.schritte`).map((schritt) => el('li', { text: schritt }))),
  );
}

function erklaerBildschirm(app) {
  const { sicht, tun } = app;
  const ich = B.spielerNach(sicht, sicht.ich);
  const verstanden = sicht.spieler.filter((s) => s.verstanden).map((s) => s.id);
  return el(
    'main',
    { class: 'erklaerung' },
    erklaerung(sicht.erklaerTyp),
    B.fortschritt(sicht, verstanden),
    aktionsLeiste(
      ich.verstanden ? B.gewartet(t('erklaerung.warten')) : knopf(t('erklaerung.verstanden'), () => tun.aktion('verstanden')),
      sicht.istGastgeber && knopf(t('runde.nichtWarten'), () => tun.aktion('erzwingen'), 'zweit'),
    ),
  );
}

// Erklärung als Blatt über der Runde ("?"-Knopf).
function hilfeBlatt(app, typId) {
  return el(
    'div',
    { class: 'hilfe-blatt', role: 'dialog', 'aria-modal': 'true', 'aria-label': t(`spiele.${typId}.name`) },
    erklaerung(typId),
    knopf(t('allgemein.schliessen'), app.tun.hilfe, 'zweit'),
  );
}

// ---------- Runde ----------

function rundenBildschirm(app) {
  const { sicht, tun } = app;
  const typ = rundenTyp(sicht.runde.typ);
  const letzte = sicht.rundeNr >= sicht.rundenGesamt;

  let leiste;
  if (sicht.istGastgeber) {
    leiste = sicht.runde.abgeschlossen
      ? knopf(letzte ? t('runde.zumErgebnis') : t('runde.weiter'), () => tun.aktion('weiter'))
      : knopf(t('runde.nichtWarten'), () => tun.aktion('erzwingen'), 'zweit');
  } else if (sicht.runde.abgeschlossen) {
    leiste = el('p', { class: 'warte-text', text: t('runde.warteAufGastgeber', { name: gastgeberName(sicht) }) });
  }

  return el(
    'main',
    { class: `runden-flaeche farbe-${typ.farbe}` },
    typ.zeichne(sicht, (wert) => tun.aktion('eingabe', wert)),
    leiste && aktionsLeiste(leiste),
  );
}

// ---------- Ende: Ergebnistafel ----------

function endBildschirm(app) {
  const { sicht, tun } = app;
  const rangliste = [...sicht.spieler].sort((a, b) => b.schlucke - a.schlucke);
  const gesamt = rangliste.reduce((summe, s) => summe + s.schlucke, 0);
  const meiste = rangliste[0]?.schlucke ?? 0;
  // Platz = 1 + Anzahl der Spieler mit MEHR Schlucken. Gleich viele Schlucke → gleicher Platz.
  const platzVon = (s) => 1 + rangliste.filter((andere) => andere.schlucke > s.schlucke).length;

  return el(
    'main',
    { class: 'ende' },
    el('h1', { class: 'titel klein', text: t('ende.titel') }),
    el('p', { class: 'unterzeile', text: t('ende.gesamt', { n: gesamt }) }),
    // Ergebnistafel wie bei der Lotterie-Ziehung (bảng kết quả xổ số):
    // links der Platz, rechts die Zahl in einer festen Spalte.
    el('p', { class: 'tafel-kopf', 'aria-hidden': 'true' }, el('span', { text: t('ende.platz') }), el('span', { text: t('ende.schlucke') })),
    el(
      'ol',
      { class: 'tafel' },
      rangliste.map((s) =>
        el(
          'li',
          {
            // Alle, die gleich viele Schlucke wie der Erste haben, bekommen das Gewinner-Los
            class: 'tafel-zeile' + (meiste > 0 && s.schlucke === meiste ? ' sieger' : '') + (s.id === sicht.ich ? ' ich' : ''),
            'aria-label': `${platzVon(s)}. ${s.name}: ${schlucke(s.schlucke)}`,
          },
          el('span', { class: 'tafel-platz', text: platzVon(s) }),
          B.avatar(s),
          el('span', { class: 'tafel-name', text: s.name }),
          el('span', { class: 'tafel-zahl', 'data-roll': '', text: s.schlucke }),
        ),
      ),
    ),
    aktionsLeiste(
      sicht.istGastgeber
        ? [knopf(t('ende.nochmal'), () => tun.aktion('starten')), knopf(t('ende.menue'), () => tun.aktion('menue'), 'zweit')]
        : el('p', { class: 'warte-text', text: t('lobby.warteAufGastgeber', { name: gastgeberName(sicht) }) }),
    ),
  );
}

// Schlüssel, der sich ändert, wenn ein NEUER Bildschirm erscheint (nicht bei jeder Kleinigkeit).
// main.js spielt die Eingangs-Animation nur ab, wenn sich dieser Schlüssel ändert.
export function bildschirmSchluessel(app) {
  const s = app.sicht;
  if (!app.verbunden || !s) return `start|${app.status}`;
  return [s.phase, s.rundeNr, s.runde?.phase, s.runde?.abgeschlossen, s.erklaerTyp].join('|');
}
