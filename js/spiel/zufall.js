// Kleine Zufalls-Helfer, die überall im Spiel gebraucht werden.

// Gibt eine NEUE, zufällig gemischte Kopie der Liste zurück (Fisher-Yates-Verfahren).
// Die Original-Liste bleibt unverändert.
export function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// Ein zufälliges Element aus einer Liste.
export function zufaelligesElement(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

// Raum-Code aus 4 Großbuchstaben. Buchstaben, die man leicht verwechselt
// (I/L/O/0/1), sind absichtlich weggelassen.
const BUCHSTABEN = 'ABCDEFGHJKMNPQRSTUVWXYZ';
export function raumCode() {
  let code = '';
  for (let i = 0; i < 4; i++) code += zufaelligesElement([...BUCHSTABEN]);
  return code;
}

// Zufällige ID für einen Spieler, z. B. "s-k3f9x2a1".
export function neueId() {
  return 's-' + Math.random().toString(36).slice(2, 10);
}
