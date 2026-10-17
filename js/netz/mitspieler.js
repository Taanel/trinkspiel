// Ein Mitspieler-Handy: verbindet sich mit dem Gastgeber, schickt Aktionen
// und zeigt an, was der Gastgeber zurückschickt.
// Bricht die Verbindung ab, wird es automatisch immer wieder versucht.
//
// "Peer" kommt aus der PeerJS-Bibliothek, die index.html lädt.

import * as N from './nachrichten.js';

const NEUER_VERSUCH_MS = 2500;

// raum:      Raum-Code, z. B. "KXPT"
// ich:       { id, name }
// beiSicht:  Funktion, die die Sicht anzeigt
// beiStatus: 'verbinde' | 'verbunden' | 'getrennt' | 'nichtGefunden' | 'voll' | 'entfernt' | 'fehler'
export function trittBei({ raum, ich, beiSicht, beiStatus }) {
  let peer = null;
  let verbindung = null;
  let zeitgeber = null;
  let beendet = false;
  let letzterPong = 0; // wann der Gastgeber zuletzt geantwortet hat
  let versuchSeit = 0; // wann der letzte Verbindungsversuch gestartet wurde

  function spaeterNochmal() {
    if (beendet || zeitgeber) return;
    zeitgeber = setTimeout(() => {
      zeitgeber = null;
      verbinden();
    }, NEUER_VERSUCH_MS);
  }

  function verbinden() {
    if (beendet) return;
    if (!peer || peer.destroyed) return starten();
    if (peer.disconnected) {
      peer.reconnect();
      return;
    }
    // Alte Verbindung erst "vergessen", dann schließen: Ihr close-Ereignis kommt sofort
    // und soll keinen weiteren Verbindungsversuch auslösen.
    const alt = verbindung;
    verbindung = null;
    alt?.close();
    versuchSeit = Date.now();
    // Jeder Handler gehört fest zu SEINER Verbindung ("diese"). Alte, ersetzte
    // Verbindungen werden ignoriert, damit sie nichts durcheinanderbringen.
    const diese = peer.connect(N.PEER_PREFIX + raum, { reliable: true });
    verbindung = diese;

    diese.on('open', () => {
      if (diese !== verbindung) return;
      letzterPong = Date.now();
      diese.send({ typ: N.HALLO, id: ich.id, name: ich.name });
      beiStatus('verbunden');
    });

    diese.on('data', (nachricht) => {
      if (diese !== verbindung) return;
      letzterPong = Date.now(); // jede Nachricht vom Gastgeber zählt als Lebenszeichen
      if (nachricht?.typ === N.SICHT) beiSicht(nachricht.sicht);
      if (nachricht?.typ === N.ABGELEHNT) {
        beendet = true;
        beiStatus(nachricht.grund); // 'voll' oder 'entfernt'
      }
    });

    diese.on('close', () => {
      if (beendet || diese !== verbindung) return;
      beiStatus('getrennt');
      spaeterNochmal();
    });
  }

  // Herzschlag: alle paar Sekunden "Ich bin noch da" schicken.
  // Antwortet der Gastgeber zu lange nicht, ist die Verbindung tot → neu verbinden.
  function herzschlag() {
    if (beendet) return;
    if (verbindung?.open) {
      if (Date.now() - letzterPong > N.MITSPIELER_TIMEOUT_MS) {
        beiStatus('getrennt');
        verbinden();
        return;
      }
      verbindung.send({ typ: N.PING });
    }
  }
  const herzschlagTimer = setInterval(herzschlag, N.PING_ALLE_MS);

  // Kommt man zur Seite zurück (z. B. nach WhatsApp oder Bildschirm-Sperre): sofort prüfen.
  function wiederSichtbar() {
    if (document.visibilityState !== 'visible' || beendet) return;
    if (verbindung?.open) verbindung.send({ typ: N.PING });
    else if (Date.now() - versuchSeit > 4000) verbinden(); // nicht einen laufenden Versuch abbrechen
  }
  document.addEventListener('visibilitychange', wiederSichtbar);

  function starten() {
    beiStatus('verbinde');
    peer = new Peer();
    peer.on('open', verbinden);
    peer.on('disconnected', () => spaeterNochmal());
    peer.on('error', (fehler) => {
      // Raum (noch) nicht da – vielleicht lädt der Gastgeber gerade neu. Weiter versuchen.
      if (fehler.type === 'peer-unavailable') beiStatus('nichtGefunden');
      else {
        console.warn('PeerJS-Fehler:', fehler.type, fehler);
        beiStatus('getrennt');
        if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(fehler.type)) {
          peer.destroy();
        }
      }
      spaeterNochmal();
    });
  }

  starten();

  return {
    aktion(art, wert) {
      if (verbindung?.open) verbindung.send({ typ: N.AKTION, art, wert });
    },
    beenden() {
      beendet = true;
      clearTimeout(zeitgeber);
      clearInterval(herzschlagTimer);
      document.removeEventListener('visibilitychange', wiederSichtbar);
      peer?.destroy();
    },
  };
}
