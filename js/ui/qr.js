// QR-Code für den Einladungslink.
// "qrcode" kommt aus der Bibliothek qrcode-generator, die index.html lädt.
// Wir zeichnen den Code selbst als SVG, damit er die Farben des Spiels bekommt.

const SVG_NS = 'http://www.w3.org/2000/svg';

export function qrSvg(text) {
  const qr = qrcode(0, 'M'); // 0 = Größe automatisch, 'M' = mittlere Fehlerkorrektur
  qr.addData(text);
  qr.make();
  const anzahl = qr.getModuleCount();
  const rand = 2;
  const groesse = anzahl + rand * 2;

  // Alle dunklen Felder als EIN Pfad: schneller als hunderte einzelne Rechtecke.
  let pfad = '';
  for (let y = 0; y < anzahl; y++) {
    for (let x = 0; x < anzahl; x++) {
      if (qr.isDark(y, x)) pfad += `M${x + rand} ${y + rand}h1v1h-1z`;
    }
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${groesse} ${groesse}`);
  svg.setAttribute('class', 'qr');
  svg.setAttribute('role', 'img');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const flaeche = document.createElementNS(SVG_NS, 'path');
  flaeche.setAttribute('d', pfad);
  svg.append(flaeche);
  return svg;
}
