// Kleine Helfer, damit wir HTML-Elemente bequem in JavaScript bauen können.

// el('button', { class: 'knopf', onclick: () => ... }, 'Text')
// - erster Wert: Name des HTML-Elements
// - zweiter Wert: Eigenschaften (class, text, on..., data-..., andere Attribute)
// - danach: Kinder (Texte oder andere Elemente). null/false werden übersprungen,
//   so kann man schreiben: bedingung && el(...)
export function el(tag, eigenschaften = {}, ...kinder) {
  const element = document.createElement(tag);
  for (const [name, wert] of Object.entries(eigenschaften)) {
    if (wert === null || wert === undefined || wert === false) continue;
    if (name === 'class') element.className = wert;
    else if (name === 'text') element.textContent = wert;
    else if (name === 'style' && typeof wert === 'object') {
      // setProperty, damit auch CSS-Variablen wie '--i' funktionieren
      for (const [eigenschaft, w] of Object.entries(wert)) element.style.setProperty(eigenschaft, w);
    }
    else if (name.startsWith('on')) element.addEventListener(name.slice(2), wert);
    else if (name in element && typeof wert !== 'string') element[name] = wert;
    else element.setAttribute(name, wert === true ? '' : wert);
  }
  for (const kind of kinder.flat(Infinity)) {
    if (kind === null || kind === undefined || kind === false) continue;
    element.append(kind instanceof Node ? kind : String(kind));
  }
  return element;
}

// Kleine gezeichnete Icons (SVG), alle mit derselben Strichstärke.
const IKONEN = {
  frage: 'M9 9a3 3 0 1 1 4.2 2.75c-.75.35-1.2 1.05-1.2 1.85V14.5M12 18h.01',
  kreuz: 'M7 7l10 10M17 7L7 17',
  // Getränke
  bier: 'M6 7h9v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM15 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2M6 7c0-2 2-3 3.5-2C10 3 13 3 14 4.5 15 4 16 5.5 15 7M9.5 11v6M12.5 11v6',
  mix: 'M4 4h16l-8 9zM12 13v7M8 20h8M14 2l3-1M16.5 1.5 14 7',
  shot: 'M7 5h10l-1.6 15H8.6zM7.6 10h8.8',
  // Heiße Kartoffel
  bombe: 'M11 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM14.5 8.5l2-2M16.5 6.5c.5-1.5 2-2.5 3.5-2M20 2.5v1M21.5 4h-1M7.5 13a3.5 3.5 0 0 1 3.5-3.5',
};
export function ikon(name) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'ikon');
  svg.setAttribute('aria-hidden', 'true');
  const pfad = document.createElementNS(ns, 'path');
  pfad.setAttribute('d', IKONEN[name]);
  svg.append(pfad);
  return svg;
}

// Handy kurz vibrieren lassen (geht nicht auf iPhones, schadet aber nicht).
export function vibriere(muster = [80, 60, 80]) {
  try {
    navigator.vibrate?.(muster);
  } catch {
    // ignorieren
  }
}

// Sicherer Zugriff auf localStorage: in privaten Fenstern kann er Fehler werfen.
export function speicherLesen(schluessel) {
  try {
    const wert = localStorage.getItem(schluessel);
    return wert ? JSON.parse(wert) : null;
  } catch {
    return null;
  }
}

export function speicherSchreiben(schluessel, wert) {
  try {
    if (wert === null) localStorage.removeItem(schluessel);
    else localStorage.setItem(schluessel, JSON.stringify(wert));
  } catch {
    // ignorieren: dann wird eben nichts gespeichert
  }
}
