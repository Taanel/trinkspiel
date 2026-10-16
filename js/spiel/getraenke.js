// Getränke und Umrechnung.
//
// Die Spielregeln vergeben PUNKTE (z. B. "Minderheit bekommt 2").
// Wie viel jemand wirklich trinkt, hängt davon ab, was er im Glas hat:
// Ein Schluck vom Shot ist viel stärker als ein Schluck Bier.
//
// faktor: Wie viele Schlucke gibt es pro Punkt?
//   Bier 1    → 3 Punkte = 3 Schlucke Bier
//   Mix  2/3  → 3 Punkte = 2 Schlucke Mix
//   Shot 1/3  → 3 Punkte = 1 Schluck vom Shot
// Es wird aufgerundet, und wer trinken muss, trinkt immer mindestens 1 Schluck.
// HIER kannst du die Werte ändern, wenn sie euch zu viel oder zu wenig sind.

export const GETRAENKE = {
  bier: { faktor: 1 },
  mix: { faktor: 2 / 3 },
  shot: { faktor: 1 / 3 },
};

export const STANDARD_GETRAENK = 'bier';

export function istGetraenk(name) {
  return Object.hasOwn(GETRAENKE, name);
}

// Punkte → Schlucke für ein Getränk.
export function umrechnen(punkte, getraenk) {
  if (punkte <= 0) return 0;
  const faktor = GETRAENKE[getraenk]?.faktor ?? GETRAENKE[STANDARD_GETRAENK].faktor;
  // Kleine Toleranz, damit z. B. 3 × 2/3 nicht durch Rundungsfehler zu 3 statt 2 wird
  return Math.max(1, Math.ceil(punkte * faktor - 1e-9));
}
