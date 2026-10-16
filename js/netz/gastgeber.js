// Das Gastgeber-Handy: Es erstellt den Raum, nimmt Verbindungen an,
// führt alle Aktionen aus und schickt danach jedem Spieler seine Sicht.
//
// "Peer" kommt aus der PeerJS-Bibliothek, die index.html lädt.

import * as N from './nachrichten.js';
import * as Z from '../spiel/zustand.js';
import * as A from '../spiel/ablauf.js';
import { raumCode } from '../spiel/zufall.js';
import { speicherLesen, speicherSchreiben } from '../ui/helfer.js';

// Der Spielstand wird im Browser gespeichert, damit der Gastgeber die Seite
// neu laden kann, ohne dass das Spiel weg ist.
const SPEICHER = 'trinkspiel-gastgeber-v1';
const SPEICHER_GUELTIG_MS = 6 * 60 * 60 * 1000; // 6 Stunden

// Gibt es einen gespeicherten Raum, den man fortsetzen kann?
export function gespeicherterRaum() {
  const gespeichert = speicherLesen(SPEICHER);
  if (!gespeichert || Date.now() - gespeichert.zeit > SPEICHER_GUELTIG_MS) return null;
  return gespeichert.zustand;
}

export function vergissRaum() {
  speicherSchreiben(SPEICHER, null);
}

// ich:        { id, name } des Gastgebers
// fortsetzen: gespeicherter Zustand oder null
// beiSicht:   Funktion, die die eigene Sicht anzeigt
// beiStatus:  Funktion für Verbindungs-Meldungen ('verbinde', 'bereit', 'fehler')
export function starteGastgeber({ ich, fortsetzen, beiSicht, beiStatus }) {
  const zustand = fortsetzen ?? Z.neuerZustand(raumCode(), ich);
  if (fortsetzen) {
    // Nach dem Neuladen ist erstmal niemand verbunden, außer mir.
    for (const s of zustand.spieler) s.verbunden = s.id === ich.id;
  }
  const verbindungen = new Map(); // spielerId → PeerJS-Verbindung
  let peer = null;
  let versuche = 0;

  function anmelden() {
    beiStatus('verbinde');
    peer = new Peer(N.PEER_PREFIX + zustand.raum);

    peer.on('open', () => {
      versuche = 0;
      beiStatus('bereit');
      alleBenachrichtigen();
    });

    peer.on('connection', neueVerbindung);

    // Kurz Verbindung zum Vermittler verloren (z. B. WLAN-Wechsel): neu anmelden.
    peer.on('disconnected', () => {
      if (!peer.destroyed) peer.reconnect();
    });

    peer.on('error', (fehler) => {
      if (fehler.type === 'unavailable-id') {
        // Der Raum-Name ist noch belegt. Nach einem Neuladen gibt der Vermittler
        // den alten Namen erst nach ein paar Sekunden frei → kurz warten.
        // Bei einem neuen Raum einfach einen anderen Code nehmen.
        peer.destroy();
        versuche += 1;
        if (!fortsetzen || versuche > 10) zustand.raum = raumCode();
        setTimeout(anmelden, fortsetzen ? 3000 : 0);
        return;
      }
      if (fehler.type === 'peer-unavailable') return; // betrifft nur eine einzelne Verbindung
      console.warn('PeerJS-Fehler:', fehler.type, fehler);
      beiStatus('fehler');
    });
  }

  // Ein Mitspieler verbindet sich.
  function neueVerbindung(verbindung) {
    verbindung.on('data', (nachricht) => {
      if (nachricht?.typ === N.HALLO) {
        if (!Z.spielerBeitreten(zustand, { id: nachricht.id, name: nachricht.name })) {
          verbindung.send({ typ: N.ABGELEHNT, grund: 'voll' });
          return;
        }
        // Gleicher Spieler mit neuer Verbindung (z. B. neu geladen): alte schließen.
        const alt = verbindungen.get(nachricht.id);
        if (alt && alt !== verbindung) alt.close();
        verbindung.spielerId = nachricht.id;
        verbindungen.set(nachricht.id, verbindung);
        A.nachVerbindungsAenderung(zustand);
        alleBenachrichtigen();
      } else if (nachricht?.typ === N.AKTION && verbindung.spielerId) {
        fuehreAus(verbindung.spielerId, nachricht.art, nachricht.wert);
      }
    });

    verbindung.on('close', () => {
      const id = verbindung.spielerId;
      if (!id || verbindungen.get(id) !== verbindung) return;
      verbindungen.delete(id);
      Z.spielerGetrennt(zustand, id);
      A.nachVerbindungsAenderung(zustand);
      alleBenachrichtigen();
    });
  }

  // Führt eine Aktion aus – egal ob vom Gastgeber selbst oder von einem Mitspieler.
  function fuehreAus(spielerId, art, wert) {
    const regel = N.AKTIONEN[art];
    if (!regel) return;
    if (regel.nurGastgeber && spielerId !== zustand.gastgeberId) return; // nicht erlaubt

    switch (art) {
      case 'eingabe': A.rundenEingabe(zustand, spielerId, wert); break;
      case 'verstanden': A.verstanden(zustand, spielerId); break;
      case 'spielWaehlen': A.waehleSpiel(zustand, wert); break;
      case 'rundenAnzahl': A.setzeRundenAnzahl(zustand, wert); break;
      case 'starten': A.spielStarten(zustand); break;
      case 'weiter': A.weiter(zustand); break;
      case 'erzwingen': A.erzwingen(zustand); break;
      case 'menue': A.zurueckZumMenue(zustand); break;
      case 'entfernen': {
        const verbindung = verbindungen.get(wert);
        verbindung?.send({ typ: N.ABGELEHNT, grund: 'entfernt' });
        verbindungen.delete(wert);
        setTimeout(() => verbindung?.close(), 300);
        Z.spielerEntfernen(zustand, wert);
        A.nachVerbindungsAenderung(zustand);
        break;
      }
    }
    alleBenachrichtigen();
  }

  // Nach jeder Änderung: speichern, eigene Sicht zeigen, allen anderen ihre Sicht schicken.
  function alleBenachrichtigen() {
    speicherSchreiben(SPEICHER, { zeit: Date.now(), zustand });
    beiSicht(A.baueSicht(zustand, ich.id));
    for (const [id, verbindung] of verbindungen) {
      if (verbindung.open) verbindung.send({ typ: N.SICHT, sicht: A.baueSicht(zustand, id) });
    }
  }

  anmelden();
  beiSicht(A.baueSicht(zustand, ich.id));

  return {
    aktion: (art, wert) => fuehreAus(ich.id, art, wert),
    raum: () => zustand.raum,
    beenden() {
      vergissRaum();
      peer?.destroy();
    },
  };
}
