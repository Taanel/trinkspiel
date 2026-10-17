// Der Spielablauf: alles, was den Spielzustand verändert.
// Läuft nur auf dem Gastgeber-Handy. Kein Bildschirm-Code hier drin,
// deshalb kann man alles mit "npm test" prüfen.
//
// Ablauf eines Spiels:
//   spielStarten → (erklaerung → runde → weiter → runde → …) → ende

import { RUNDEN_TYPEN, KARTEN_ID, MIX_ID, rundenTyp } from '../runden/index.js';
import { fragenFuer } from './fragen.js';
import { mischen, zufaelligesElement } from './zufall.js';
import { aktiveSpieler, RUNDEN_AUSWAHL } from './zustand.js';
import { istGetraenk, umrechnen } from './getraenke.js';

// Im Party-Mix kommt jede KARTEN_ALLE-te Runde eine Karte.
const KARTEN_ALLE = 4;

// ---------- Spiele-Menü ----------

// Welche Spiele kann man mit der aktuellen Spielerzahl wählen?
export function verfuegbareSpiele(zustand) {
  const anzahl = aktiveSpieler(zustand).length;
  const ids = RUNDEN_TYPEN.filter((typ) => anzahl >= typ.minSpieler).map((typ) => typ.id);
  const mixMoeglich = ids.some((id) => id !== KARTEN_ID);
  return mixMoeglich ? [MIX_ID, ...ids] : ids;
}

export function waehleSpiel(zustand, spielId) {
  if (zustand.phase !== 'lobby') return;
  if (spielId === MIX_ID || rundenTyp(spielId)) zustand.auswahl.spiel = spielId;
}

export function setzeRundenAnzahl(zustand, anzahl) {
  if (RUNDEN_AUSWAHL.includes(anzahl)) zustand.auswahl.rundenAnzahl = anzahl;
}

// ---------- Spiel starten / beenden ----------

export function spielStarten(zustand) {
  if (!verfuegbareSpiele(zustand).includes(zustand.auswahl.spiel)) return false;
  for (const s of zustand.spieler) {
    s.schlucke = 0;
    s.punkte = 0;
  }
  zustand.plan = erstellePlan(zustand.auswahl.spiel, zustand.auswahl.rundenAnzahl, aktiveSpieler(zustand).length);
  zustand.rundeNr = 0;
  zustand.runde = null;
  zustand.regel = null;
  zustand.bekannteTypen = [];
  naechsteRunde(zustand);
  return true;
}

// Liste der Runden-Typen für ein ganzes Spiel.
export function erstellePlan(spielId, anzahl, spielerAnzahl) {
  if (spielId !== MIX_ID) return Array(anzahl).fill(spielId);

  // Party-Mix: Typen aus einem "Beutel" ziehen. Ist er leer, wird er neu gemischt.
  // So kommen alle Typen ungefähr gleich oft dran.
  const typen = RUNDEN_TYPEN.filter((t) => t.id !== KARTEN_ID && spielerAnzahl >= t.minSpieler).map((t) => t.id);
  const plan = [];
  let beutel = [];
  for (let nr = 1; nr <= anzahl; nr++) {
    if (nr % KARTEN_ALLE === 0) {
      plan.push(KARTEN_ID);
      continue;
    }
    if (beutel.length === 0) {
      beutel = mischen(typen);
      // Nicht zweimal derselbe Typ direkt hintereinander (falls möglich)
      const vorher = plan.findLast((id) => id !== KARTEN_ID);
      if (beutel.length > 1 && beutel[0] === vorher) beutel.push(beutel.shift());
    }
    plan.push(beutel.shift());
  }
  return plan;
}

export function zurueckZumMenue(zustand) {
  zustand.phase = 'lobby';
  zustand.runde = null;
  zustand.erklaerTyp = null;
  zustand.regel = null;
}

// ---------- Runden ----------

export function naechsteRunde(zustand) {
  zustand.rundeNr += 1;
  if (zustand.rundeNr > zustand.plan.length) {
    zustand.phase = 'ende';
    zustand.runde = null;
    return;
  }
  const typId = zustand.plan[zustand.rundeNr - 1];
  // Neuer Typ in diesem Spiel? Dann erst die Erklärung zeigen.
  if (!zustand.bekannteTypen.includes(typId)) {
    zustand.phase = 'erklaerung';
    zustand.erklaerTyp = typId;
    zustand.runde = null;
    for (const s of zustand.spieler) s.verstanden = false;
    return;
  }
  starteRunde(zustand, typId);
}

function starteRunde(zustand, typId) {
  const typ = rundenTyp(typId);
  zustand.runde = { typ: typId, ...typ.erstelle(aktiveSpieler(zustand), waehleFrage(zustand, typId)) };
  zustand.phase = 'runde';
  zustand.erklaerTyp = null;
  pruefeFertig(zustand); // Karten sind sofort fertig
}

// Zufällige Frage, die in diesem Raum noch nicht dran war.
// Runden-Typen ohne Fragen-Datei (z. B. Schnellster Finger) bekommen null.
function waehleFrage(zustand, typId) {
  const alle = fragenFuer(typId);
  if (alle.length === 0) return null;
  let benutzt = zustand.benutzt[typId] ?? [];
  let frei = alle.filter((f) => !benutzt.includes(f.id));
  if (frei.length === 0) {
    benutzt = []; // alle schon gestellt → von vorne
    frei = alle;
  }
  const frage = zufaelligesElement(frei);
  zustand.benutzt[typId] = [...benutzt, frage.id];
  return frage;
}

// Ein Spieler wählt sein Getränk (auf dem Erklär-Bildschirm oder in der Lobby).
export function waehleGetraenk(zustand, spielerId, getraenk) {
  const spieler = zustand.spieler.find((s) => s.id === spielerId);
  if (spieler && istGetraenk(getraenk)) spieler.getraenk = getraenk;
}

// Ein Spieler tippt "Verstanden" auf dem Erklär-Bildschirm.
// Erst geht das, wenn er sein Getränk gewählt hat.
export function verstanden(zustand, spielerId) {
  if (zustand.phase !== 'erklaerung') return;
  const spieler = zustand.spieler.find((s) => s.id === spielerId);
  if (!spieler?.getraenk) return;
  spieler.verstanden = true;
  pruefeVerstanden(zustand);
}

// Gastgeber: nicht mehr auf alle warten.
export function erklaerungBeenden(zustand) {
  if (zustand.phase !== 'erklaerung') return;
  zustand.bekannteTypen.push(zustand.erklaerTyp);
  starteRunde(zustand, zustand.erklaerTyp);
}

function pruefeVerstanden(zustand) {
  if (aktiveSpieler(zustand).every((s) => s.verstanden)) erklaerungBeenden(zustand);
}

// Eingabe eines Spielers in der laufenden Runde (Stimme, Antwort, Zahl …).
export function rundenEingabe(zustand, spielerId, wert) {
  const runde = zustand.runde;
  if (zustand.phase !== 'runde' || !runde || runde.ergebnis) return;
  rundenTyp(runde.typ).eingabe(runde, spielerId, wert, zustand.spieler);
  pruefeFertig(zustand);
}

function pruefeFertig(zustand) {
  const runde = zustand.runde;
  if (!runde || runde.ergebnis) return;
  if (rundenTyp(runde.typ).fertig(runde, aktiveSpieler(zustand))) abschliessen(zustand);
}

// Runde auswerten: Punkte aus den Regeln → Schlucke im Getränk jedes Spielers.
function abschliessen(zustand) {
  const runde = zustand.runde;
  const ergebnis = rundenTyp(runde.typ).auswerten(runde, zustand.spieler);
  // Getrunken: { spielerId: { schlucke, getraenk } }, festgehalten, falls jemand später das Getränk wechselt
  ergebnis.getrunken = {};
  for (const [id, punkte] of Object.entries(ergebnis.punkte)) {
    const spieler = zustand.spieler.find((s) => s.id === id);
    if (!spieler || punkte <= 0) continue;
    const getraenk = spieler.getraenk ?? 'bier';
    const schlucke = umrechnen(punkte, getraenk);
    spieler.punkte = (spieler.punkte ?? 0) + punkte;
    spieler.schlucke = (spieler.schlucke ?? 0) + schlucke;
    ergebnis.getrunken[id] = { schlucke, getraenk };
  }
  runde.ergebnis = ergebnis;
  if (ergebnis.neueRegel) zustand.regel = ergebnis.neueRegel;
}

// Gastgeber: "Nicht mehr warten" (z. B. weil jemand aufs Klo ist).
export function erzwingen(zustand) {
  if (zustand.phase === 'erklaerung') return erklaerungBeenden(zustand);
  const runde = zustand.runde;
  if (zustand.phase !== 'runde' || !runde || runde.ergebnis) return;
  const typ = rundenTyp(runde.typ);
  // Manche Typen (Lügner) gehen erst in die nächste Phase statt direkt zum Ergebnis.
  if (typ.erzwingen?.(runde)) pruefeFertig(zustand);
  else abschliessen(zustand);
}

// Runden mit Zeitlimit (z. B. Heiße Kartoffel): Ist die Zeit um, wird ausgewertet.
// Der Gastgeber ruft das über einen Timer auf (siehe netz/gastgeber.js).
export function zeitPruefen(zustand, jetzt) {
  const runde = zustand.runde;
  if (zustand.phase !== 'runde' || !runde || runde.ergebnis || !runde.endetUm) return;
  if (jetzt >= runde.endetUm) abschliessen(zustand);
}

// Gastgeber: "Weiter" nach dem Ergebnis.
export function weiter(zustand) {
  if (zustand.phase === 'runde' && zustand.runde?.ergebnis) naechsteRunde(zustand);
}

// Jemand ist gegangen oder zurückgekommen: vielleicht warten wir jetzt auf niemanden mehr.
export function nachVerbindungsAenderung(zustand) {
  if (zustand.phase === 'erklaerung') pruefeVerstanden(zustand);
  if (zustand.phase === 'runde') pruefeFertig(zustand);
}

// ---------- Sicht ----------

// Baut die Sicht für EINEN Spieler: alles, was sein Handy zum Anzeigen braucht,
// aber nichts Geheimes (z. B. fremde Stimmen oder wer der Lügner ist).
export function baueSicht(zustand, spielerId) {
  const runde = zustand.runde;
  return {
    raum: zustand.raum,
    phase: zustand.phase,
    ich: spielerId,
    gastgeberId: zustand.gastgeberId,
    istGastgeber: spielerId === zustand.gastgeberId,
    // farbe: Platz in der Liste → die ersten 6 Spieler haben garantiert verschiedene Farben
    spieler: zustand.spieler.map(({ id, name, verbunden, getraenk, punkte, schlucke, verstanden }, platz) => ({ id, name, verbunden, getraenk, punkte, schlucke, verstanden, farbe: platz % 6 })),
    auswahl: zustand.auswahl,
    verfuegbar: verfuegbareSpiele(zustand),
    rundeNr: zustand.rundeNr,
    rundenGesamt: zustand.plan.length,
    regel: zustand.regel,
    erklaerTyp: zustand.erklaerTyp,
    runde: runde
      ? { typ: runde.typ, abgeschlossen: Boolean(runde.ergebnis), ...rundenTyp(runde.typ).sichtFuer(runde, spielerId) }
      : null,
  };
}
