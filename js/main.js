// Einstieg: Hier beginnt alles.
//
// main.js verbindet die Teile:
//   - lädt die Fragen
//   - zeigt die Startseite
//   - startet als Gastgeber (netz/gastgeber.js) oder Mitspieler (netz/mitspieler.js)
//   - zeichnet nach jeder Änderung den Bildschirm neu (ui/bildschirme.js)

import { ladeFragen } from './spiel/fragen.js';
import { fragenDateien } from './runden/index.js';
import { neueId } from './spiel/zufall.js';
import { MAX_NAME } from './spiel/zustand.js';
import { starteGastgeber, gespeicherterRaum, vergissRaum } from './netz/gastgeber.js';
import { trittBei } from './netz/mitspieler.js';
import { setzeSprache, sprache, t } from './sprache/index.js';
import { zeichneApp, bildschirmSchluessel } from './ui/bildschirme.js';
import { ziehung } from './ui/animationen.js';
import { speicherLesen, speicherSchreiben, vibriere } from './ui/helfer.js';

const ICH_SPEICHER = 'trinkspiel-ich-v1';
const wurzel = document.getElementById('app');

// Wer bin ich? (bleibt im Browser gespeichert, damit man nach Neuladen derselbe Spieler ist)
const ich = speicherLesen(ICH_SPEICHER) ?? { id: neueId(), name: '' };

// Alles, was die Bildschirme zum Zeichnen brauchen.
const app = {
  sicht: null,
  status: null,
  verbunden: false, // true, sobald wir Gastgeber oder Mitspieler sind
  hilfeOffen: false,
  einladungsLink: '',
  start: {
    raumAusLink: raumAusAdresse(),
    fortsetzenRaum: gespeicherterRaum()?.raum ?? null,
    name: ich.name,
    fehler: null,
  },
  tun: {}, // wird unten gefüllt
};

let verbindung = null; // Gastgeber- oder Mitspieler-Objekt aus netz/

// ---------- Hilfsfunktionen ----------

function raumAusAdresse() {
  const code = new URLSearchParams(location.search).get('raum');
  return code && /^[A-Z]{4}$/i.test(code) ? code.toUpperCase() : null;
}

function setzeAdresse(raum) {
  const adresse = new URL(location.href);
  if (raum) adresse.searchParams.set('raum', raum);
  else adresse.searchParams.delete('raum');
  history.replaceState(null, '', adresse);
}

function linkFuer(raum) {
  const adresse = new URL(location.href);
  adresse.search = `?raum=${raum}`;
  adresse.hash = '';
  return adresse.toString();
}

// Prüft den Namen. Gibt false zurück und zeigt einen Fehler, wenn er fehlt.
function nameOk(name) {
  app.start.name = name;
  if (!name) {
    app.start.fehler = 'name';
    zeichne();
    document.getElementById('name')?.focus();
    return false;
  }
  ich.name = name.slice(0, MAX_NAME);
  speicherSchreiben(ICH_SPEICHER, ich);
  app.start.fehler = null;
  return true;
}

// Wird bei jeder neuen Sicht vom Gastgeber aufgerufen.
function neueSicht(sicht) {
  const vorher = app.sicht;
  app.sicht = sicht;
  if (sicht.raum) app.einladungsLink = linkFuer(sicht.raum);
  if (sicht.phase !== 'runde') app.hilfeOffen = false;
  // Vibrieren, wenn ich in einer frisch aufgelösten Runde trinken muss.
  const ichTrinke = sicht.runde?.ergebnis?.schlucke?.[sicht.ich] > 0;
  if (ichTrinke && !vorher?.runde?.abgeschlossen) vibriere();
  zeichne();
}

function neuerStatus(status) {
  app.status = status;
  zeichne();
}

// ---------- Was die Knöpfe tun ----------

app.tun = {
  erstellen(name) {
    if (!nameOk(name)) return;
    vergissRaum();
    verbindung = starteGastgeber({ ich, fortsetzen: null, beiSicht: neueSicht, beiStatus: neuerStatus });
    app.verbunden = true;
    zeichne();
  },

  fortsetzen(name) {
    if (!nameOk(name)) return;
    verbindung = starteGastgeber({ ich, fortsetzen: gespeicherterRaum(), beiSicht: neueSicht, beiStatus: neuerStatus });
    app.verbunden = true;
    zeichne();
  },

  beitreten(name, code) {
    if (!nameOk(name)) return;
    const raum = String(code ?? '').trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(raum)) {
      app.start.fehler = 'code';
      zeichne();
      document.getElementById('code')?.focus();
      return;
    }
    setzeAdresse(raum);
    app.einladungsLink = linkFuer(raum);
    verbindung = trittBei({ raum, ich, beiSicht: neueSicht, beiStatus: neuerStatus });
    app.verbunden = true;
    zeichne();
  },

  verlassen() {
    const warGastgeber = app.sicht?.istGastgeber;
    if (warGastgeber && !confirm(t('lobby.verlassenFrage'))) return;
    verbindung?.beenden();
    verbindung = null;
    Object.assign(app, { sicht: null, status: null, verbunden: false, hilfeOffen: false });
    app.start.raumAusLink = null;
    app.start.fortsetzenRaum = gespeicherterRaum()?.raum ?? null;
    setzeAdresse(null);
    zeichne();
  },

  linkVergessen() {
    app.start.raumAusLink = null;
    setzeAdresse(null);
    zeichne();
  },

  aktion(art, wert) {
    verbindung?.aktion(art, wert);
  },

  spracheWechseln(code) {
    setzeSprache(code);
    zeichne();
  },

  hilfe() {
    app.hilfeOffen = !app.hilfeOffen;
    zeichne();
  },

  async teilen() {
    const link = app.einladungsLink;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Một hai ba dô!', text: t('lobby.teilenText'), url: link });
      } else {
        await navigator.clipboard.writeText(link);
        alert(t('lobby.kopiert'));
      }
    } catch {
      // Teilen abgebrochen: nichts tun
    }
  },
};

// ---------- Zeichnen ----------

let letzterSchluessel = null;

// Baut den Bildschirm neu. Dabei bleiben getippte Texte und der Fokus erhalten,
// und Animationen laufen nur für Dinge, die wirklich neu sind.
function zeichne() {
  // 1. Merken, was der Nutzer gerade tippt
  const fokusId = document.activeElement?.id || null;
  const werte = {};
  wurzel.querySelectorAll('input[id]').forEach((feld) => (werte[feld.id] = feld.value));
  const auswahl = document.activeElement?.selectionStart ?? null;
  const schonDa = new Set([...wurzel.querySelectorAll('[data-merk]')].map((e) => e.dataset.merk));

  // 2. Neu bauen
  const schluessel = bildschirmSchluessel(app);
  const neu = zeichneApp(app);
  const istNeuerBildschirm = schluessel !== letzterSchluessel;
  if (istNeuerBildschirm) neu.classList.add('eintritt');
  neu.querySelectorAll('[data-merk]').forEach((e) => {
    if (schonDa.has(e.dataset.merk)) e.classList.add('schon-da');
  });
  wurzel.replaceChildren(neu);

  // 3. Getippte Texte und Fokus zurückholen
  for (const [id, wert] of Object.entries(werte)) {
    const feld = document.getElementById(id);
    if (feld && !feld.value) feld.value = wert;
  }
  const fokus = fokusId && document.getElementById(fokusId);
  if (fokus) {
    fokus.focus({ preventScroll: true });
    if (auswahl !== null && fokus.setSelectionRange && fokus.type === 'text') fokus.setSelectionRange(auswahl, auswahl);
  }

  // 4. Bei einem neuen Bildschirm: nach oben scrollen und Ziehung abspielen
  if (istNeuerBildschirm) {
    window.scrollTo(0, 0);
    ziehung(neu);
  }
  letzterSchluessel = schluessel;
}

// ---------- Start ----------

async function los() {
  setzeSprache(sprache());
  try {
    await ladeFragen(fragenDateien());
  } catch (fehler) {
    console.error(fehler);
    wurzel.textContent = t('verbindung.fragenFehlen');
    return;
  }
  // Mit Einladungslink und bekanntem Namen (z. B. nach Neuladen): direkt wieder beitreten.
  if (app.start.raumAusLink && ich.name) {
    app.tun.beitreten(ich.name, app.start.raumAusLink);
    return;
  }
  zeichne();
}

los();
