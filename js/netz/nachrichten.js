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
export const PING = 'ping'; // { typ }                    "Ich bin noch da" (alle paar Sekunden)

// Gastgeber → Mitspieler
export const SICHT = 'sicht'; // { typ, sicht }           "So sieht das Spiel für dich gerade aus"
export const ABGELEHNT = 'abgelehnt'; // { typ, grund }  z. B. 'voll' oder 'entfernt'
export const PONG = 'pong'; // { typ }                    Antwort auf PING: "Ich (Gastgeber) auch"

// Herzschlag: So erkennen beide Seiten "tote" Verbindungen, die PeerJS nie als
// geschlossen meldet (z. B. wenn ein Handy gesperrt wurde).
export const PING_ALLE_MS = 5000; // Mitspieler schickt so oft ein PING
export const MITSPIELER_TIMEOUT_MS = 15000; // so lange ohne PONG → Mitspieler verbindet sich neu
export const GASTGEBER_TIMEOUT_MS = 20000; // so lange ohne Lebenszeichen → Gastgeber zeigt Spieler als "weg"

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
