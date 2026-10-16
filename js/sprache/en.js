// English texts. Same keys as de.js and vi.js!

export default {
  schlucke: ({ n, g }) => {
    const wort = n === 1 ? 'sip' : 'sips';
    return { bier: `${n} ${wort} of beer`, mix: `${n} ${wort} of your mix`, shot: `${n} ${wort} of your shot` }[g] ?? `${n} ${wort}`;
  },

  allgemein: {
    du: 'you',
    oder: 'or',
    senden: 'Send',
    sprache: 'Language',
    zurStartseite: 'Back to start',
    abbrechen: 'Cancel',
    schliessen: 'Close',
  },

  start: {
    unterzeile: 'The drinking game where everyone votes in secret on their own phone.',
    deinName: 'Your name',
    fehler: {
      name: 'Please enter your name first.',
      code: 'The room code has 4 letters, e.g. KXPT.',
    },
    eingeladen: 'You’re invited to room',
    beitreten: 'Join',
    andererRaum: 'Choose another room',
    raumCode: 'Room code',
    fortsetzen: 'Continue game',
    erstellen: 'Create a new room',
    oderCode: 'Or join with a room code',
    verantwortung: 'Drink responsibly. A sip can be water, too.',
  },

  verbindung: {
    verbinde: 'Connecting …',
    verbindeText: 'One moment, the phones are finding each other.',
    getrennt: 'Connection lost, reconnecting …',
    nichtGefunden: 'Room not found',
    nichtGefundenText: 'Is the code right? If the host is reloading the page, we’ll reconnect automatically.',
    voll: 'This room is full',
    vollText: 'Up to 12 people can play.',
    entfernt: 'You were removed',
    entferntText: 'The host removed you from the room.',
    fehler: 'No connection',
    fehlerText: 'The connection service can’t be reached. Check your internet and try again.',
    fragenFehlen: 'The questions could not be loaded. Please reload the page.',
  },

  lobby: {
    raum: 'Room',
    raumCode: 'Room code {code}',
    spieler: 'Players',
    gastgeber: 'host',
    offline: 'away',
    entfernen: 'Remove {name}',
    dabei: ({ n }) => (n === 1 ? 'Just you so far. Invite your friends!' : `${n} people in`),
    einladen: 'Invite friends',
    scannen: 'Scan with your phone camera',
    oderCode: 'or enter the code:',
    teilen: 'Share link',
    teilenText: 'Come play! Drinking game “Một hai ba dô”:',
    kopiert: 'Link copied. Send it to the group!',
    spielWaehlen: 'What are we playing?',
    abSpielern: 'needs {n} players',
    runden: 'Rounds',
    rundenText: '{n} rounds',
    starten: 'Start game',
    warteAufGastgeber: '{name} picks the game and starts.',
    verlassen: 'Leave room',
    verlassenFrage: 'Really close the room? The game ends for everyone.',
  },

  getraenk: {
    frage: 'What are you drinking?',
    hinweis: 'All alcoholic. With a mix or a shot you take fewer sips because they are stronger.',
    zuerstWaehlen: 'Pick a drink first',
    bier: 'Beer',
    mix: 'Mix',
    shot: 'Shot',
  },

  erklaerung: {
    verstanden: 'Got it',
    warten: 'Starting soon, the others are still reading.',
  },

  runde: {
    nummer: 'Round {nr} of {gesamt}',
    fertig: '{fertig} of {gesamt} done',
    gewaehlt: 'Picked. Waiting for the others …',
    stimmen: ({ n }) => (n === 1 ? '1 vote' : `${n} votes`),
    werTrinkt: 'Who drinks',
    duTrinkst: 'You drink',
    niemandTrinkt: 'Nobody drinks. Cheers anyway!',
    naechsteRunde: 'You’ll join from the next round.',
    nichtWarten: 'Stop waiting',
    weiter: 'Next round',
    zumErgebnis: 'Final results',
    warteAufGastgeber: '{name} starts the next round in a moment.',
    hilfe: 'Show rules',
    regel: 'Rule:',
  },

  ende: {
    titel: 'Final results',
    gesamt: ({ n }) => `${n} rounds played. Một hai ba dô!`,
    platz: 'Place',
    schlucke: 'Sips',
    nochmal: 'Play again',
    menue: 'Other game',
  },

  spiele: {
    mix: {
      name: 'Party mix',
      kurz: 'All games mixed, cards in between',
    },
    'wer-wuerde-eher': {
      name: 'Most likely to',
      kurz: 'Vote in secret who’s most likely to …',
      schritte: [
        'A question appears, e.g. “Who is most likely to go skinny dipping?”',
        'You secretly tap one person. Nobody sees who you picked.',
        'Whoever gets the most votes drinks one sip per vote.',
      ],
      auftrag: 'Tap the person who fits best.',
    },
    mehrheit: {
      name: 'Majority wins',
      kurz: 'This or that. The minority drinks',
      schritte: [
        'A this-or-that question appears, e.g. “Beach or mountains?”',
        'You secretly pick a side.',
        'The smaller group drinks 2 sips. If it’s a tie, everyone drinks 1.',
      ],
      ausgang: {
        minderheit: 'The minority drinks.',
        gleichstand: 'It’s a tie! Everyone drinks one.',
        einig: 'Everyone agrees. Nobody has to drink.',
      },
    },
    luegner: {
      name: 'The liar',
      kurz: 'One person secretly gets a different question',
      schritte: [
        'Everyone gets the same question, except one person who secretly gets a slightly different one. They don’t know it!',
        'Everyone types a short answer.',
        'Then you see the real question and all answers. Discuss and vote: who had the other question?',
        'Liar caught: they drink 3. Not caught: everyone else drinks 2.',
      ],
      auftragAntworten: 'Answer briefly, a few words or a number.',
      platzhalter: 'Your answer',
      geantwortet: 'Answer sent. Waiting for the others …',
      echteFrageWar: 'The real question was:',
      auftragAbstimmen: 'Talk it over! Then tap the answer that doesn’t fit.',
      luegnerWar: 'The other question went to',
      seineFrage: 'and it was:',
      erwischt: 'Caught! {name} drinks.',
      entkommen: '{name} got away with it. Everyone else drinks.',
    },
    schaetzfrage: {
      name: 'Guess the number',
      kurz: 'Guess a number. Furthest off drinks',
      schritte: [
        'A question with a number as the answer appears.',
        'You secretly type your guess.',
        'Whoever is furthest off drinks 3. Whoever is closest hands out 2 sips.',
      ],
      platzhalter: 'Your guess',
      richtig: 'The answer is',
      verteilen: '{name} was closest and hands out 2 sips.',
    },
    karte: {
      name: 'Cards',
      kurz: 'Never have I ever, dares and rules',
      schritte: [
        'A card appears for everyone at the same time.',
        'Never have I ever …: whoever has done it drinks.',
        'Dare: the named person does it or drinks (3 sips of beer, 2 of a mix or 1 of a shot).',
        'Rule: holds until the next rule. Whoever breaks it drinks.',
      ],
      arten: {
        nie: 'Never have I ever',
        pflicht: 'Dare',
        regel: 'New rule',
      },
      unterzeile: {
        nie: 'Whoever has done it drinks.',
        pflicht: 'Do it, or drink: 3 sips of beer, 2 of your mix or 1 of your shot.',
        regel: 'Holds from now until the next rule. Break it and drink.',
      },
    },
  },
};
