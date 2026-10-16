# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript (ES modules), no build step, no npm dependencies. Only external code: PeerJS and qrcode-generator from a CDN with pinned versions. Hosted on GitHub Pages (repo `Taanel/trinkspiel`).

## Users

A group of 5–6 friends (adults) at a party or a night in, each holding their own phone. One person hosts the room; the others join by scanning a QR code or opening a shared link. Some players read German, some English, some Vietnamese; each picks their own language. The owner is a beginner programmer who wants to extend the code later.

## Product Purpose

"Một hai ba dô" is a drinking game where secret input on your own phone is the point: anonymous votes, hidden answers, a hidden liar. The group still plays together around one table; phones are controllers, the conversation happens in the room. Success: the group plays a whole session without explanation from the host, laughs at the reveals, and comes back to it next time.

## Positioning

Every player uses their own phone in their own language in the same round, with no account and no app install. The secret-input rounds (anonymous vote, liar with a different question) only work because each player has a private screen.

## Operating Context

- Used at night, often in dim rooms, often with a drink in one hand: one-thumb operation, large tap targets, readable at arm's length.
- Phones are passed around rarely; each screen is private, so a glance must reveal "what do I do now".
- The host's phone is the game server (PeerJS/WebRTC). If the host closes the page, the game pauses until they reopen it.
- Games: Wer würde eher (anonymous vote), Mehrheit gewinnt (A/B), Der Lügner (imposter), Schätzfrage (number guess), Karten (Never have I ever, dares, rules), and a Party-Mix of all.
- Each game is explained in 3–4 short steps before it starts.

## Capabilities and Constraints

- UI languages: German, English, Vietnamese. Typefaces must render Vietnamese diacritics.
- Questions live in JSON files, each entry with all three languages.
- Rounds count "Schlucke" (sips); end screen ranks who drank most.
- Tone: spicy. Questions may be suggestive and cheeky, for close friends. Never explicit, degrading, or targeting real identity traits.

## Brand Commitments

- Name: "Một hai ba dô" (Vietnamese toast: "one, two, three, cheers!").
- Responsible-drinking note on the start screen, in all three languages: sips may be water.

## Product Principles

1. The phone is a controller, the table is the stage: show only what this player needs right now.
2. Secrets stay secret: no screen or network message reveals votes or the liar before the reveal.
3. Nobody needs to read a manual: every game explains itself in a few steps.
4. Every language is first-class, not a translation afterthought.
5. Code stays readable for a beginner who will extend it.

## Accessibility & Inclusion

Large touch targets (min 48px), high contrast in a dark room, `prefers-reduced-motion` respected, works without vibration support (iPhone).
