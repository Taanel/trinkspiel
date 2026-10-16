// Der Spielzustand: EIN Objekt, das alles über das laufende Spiel weiß.
// Er existiert nur auf dem Gastgeber-Handy. Die Mitspieler bekommen davon nur
// ihre eigene "Sicht" (siehe baueSicht in ablauf.js).
//
// Der Zustand enthält nur einfache Daten (Texte, Zahlen, Listen, Objekte),
// damit man ihn speichern und nach einem Neuladen wiederherstellen kann.

import { MIX_ID } from '../runden/index.js';

export const MAX_SPIELER = 12;
export const MAX_NAME = 16;
export const RUNDEN_AUSWAHL = [15, 25, 40];

export function neuerZustand(raum, gastgeber) {
  const zustand = {
    raum, // Raum-Code, z. B. "KXPT"
    gastgeberId: gastgeber.id,
    // Phasen: 'lobby' (Spiele-Menü) → 'erklaerung' → 'runde' → … → 'ende'
    phase: 'lobby',
    spieler: [],
    auswahl: { spiel: MIX_ID, rundenAnzahl: RUNDEN_AUSWAHL[1] },
    plan: [], // Liste der Runden-Typen dieses Spiels, z. B. ['mehrheit', 'luegner', …]
    rundeNr: 0, // 1 = erste Runde
    runde: null, // die aktuelle Runde (Inhalt hängt vom Runden-Typ ab)
    erklaerTyp: null, // welcher Runden-Typ gerade erklärt wird
    bekannteTypen: [], // diese Typen wurden in diesem Spiel schon erklärt
    regel: null, // id der aktuell gültigen Regel-Karte
    benutzt: {}, // schon gestellte Fragen pro Typ, damit sich nichts wiederholt
  };
  spielerBeitreten(zustand, gastgeber);
  return zustand;
}

// Neuer Spieler kommt dazu, oder ein bekannter Spieler kommt zurück
// (z. B. nach Neuladen der Seite: gleiche id → gleicher Platz, Schlucke bleiben).
// Gibt false zurück, wenn der Raum voll ist.
export function spielerBeitreten(zustand, { id, name }) {
  const sauberName = String(name ?? '').trim().slice(0, MAX_NAME) || '???';
  const bekannt = zustand.spieler.find((s) => s.id === id);
  if (bekannt) {
    bekannt.name = sauberName;
    bekannt.verbunden = true;
    return true;
  }
  if (zustand.spieler.length >= MAX_SPIELER) return false;
  zustand.spieler.push({
    id,
    name: sauberName,
    verbunden: true,
    getraenk: null, // 'bier' | 'mix' | 'shot', wählt jeder auf dem Erklär-Bildschirm
    punkte: 0, // für die Rangliste (unabhängig vom Getränk)
    schlucke: 0, // was wirklich getrunken wurde, im eigenen Getränk
    verstanden: false,
  });
  return true;
}

export function spielerGetrennt(zustand, id) {
  const spieler = zustand.spieler.find((s) => s.id === id);
  if (spieler) spieler.verbunden = false;
}

// Der Gastgeber wirft jemanden aus der Liste (z. B. wer gegangen ist).
export function spielerEntfernen(zustand, id) {
  if (id === zustand.gastgeberId) return;
  zustand.spieler = zustand.spieler.filter((s) => s.id !== id);
}

export function aktiveSpieler(zustand) {
  return zustand.spieler.filter((s) => s.verbunden);
}
