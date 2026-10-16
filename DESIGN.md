---
name: Một hai ba dô!
description: A party drinking game where every round is a freshly drawn Vietnamese street lottery ticket (vé số) on your own phone.
colors:
  nacht: "#14182e"
  nacht-2: "#1e2342"
  nacht-3: "#2a3058"
  papier: "#f3eedc"
  papier-2: "#cfc9e3"
  zitrone: "#f6e27a"
  rosa: "#f4a7be"
  minze: "#9fe3c9"
  flieder: "#b9b4f5"
  aprikose: "#f7b267"
  koralle: "#f59e9e"
  tinte: "#1b1f3a"
  tinte-2: "#3b3f63"
  druckblau: "#2440a8"
  rot: "#d7263d"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "clamp(3.6rem, 21vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  display-small:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 11vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  question:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 6.6vw, 2.1rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  ticket-title:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 80"
  numeral:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "2.2rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum'"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.1
  button:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.1
  serial:
    fontFamily: "'Bricolage Grotesque', 'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.04em"
    fontFeature: "'tnum'"
  body:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  ticket-text:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  los: "6px"
  flaeche: "12px"
  pill: "999px"
spacing:
  rand: "16px"
  rand-wide: "24px"
  stack: "14px"
  grid: "10px"
  breite: "520px"
  leiste: "96px"
components:
  button-haupt:
    backgroundColor: "{colors.zitrone}"
    textColor: "{colors.tinte}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "56px"
  button-haupt-hover:
    backgroundColor: "#fbeb9a"
  button-zweit:
    backgroundColor: "{colors.nacht-3}"
    textColor: "{colors.papier}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "56px"
  button-zweit-hover:
    backgroundColor: "#353c6c"
  ticket:
    backgroundColor: "{colors.zitrone}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.los}"
    padding: "16px 18px 16px 30px"
  row:
    backgroundColor: "{colors.nacht-2}"
    textColor: "{colors.papier}"
    rounded: "{rounded.flaeche}"
    padding: "8px 16px 8px 12px"
    height: "64px"
  drink-row:
    backgroundColor: "{colors.nacht-3}"
    textColor: "{colors.papier}"
    rounded: "{rounded.flaeche}"
    padding: "8px 16px 8px 10px"
    height: "60px"
  drink-row-you:
    backgroundColor: "{colors.rot}"
    textColor: "#ffffff"
    rounded: "{rounded.flaeche}"
  input:
    backgroundColor: "{colors.nacht-2}"
    textColor: "{colors.papier}"
    rounded: "{rounded.flaeche}"
    padding: "0 16px"
    height: "56px"
  segment-active:
    backgroundColor: "{colors.papier}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.pill}"
    height: "44px"
  avatar:
    backgroundColor: "{colors.zitrone}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.pill}"
    size: "40px"
---

# Design System: Một hai ba dô!

## Overview

**Creative North Star: "The Night Ticket Seller"**

A deep night ground, and on it one bright printed lottery ticket at a time. Every round is a freshly drawn vé số; the reveal is the draw, with numbers rolling and then landing. The phone is a private controller in a dim room, so the screen stays calm and dark, and only the one ticket that matters right now glows.

Density is low and thumb-first: one column, at most 520px wide, big tap targets (44px minimum, 56px for main buttons), and the main action pinned at the bottom in the thumb zone. Depth comes from paper on night, never from shadows or glows. The world deliberately rejects the usual party-app look of dark neon purple with emoji tiles.

Every piece of the ticket is real ticket material: the coloured paper, a dotted tear-off edge, two half-round notches, fine wavy guilloche lines, a print-blue serial number, a pen circle for "my pick" and a punch hole for "done".

**Key Characteristics:**
- Night ground in three steps; surfaces lift by lightness, not lines.
- Five paper colours plus cream, one per game and one per player.
- Exactly one active ticket per screen; everything else is quiet night.
- Condensed Bricolage Grotesque for display and numbers, Be Vietnam Pro for reading; both cover Vietnamese.
- Red means only "you drink".
- Motion is the draw: tickets slide in, digits roll, circles get scribbled, holes get punched. All of it collapses to instant under reduced motion.

## Colors

A dark ink-blue night carrying bright, slightly chalky printed papers, with two print inks (blue and red) used sparingly.

### Primary
- **Lemon Ticket** (zitrone): the default ticket paper, the main button, the display title, the room serial in the header, the focus ring and the pen circle when it sits on night. The "this is the thing" colour.

### Secondary
- **Ticket Papers** (rosa, minze, flieder, aprikose, plus cream papier): one paper per game (Wer würde eher = pink, Mehrheit = mint, Lügner = lilac, Schätzfrage = apricot, Karten = cream, Party-Mix = lemon). The same six papers are the avatar colours, assigned by join order (player 1 lemon, 2 pink, 3 mint, 4 lilac, 5 apricot, 6 cream). Mint also marks the best guess and the "rule" label; lilac also marks the unmasked liar's row.

### Tertiary
- **Print Blue** (druckblau): only printed on paper. Serial numbers, the pen circle on a ticket, step numbers in the explanation, the winner's rank, the invite code.
- **Ink Red** (rot): only the "you drink" row. Nothing else in the game is red.
- **Soft Coral** (koralle): only error messages under inputs.

### Neutral
- **Night** (nacht): page background, sticky header, bottom action bar.
- **Night Raised** (nacht-2): rows, inputs, chips, segmented controls.
- **Night High** (nacht-3): selected rows, secondary button, drink rows, vote bars.
- **Cream** (papier): main text on night, active segment, cream ticket paper.
- **Lilac Grey** (papier-2): secondary text on night; tinted violet, never neutral grey.
- **Ink** (tinte): text on paper, dark button on paper, the winner's avatar.
- **Soft Ink** (tinte-2): secondary text on paper.

### Named Rules
**The Red Means You Drink Rule.** Ink red is used for one thing only: the current player's row in the "who drinks" list. If anything else turns red, the signal is lost.

**The Six Papers Rule.** Game tickets and avatars use only the six papers. A new game picks one of them; a seventh player wraps back to lemon. No new hues.

**The Print Ink Rule.** Print blue lives on paper, never on night. On night, the accent is lemon.

## Typography

**Display Font:** Bricolage Grotesque (with Be Vietnam Pro, system-ui)
**Body Font:** Be Vietnam Pro (with system-ui)

**Character:** A loud, condensed poster grotesque like the big printed numbers on a vé số, next to a calm, friendly text face made in Vietnam. Both load from Google Fonts with full Vietnamese diacritics; the wide/narrow axis (wdth 75 to 100) is loaded so the display face can condense.

### Hierarchy
- **Display** (800, clamp(3.6rem, 21vw, 6rem), 0.88, condensed to 75%): the game name on the start screen, in lemon. A smaller step (clamp(2.2rem, 11vw, 3rem)) heads the lobby and end screen.
- **Question** (700, clamp(1.55rem, 6.6vw, 2.1rem), 1.12, balanced wrap): the question printed on the round's ticket.
- **Ticket Title** (800, 1.45rem, 1.05, condensed to 80%): game names on menu tickets; 2.3rem on the large Party-Mix ticket and the explanation ticket.
- **Numeral** (800, 2.2rem, 1, condensed to 75%, tabular): ranks and sip counts on the results board; 3rem on the winner ticket. All counting numbers use tabular figures so they line up.
- **Headline** (700, 1.6rem, 1.1): section headings on night, such as "Pick a game".
- **Button** (700, 1.25rem, 1.1): every pill button, in the display face.
- **Serial** (700, 0.8rem, 0.04em tracking, tabular): print-blue serial marks on tickets. The header room serial is the same idea at 1.15rem, 800, 0.06em, lemon.
- **Body** (400, 1.0625rem, 1.5): all reading text; secondary text sits in lilac grey at 0.9 to 0.95rem.
- **Ticket Text** (400, 0.95rem, 1.35, soft ink): the short description under a ticket title.

### Named Rules
**The Two Faces Rule.** Only these two families. Any new face must render Vietnamese diacritics (ạ, ồ, ữ).

**The Big Numbers Rule.** Counts and ranks are set in the condensed display face, never in body text. Numbers are the drama of the draw.

## Layout

Mobile-first single column. Content is centred at max 520px with a 16px side margin (24px from 600px wide, plus 16px top padding). Screens stack with a 14px gap. The header is sticky at the top (64px minimum, room serial left, help and language toggle right; in rounds a second line shows game name and "Round 4/25"). The main action bar is fixed at the bottom (12px top padding, safe-area aware), and the page keeps 96px plus safe area free underneath it.

Grids are simple: game tickets 2 by 2 with 10px gaps, with Party-Mix and Karten spanning both columns; player buttons 2 per row. The results board uses fixed columns (rank 2.4rem, avatar, name, count 4.5rem) so values line up like a printed draw board. Each name carries a small line with the player's drink icon and name; the board ranks by points, the count shows sips in that drink.

Drink picker (explanation screen): three equal night-raised tiles (Bier, Mix, Shot) with a 38px lemon line icon and the name; the chosen tile gets night-high plus the pen circle. Drink icons share the 2.25 stroke of the other SVG icons. Drink rows in results stack name over amount, because "2 Schlucke vom Shot" needs the width.

## Elevation & Depth

Flat. There are no shadows and no glows anywhere. Depth comes from two things only: the night steps (nacht, nacht-2, nacht-3), where a raised surface is just a lighter night, and bright paper sitting on night. The help sheet covers the screen with plain night rather than floating over it.

### Named Rules
**The Paper On Night Rule.** If something needs to stand out, make it paper. If it needs to recede, make it a lighter night. Never add a shadow.

## Shapes

Tickets have small corners (6px), cut by two half-round notches (9px radius) at the middle of the left and right edges, and a 2px dotted tear-off line 14px from the left edge. The A/B ticket in "Mehrheit gewinnt" is one ticket split down the middle: notches top and bottom, dotted line in the centre. Rows, inputs and the explanation panels on night use soft corners (12px). Buttons, chips, segmented controls and avatars are full pills or circles.

Two hand-made marks sit on top of the geometry: the pen circle (a slightly crooked, overlapping SVG loop, 2.5px round stroke) and the punch hole (a night-coloured circle, 24% of the avatar, at its top-right edge, 5% in).

## Components

### Buttons
Confident pills sized for one thumb.
- **Shape:** full pill (999px), full width in the action bar, 56px tall.
- **Main (haupt):** lemon with ink text. One per screen, in the bottom bar.
- **Secondary (zweit):** night high with cream text.
- **Dark (zweit dunkel):** ink with cream text, 48px, for buttons that sit on a ticket.
- **Hover / Active:** on hover-capable devices, lemon lightens and night-high lightens; on press the button scales to 0.97. Disabled is 40% opacity.
- **Focus:** a 3px lemon outline, 3px offset, everywhere.
- **Text button:** lilac-grey underlined text (4px offset), 44px tall, for leave and "other room".

### Chips
- **Player chip:** night-raised pill, 44px tall, avatar plus name, with an optional lilac-grey note ("host", "offline"). Offline is 50% opacity. The host gets a round remove button with an SVG cross.
- **Segmented control / language toggle:** night-raised pill track; the pressed option turns cream with ink text.

### Cards / Containers (the Ticket)
- **Corner Style:** 6px, notched, with dotted tear-off edge (see Shapes).
- **Background:** one paper colour, inherited from the game.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Guilloche:** fine wavy lines in ink at 11% opacity, only on the active ticket.
- **Internal Padding:** 16px 18px 16px 30px on menu tickets; 24px 20px 24px 34px on the question and explanation tickets.
- **Serial:** a print-blue corner mark top right, "ROOM·NN".

### Rows
- **Style:** night-raised, 12px corners, avatar left, value right in the display face. Used for votes (with a night-high bar showing the share of votes), answers, guesses and the results board.
- **Selected:** night high plus the pen circle.

### Inputs / Fields
- **Style:** night raised, 12px corners, 56px tall, 1.2rem text (never below 16px, so iPhones don't zoom), 2px transparent border.
- **Focus:** the border turns lemon.
- **Error:** a coral message below the field.
- **Code input:** display face, 800, 0.3em tracking, uppercase.

### Navigation
- **Header:** sticky night bar with the room serial ("Room № KXPT", lemon, condensed bold), a round 44px help button with an SVG question mark, and the DE/EN/VI toggle. No other navigation; the flow moves screen by screen.

### Pen Circle (signature)
A hand-drawn loop around the current choice, scribbled in from left to right with a 0.45s clip-path wipe. Print blue when it sits on a ticket, lemon when it sits on night. On menu tickets it circles only the game name.

### Punch Hole (signature)
"Done" is a hole punched into the player's avatar: a night circle at the top-right edge that pops in (0.25s). The progress row shows all active players' avatars, punched when they have answered, plus "3 of 5".

### The Draw (signature)
On a reveal, only the digits roll (0.65s, each row 90ms later, capped at 450ms); rows never move. Rolling digits turn lemon on night, then snap into place with a small scale-down.

### Drink List
Night-high rows of who drinks how much. The current player's row is the only red surface in the game: white text, name replaced by "You drink" in the display face.

### Results Board (signature)
A fixed-cell rank table like a xổ số results board: rank, avatar, name, sips. Tied players share a rank. Every player tied for most sips gets the winner ticket: lemon paper with guilloche, 96px tall, a print-blue rank, 3rem count, and an ink avatar so it does not disappear into the lemon.

## Do's and Don'ts

### Do:
- **Do** let exactly one ticket own each screen. In a round, when a reveal ticket appears (liar, estimate) or the A/B ticket is the round's ticket, the question drops its paper and becomes plain cream text above it. The game menu is a sheet of tickets to choose from; there only the chosen one is active.
- **Do** put guilloche only on the active ticket: the selected game, the question, the card, the reveal, the winner, the chosen A/B half.
- **Do** mark selection with the pen circle and "done" with the punch hole.
- **Do** print serial numbers in print blue in the ticket's top-right corner.
- **Do** colour avatars with the six papers by join order.
- **Do** set every count and rank in the condensed display face with tabular figures.
- **Do** give every animation a reduced-motion fallback: the stylesheet cuts all animations and transitions to 0.01ms, and the draw shows final numbers at once.
- **Do** keep tap targets at least 44px, main buttons 56px, and the main action in the bottom bar.

### Don't:
- **Don't** use red (rot) for anything except the "you drink" row: not for errors, not for warnings, not for emphasis.
- **Don't** put two notched tickets in a round screen, or guilloche on anything but the active ticket (tied winners on the results board are the one exception: each gets the winner ticket).
- **Don't** add shadows, glows or visible gradients; the only gradients in the CSS are masks that cut the notches.
- **Don't** use emoji or text glyphs as icons; icons are inline SVG strokes.
- **Don't** put small uppercase labels (eyebrows) above headings.
- **Don't** use a font without Vietnamese support.
- **Don't** use print blue on night or plain grey text; secondary text is lilac grey.
