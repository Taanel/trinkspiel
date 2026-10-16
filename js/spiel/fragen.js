// Lädt die Fragen aus dem Ordner fragen/ und hält sie bereit.
//
// Jede Datei in fragen/ ist eine Liste von Einträgen. Jeder Eintrag hat eine
// eindeutige "id" und die Texte in allen Sprachen ("de", "en", "vi").
// Das Spiel verschickt über das Netz nur die id, jedes Handy holt sich den
// Text dann hier in seiner eigenen Sprache.

let alleFragen = {};

// Im Browser: alle Dateien per fetch laden.
// "dateien" ist z. B. { mehrheit: 'mehrheit.json', ... } (kommt aus runden/index.js).
export async function ladeFragen(dateien) {
  const geladen = {};
  for (const [typ, datei] of Object.entries(dateien)) {
    const antwort = await fetch(`fragen/${datei}`);
    if (!antwort.ok) throw new Error(`Fragen-Datei fehlt: fragen/${datei}`);
    geladen[typ] = await antwort.json();
  }
  alleFragen = geladen;
}

// Für Tests: Fragen direkt setzen, ohne fetch.
export function setzeFragen(fragen) {
  alleFragen = fragen;
}

// Alle Einträge eines Runden-Typs, z. B. fragenFuer('mehrheit').
export function fragenFuer(typ) {
  return alleFragen[typ] ?? [];
}

// Einen Eintrag über seine id finden.
export function frageNachId(typ, id) {
  return fragenFuer(typ).find((f) => f.id === id);
}
