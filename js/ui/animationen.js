// Animationen.
//
// Das Besondere an diesem Spiel ist die "Ziehung": Wenn eine Runde aufgelöst wird,
// rollen die Zahlen (Stimmen, Schlucke) kurz durch wie bei einer Lotterie-Ziehung
// und bleiben dann stehen. Die Zeilen selbst bewegen sich nicht, nur die Ziffern.
//
// Wer in den Handy-Einstellungen "Bewegung reduzieren" eingeschaltet hat,
// sieht sofort das Endergebnis.

export function wenigerBewegung() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Lässt alle Ziffern in Elementen mit data-roll durchrollen.
// Zeile für Zeile etwas später (Abstand ABSTAND_MS), damit es wie eine Ziehung wirkt.
const DAUER_MS = 650;
const ABSTAND_MS = 90;
const MAX_VERZOEGERUNG_MS = 450; // auch bei langen Listen nicht ewig warten

export function ziehung(wurzel) {
  if (wenigerBewegung()) return;
  wurzel.querySelectorAll('[data-roll]').forEach((element, nummer) => {
    const ziel = element.textContent;
    // Nur Ziffern tauschen, Wörter wie "Schlucke" bleiben stehen.
    const zufall = () => ziel.replace(/\d/g, () => Math.floor(Math.random() * 10));
    const start = performance.now() + Math.min(nummer * ABSTAND_MS, MAX_VERZOEGERUNG_MS);
    element.classList.add('rollt');

    function schritt(jetzt) {
      if (!element.isConnected) return; // Bildschirm wurde inzwischen ersetzt
      if (jetzt < start + DAUER_MS) {
        if (jetzt >= start) element.textContent = zufall();
        requestAnimationFrame(schritt);
      } else {
        element.textContent = ziel;
        element.classList.remove('rollt');
        element.classList.add('steht');
      }
    }
    requestAnimationFrame(schritt);
  });
}
