// Tests für die Verbindung beim Gastgeber, mit einem nachgebauten PeerJS ("Fake").
// Wichtig: Das Fake löst "close" SOFORT innerhalb von close() aus, genau wie das echte
// PeerJS 1.5.4. Genau daran lag der Fehler "Spieler wird als weg angezeigt, spielt aber mit".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import * as N from '../js/netz/nachrichten.js';
import { setzeFragen } from '../js/spiel/fragen.js';
import { fragenDateien } from '../js/runden/index.js';

const fragen = {};
for (const [typ, datei] of Object.entries(fragenDateien())) {
  fragen[typ] = JSON.parse(readFileSync(new URL(`../fragen/${datei}`, import.meta.url), 'utf8'));
}
setzeFragen(fragen);

// Kleiner Ereignis-Sender wie bei PeerJS: on(name, funktion) und emit(name, wert)
class Sender {
  #hoerer = {};
  on(name, funktion) {
    (this.#hoerer[name] ??= []).push(funktion);
  }
  emit(name, wert) {
    for (const funktion of this.#hoerer[name] ?? []) funktion(wert);
  }
}

class FakeVerbindung extends Sender {
  open = true;
  gesendet = [];
  send(nachricht) {
    this.gesendet.push(nachricht);
  }
  close() {
    if (!this.open) return;
    this.open = false;
    this.emit('close'); // sofort, wie PeerJS
  }
  letzteSicht() {
    return this.gesendet.filter((n) => n.typ === N.SICHT).at(-1)?.sicht;
  }
}

class FakePeer extends Sender {
  constructor(id) {
    super();
    this.id = id;
    FakePeer.letzter = this;
  }
  destroy() {}
  reconnect() {}
}

const { starteGastgeber } = await import('../js/netz/gastgeber.js');

function raumMitBen() {
  globalThis.Peer = FakePeer;
  const gastgeber = starteGastgeber({ ich: { id: 'anna', name: 'Anna' }, fortsetzen: null, beiSicht() {}, beiStatus() {} });
  const peer = FakePeer.letzter;
  peer.emit('open');
  const erste = new FakeVerbindung();
  peer.emit('connection', erste);
  erste.emit('data', { typ: N.HALLO, id: 'ben', name: 'Ben' });
  return { gastgeber, peer, erste };
}

const ben = (sicht) => sicht.spieler.find((s) => s.id === 'ben');

test('Netz: Spieler verbindet sich neu, ohne dass die alte Verbindung zu war → bleibt verbunden', () => {
  const { gastgeber, peer, erste } = raumMitBen();
  assert.equal(ben(erste.letzteSicht()).verbunden, true);

  // Ben verbindet sich neu (z. B. WLAN-Wackler), die alte Verbindung ist beim Gastgeber noch offen
  const zweite = new FakeVerbindung();
  peer.emit('connection', zweite);
  zweite.emit('data', { typ: N.HALLO, id: 'ben', name: 'Ben' });

  assert.equal(erste.open, false, 'alte Verbindung wurde geschlossen');
  assert.equal(ben(zweite.letzteSicht()).verbunden, true, 'Ben muss weiter als verbunden gelten');
  gastgeber.beenden();
});

test('Netz: Lebenszeichen heilt einen fälschlich als "weg" markierten Spieler', () => {
  const { gastgeber, peer, erste } = raumMitBen();
  // Simuliert: Gastgeber hat Ben verloren, Bens Verbindung lebt aber
  gastgeber.aktion('entfernen', 'nichts'); // nur um eine Sicht zu erzwingen
  const zweite = new FakeVerbindung();
  peer.emit('connection', zweite);
  zweite.emit('data', { typ: N.HALLO, id: 'ben', name: 'Ben' });
  zweite.emit('data', { typ: N.PING });
  assert.ok(zweite.gesendet.some((n) => n.typ === N.PONG), 'Gastgeber antwortet auf PING');
  assert.equal(ben(zweite.letzteSicht()).verbunden, true);
  assert.equal(erste.open, false);
  gastgeber.beenden();
});
