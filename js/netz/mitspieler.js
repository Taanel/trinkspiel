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
    verbindung?.close();
    verbindung = peer.connect(N.PEER_PREFIX + raum, { reliable: true });

    verbindung.on('open', () => {
      verbindung.send({ typ: N.HALLO, id: ich.id, name: ich.name });
      beiStatus('verbunden');
    });

    verbindung.on('data', (nachricht) => {
      if (nachricht?.typ === N.SICHT) beiSicht(nachricht.sicht);
      if (nachricht?.typ === N.ABGELEHNT) {
        beendet = true;
        beiStatus(nachricht.grund); // 'voll' oder 'entfernt'
      }
    });

    verbindung.on('close', () => {
      if (beendet) return;
      beiStatus('getrennt');
      spaeterNochmal();
    });
  }

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
      peer?.destroy();
    },
  };
}
