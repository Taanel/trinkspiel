// Alle Nachrichten, die zwischen den Handys hin- und hergeschickt werden.
//
// So läuft die Verbindung (PeerJS / WebRTC):
//   - Das Gastgeber-Handy meldet sich beim kostenlosen PeerJS-Vermittler unter
//     dem Namen "schluckauf-<RAUMCODE>" an.
//   - Mitspieler verbinden sich mit diesem Namen. Danach reden die Handys DIREKT
//     miteinander, der Vermittler hilft nur beim Kennenlernen.
//
// Jede Nachricht ist ein Objekt mit dem Feld "typ" und weiteren Daten.

export const PEER_PREFIX = 'schluckauf-';

// Mitspieler → Gastgeber
export const HALLO = 'hallo'; // { typ, id, name }        "Ich bin da"
export const AKTION = 'aktion'; // { typ, art, wert }     "Ich habe etwas getippt" (siehe AKTIONEN)

// Gastgeber → Mitspieler
export const SICHT = 'sicht'; // { typ, sicht }           "So sieht das Spiel für dich gerade aus"
export const ABGELEHNT = 'abgelehnt'; // { typ, grund }  z. B. 'voll' oder 'entfernt'

// Arten von Aktionen. Die mit "nurGastgeber" darf nur der Gastgeber ausführen.
export const AKTIONEN = {
  eingabe: { nurGastgeber: false }, // Eingabe in der Runde (Stimme, Antwort, Zahl)
  verstanden: { nurGastgeber: false }, // "Verstanden" auf dem Erklär-Bildschirm
  getraenk: { nurGastgeber: false }, // Bier, Mix oder Shot wählen
  spielWaehlen: { nurGastgeber: true },
  rundenAnzahl: { nurGastgeber: true },
  starten: { nurGastgeber: true },
  weiter: { nurGastgeber: true },
  erzwingen: { nurGastgeber: true }, // "Nicht mehr warten"
  menue: { nurGastgeber: true }, // zurück zum Spiele-Menü
  entfernen: { nurGastgeber: true }, // Spieler aus der Liste nehmen
};
