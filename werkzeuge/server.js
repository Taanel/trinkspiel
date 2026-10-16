// Kleiner Server nur zum Testen auf dem eigenen Rechner: "npm run dev".
// Nötig, weil Browser JavaScript-Module (import …) nicht direkt aus einer Datei laden.
// Im Internet übernimmt GitHub Pages diese Aufgabe.
//
// Tipp: Die Adresse mit deiner WLAN-IP (wird unten angezeigt) auf dem Handy öffnen,
// dann kannst du mit Handy und Rechner gleichzeitig testen.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 8080;

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (anfrage, antwort) => {
  let pfad = decodeURIComponent(new URL(anfrage.url, 'http://x').pathname);
  if (pfad.endsWith('/')) pfad += 'index.html';
  const datei = normalize(join(WURZEL, pfad));
  // Sicherheit: nur Dateien aus dem Projektordner ausliefern
  if (!datei.startsWith(WURZEL)) {
    antwort.writeHead(403).end();
    return;
  }
  try {
    const inhalt = await readFile(datei);
    antwort.writeHead(200, { 'Content-Type': TYPEN[extname(datei)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    antwort.end(inhalt);
  } catch {
    antwort.writeHead(404).end('Nicht gefunden');
  }
}).listen(PORT, () => {
  console.log(`Läuft auf http://localhost:${PORT}`);
  for (const liste of Object.values(networkInterfaces())) {
    for (const netz of liste ?? []) {
      if (netz.family === 'IPv4' && !netz.internal) console.log(`Im WLAN:  http://${netz.address}:${PORT}`);
    }
  }
});
