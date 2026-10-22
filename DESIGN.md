---
name: Likha Events
description: We create. You celebrate. Event décor for baby showers and birthdays across the GTA.
colors:
  bg: "#f8f6f1"
  text: "#303838"
  text-muted: "#56605c"
  action: "#183828"
  action-hover: "#0f2619"
  on-action: "#f8f6f1"
  sage: "#788880"
  sage-band: "#e2e7e2"
  line: "#d6d9d3"
  error: "#9c2b1e"
  wall: "#2c3a33"
  on-wall-muted: "#c9d2cc"
  on-wall-line: "rgb(248 246 241 / 0.4)"
  on-wall-hover: "rgb(248 246 241 / 0.1)"
typography:
  display:
    fontFamily: "Cormorant Garamond Variable, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 1.9rem + 2.8vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.1
  headline:
    fontFamily: "Cormorant Garamond Variable, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.1
  title:
    fontFamily: "Cormorant Garamond Variable, Cormorant Garamond, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.1
  body:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Jost Variable, Jost, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
rounded:
  radius: "0.25rem"
  pill: "100vmax"
  circle: "50%"
  arch: "100vmax 100vmax 0.25rem 0.25rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3.5rem"
  2xl: "6rem"
  gutter: "clamp(1rem, 0.5rem + 2.5vw, 2.5rem)"
  content-width: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs} {spacing.md}"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.on-action}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.action}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs} {spacing.md}"
    height: "2.75rem"
  button-outline-hover:
    backgroundColor: "{colors.sage-band}"
  button-outline-on-band-hover:
    backgroundColor: "{colors.bg}"
  viewer-button:
    backgroundColor: "transparent"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "2.75rem"
  viewer-button-hover:
    backgroundColor: "{colors.on-wall-hover}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.action}"
    rounded: "{rounded.pill}"
    padding: "{spacing.xs} {spacing.md}"
    height: "2.75rem"
  filter-chip-selected:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
  nav-link:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    height: "2.75rem"
  nav-link-current:
    textColor: "{colors.action}"
  arch-frame:
    backgroundColor: "{colors.sage-band}"
    rounded: "{rounded.arch}"
  sample-tag:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.label}"
    rounded: "{rounded.radius}"
    padding: "0.125rem {spacing.xs}"
  package-card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    padding: "{spacing.lg} {spacing.md}"
  input-field:
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.radius}"
    padding: "{spacing.xs} {spacing.sm}"
    height: "2.75rem"
  sage-band:
    backgroundColor: "{colors.sage-band}"
    textColor: "{colors.text}"
  chat-panel:
    backgroundColor: "{colors.sage-band}"
    textColor: "{colors.text}"
    rounded: "{rounded.radius}"
    padding: "{spacing.lg}"
  step-number:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    typography: "{typography.title}"
    rounded: "{rounded.circle}"
    size: "2.5rem"
---

# Design System: Likha Events

## Overview

**Creative North Star: "The Party Atelier"**

Likha Events is a designer's studio, not a party store. The site should read like the atelier's own portfolio: warm off-white paper, charcoal ink, a single forest-green voice for action, and the brand's arch framing each Setup like a piece on the studio wall. The customer's own colours and themes are what fill the arches, so the frame around them stays composed and quiet, and each Setup's colours carry the page.

The system is light and airy, not dense. Sections breathe on a generous vertical rhythm, alternating paper with soft sage bands. A high-contrast serif (Cormorant Garamond) carries headings, captions and prices with an atelier's flourish, and a clean geometric sans (Jost) keeps everything else plain and readable. Components are **soft and assured**: thin hairlines, generous padding, curves wherever the arch allows, and one solid green action at a time.

The site avoids the party-store look: no bright primaries, confetti, bubbly display type or busy pattern backgrounds. When a Setup is bold and colourful, the photo is allowed to be loud, and the frame stays calm around it.

**Key Characteristics:**
- Warm off-white paper and charcoal ink, with forest green reserved for actions, links and prices.
- The arch (a semicircular top over a 4:5 portrait) frames every featured photo.
- A serif for headings, captions and prices, a sans for everything else.
- Flat surfaces. Depth comes from tone (paper vs. sage band) and hairlines, never shadows.
- Pill-shaped buttons and filter chips that echo the arch's curve.
- Slow, restrained motion in transform and opacity only, settling on `cubic-bezier(0.16, 1, 0.3, 1)` and switched off under "reduce motion". Every page has it.

## Colors

A warm neutral page, with green as the brand's single accent: forest for action, sage for atmosphere. The tokens live in `src/styles/tokens.css` as `--color-<key>`, with each text pairing's contrast ratio noted beside it.

### Primary
- **Forest** (`action`): the brand's voice for action. Solid buttons, links, prices, the logo and wordmark, selected filter chips, the "sample" tag and the booking step numbers.
- **Deep Forest** (`action-hover`): hover state for solid buttons and links.
- **Paper on Forest** (`on-action`): text on forest. Same value as `bg`.

### Secondary
- **Sage** (`sage`): the brand guide's sage, used only for decoration, such as the hover underline in the menu and the arch motif on the thank-you page. At 3.5:1 on paper it is **never used for text**.
- **Sage Mist** (`sage-band`): a light tint of sage used for the soft bands (homepage Packages teaser, booking section, footer, Contact's chat panel), the empty arch behind a loading photo, and the hover fill of the outline button, and the phone Menu button.

### Neutral
- **Paper** (`bg`): the page background.
- **Charcoal Ink** (`text`): all body text and headings.
- **Slate** (`text-muted`): secondary text such as hints, the "(optional)" marker, Rental descriptions, the travel-fee note and copyright. It is also the input border colour.
- **Hairline** (`line`): borders and dividers, such as under the header and the open phone menu, around Package cards and the Menu button, between list lines, above the footer's copyright, and where two paper sections or a band and the footer meet.
- **Brick** (`error`): form error messages only.

### The Photo viewer's wall
- **Deep Sage Wall** (`wall`): the Photo viewer's background, and its backdrop. Text on it is paper (11.0:1), and its focus ring is paper too, as forest would vanish.
- **Sage Mist on the Wall** (`on-wall-muted`): secondary text on the wall, such as the Event type above the caption and the counter's "/ 9" (7.7:1).
- **Wall Line** (`on-wall-line`, paper at 40%) and **Wall Hover** (`on-wall-hover`, paper at 10%): the border and hover fill of the viewer's outline pills. Never text.
- Inputs use a plain white background (a literal `#fff` in `contact.astro`, not a token), so fields lift slightly off the paper.

### Named Rules
**The Sage Is Not Ink Rule.** The brand sage (`sage`) never carries text. Wherever the brand guide says "sage band", the band is `sage-band` and the text on it stays charcoal or forest.

**The One Green Voice Rule.** Forest marks things you can act on, plus prices. A paragraph, heading or decoration is never forest just to add colour.

**The AA Pairing Rule.** Every text colour on every background meets WCAG AA (4.5:1). A new pairing is checked before it ships, and its ratio is noted beside the token in `tokens.css`.

## Typography

**Display Font:** Cormorant Garamond Variable (with Georgia, serif), self-hosted via Fontsource
**Body Font:** Jost Variable (with system-ui, sans-serif), self-hosted via Fontsource

**Character:** A high-contrast, calligraphic serif that echoes the "Likha" wordmark, paired with a plain geometric sans. The serif brings the craft, and the sans keeps the information friendly and easy to read.

### Hierarchy
- **Display** (`--text-2xl`): page `h1`s and the large Package price (which is set at line-height 1).
- **Headline** (`--text-xl`): section `h2`s, the homepage tagline, Package names.
- **Title** (`--text-lg`): Rental names, booking step titles and the viewer's caption on a phone (Headline on desktop). Setup captions use it at line-height 1.3. The footer tagline and the Service area line use it at the body line-height.
- **Body** (`--text-base`): all running text, at most 65ch per line, with `text-wrap: pretty` on paragraphs and `balance` on headings.
- **Label** (`--text-sm`): hints, errors and copyright. Menu links and the phone Menu button add 0.04em tracking. The "sample" tag is uppercase with 0.08em tracking.

### Named Rules
**The Serif Speaks for the Studio Rule.** The serif is for headings, captions, prices and the tagline. Labels, form text, buttons and navigation use the sans.

**The Medium Weight Rule.** Headings sit at weight 500. Cormorant gets heavier quickly, so don't go bolder for emphasis. Use size or a sage-band setting instead.

## Layout

- **Container:** content is centred in a column up to `content-width`, with the fluid `gutter` on each side (16px on a 375px phone).
- **Vertical rhythm:** sections are padded `xl` top and bottom. Page ends and the footer gap use `2xl`. Within a section, headings sit `sm`–`lg` above their content.
- **Grids:** auto-fitting card grids with no fixed column count. Setups use cells of at least 16rem, Packages 18rem, Rentals 14rem and booking steps 15rem, each capped at `min(100%, …)` so nothing overflows at 375px. Setup grids use a taller row gap (`xl`) than column gap (`lg`) so each caption stays with its arch.
- **Bands:** a `sage-band` section runs the full width of the page while its content stays in the container. Paper and sage bands alternate to separate sections, with no cards between them. Where two paper sections meet (above the homepage's closing section), or a band runs into the footer (the booking band), a 1px hairline separates them instead.
- **Breakpoints:** 48rem (the menu collapses below it, and the footer goes to two columns above it) and 56rem (the homepage hero splits into text and arch, and Contact splits into form and chat panel).
- **Alignment:** homepage sections are centred. Gallery, Packages and Contact are left-aligned for reading and scanning, except the Package and Rental cards, which are centred under their arch tops.
- **Touch targets:** pills, filter chips, form fields, the Send button, the phone Menu button, the viewer's Close, Previous and Next, the menu links and the footer's social links are at least 2.75rem (44px) tall. Stacked phone menu links are 3rem.

## Elevation & Depth

The system is flat. There are no box-shadows anywhere. Depth comes from tone: paper sits on top, `sage-band` sits behind it, and 1px hairlines separate. The only overlay is the Photo viewer, a native dialog that fills the screen with the deep sage wall. Its photos hang in thin paper mats, which is tone again, not shadow.

### Named Rules
**The Paper and Mist Rule.** Lift something by moving it onto or off a sage band, or by giving it a hairline. Don't add drop shadows.

## Shapes

The arch is the signature shape: a 4:5 portrait whose top is a full semicircle, sitting on two barely-rounded feet (`rounded.arch`). Photos are cropped into it with CSS only, and the original image is never altered. The arch frames the homepage hero, every Setup cover and every Rental photo. Package cards take a shallower version of the same arch (a top curve 8rem tall) so text fits inside.

Buttons and filter chips take the arch's curve as a **pill** (`rounded.pill`). Small square elements (the "sample" tag, inputs, the viewer's photo mats, the phone Menu button) use the soft `--radius`. The booking step numbers are full circles (`rounded.circle`). Lines are always 1px.

`--radius` is the only radius token in `tokens.css`. The pill, circle and arch values are repeated as literals in each component that uses them.

The vector artwork in `src/assets/brand/` (`arch.svg`, `arch-balloons.svg`, `logo-lockup.svg`, `logo-wordmark.svg`) is the brand's own. The wordmark is the logo, and `arch-balloons.svg` sits in sage above the thank-you page's heading. The plain arch outline is on hand for other motifs.

### Named Rules
**The Arch Frames the Work Rule.** Any photo of Likha Events' work shown as a single feature goes in an arch. The Photo viewer is the exception, because it shows the whole photo uncropped, matted like a print.

## Components

### Buttons
Soft and assured: pill-shaped, at least 44px tall, in the sans at body size.
- **Primary (solid):** forest pill with paper text. Used for the main action in each place: the homepage's and Gallery's "Get a quote", "Send an inquiry" on the homepage and under How booking works, and Contact's "Send inquiry".
- **Outline:** 1px forest border, transparent fill, forest text. Used for a secondary action that should still look like a button, such as "See the gallery" under the featured Setups and Contact's chat buttons, and for the Event type filter.
- **Hover:** solid deepens to `action-hover`. Outline fills with `sage-band`.
- **Text link:** a forest underlined link for tertiary actions beside a pill, such as "Follow us on Instagram" in the homepage closing section and "See Packages & Rentals" in the sage band.
- **Focus:** a 2px forest outline, offset 3px, on every focusable element.
- **On a sage band:** an outline pill fills with paper on hover instead, so it still lifts. Contact's Instagram and Facebook chat buttons do this.
- **Sending:** while an Inquiry is on its way, Contact's Send pill reads "Sending your inquiry…" with a thin turning arc before the label, and pressing it again sends nothing more.

### Chips (Event type filter)
- **Style:** the outline pill.
- **State:** the selected Event type (`aria-pressed="true"`) is solid forest. Only one is selected at a time.
- **Which and in what order:** only Event types with at least one Setup get a chip. "All" is always first, then the Event types with the most Setups, ties alphabetically, and "Other" is always last.
- **Phone (under 48rem):** the chips stay on one row that swipes sideways, snapping softly to a chip's start, with no scrollbar. The row runs out to the screen's edges, past the page gutter, so the last chip in view is cut off there and shows there's more. Opening a filtered link brings its chip to the middle of the row.
- **Desktop (48rem and up):** the chips wrap onto as many rows as they need, so every Event type is in view.

### Cards / Containers
- **Setup card:** an arch with the cover photo over a `sage-band` fill, then the caption centred below it in serif Title. No border and no background. The whole arch is the button that opens the Photo viewer.
- **Rental card:** the same arch and centred text: the name (Title), the price per event in forest, then a one-line description in slate.
- **Package card:** a paper card with a 1px hairline border and an arch-topped shape, centred. It shows the name (Headline), the price (Display, in forest) and a left-aligned "what's included" list with a hairline between each line.
- **Sage panel:** Contact's "Prefer to chat?" box, a `sage-band` block with `--radius` corners and `lg` padding.

### Inputs / Fields
- **Style:** white background, 1px slate border, `--radius` corners, 44px tall, full width up to the form's 34rem. Labels sit above in sans at weight 500, and optional fields add a slate "(optional)".
- **Hover and focus:** the border deepens to forest, and focus adds the global 2px forest outline. The caret is forest.
- **Error:** a brick message in Label size below the field, read out as its description, and a brick border. The browser's own popup is held back, so a failed send shows every field's message at once and focuses the first. Each message goes once its field is answered.
- **Photo picker:** the file input's own button is a small outline pill.

### Navigation
- **Desktop (48rem and up):** the forest "Likha" wordmark on the left, then Home · Gallery · Packages & Rentals · Contact as Label-size links with 0.04em tracking, in charcoal. Hover turns forest with a sage underline. The current page is forest with a forest underline. A hairline runs under the header. The links are 44px tall.
- **Phone:** the menu collapses behind a "Menu" button (hairline border, `--radius` corners, three-line icon that turns into an ×, `sage-band` fill on hover or press). It opens as a full-width paper panel lying over the page under the header, closed by the button, Escape, a tap outside or tabbing on past it, with the links stacked at body size, 3rem tall. The current page is underlined. Without JavaScript the menu stays open in the header instead.
- **Footer:** a `sage-band` band with the wordmark, the serif tagline and the Instagram and Facebook links with line icons, sitting on the tagline's baseline. Hover draws a forest underline. Below them a hairline, then the copyright.
- **Underlines:** menu and footer links use the global `.link-line` class: no text underline, but a 1px line that draws out from the centre on hover (on devices that can hover) or keyboard focus, and stays under the current page.

### Photo viewer
The atelier wall: a native `<dialog>` filling the screen with the deep sage `wall`, showing one photo at a time. Each photo hangs whole and uncropped, like a print, in a thin paper mat (0.375rem of `bg`, `--radius` corners), with wall all round it. The photos are a horizontal scroll-snap track, one per screen, so swiping is the browser's own scroll, and without JavaScript the track still swipes. Each photo's slot is a whole screen of the track, so nothing jumps as photos after the cover load lazily.
- **Phone:** the Event type (`on-wall-muted` Label, uppercase, 0.08em tracking) and the caption (Title) sit quietly at the top left, with Close at the top right. The photo fills what's left, and under it a serif counter: "3" in Headline, "/ 9" smaller in `on-wall-muted`. No thumbnails and no arrows.
- **Desktop (48rem and up, with a fine pointer):** the photo on the wall to the left, and an 18rem label column to the right holding Close, the Event type, the caption (Headline), the counter, Previous and Next pills, and a 3-column grid of square thumbnails. Thumbnails wait dimmed at 55% on the wall; the current one is full strength in its paper mat. Previous is disabled (30%) on the first photo and Next on the last, with no wrap-around. The left and right arrow keys move too.
- **Close:** a labelled outline pill, "× Close", paper on the wall, 44px tall.
- The page behind doesn't scroll or shift while the viewer is open. The counter, buttons and thumbnails only appear once the script runs, as nothing else would keep them up to date.

### Sample tag
A small forest label (uppercase, 0.08em tracking) centred at the foot of an arch, or at the top of a Package card. It stays until the owner replaces sample content.

### Booking steps
A numbered list on a `sage-band` band. Each step has a 2.5rem forest circle with a serif numeral in paper, a Title-style heading and a short body line. The band ends the Packages & Rentals page, so it runs down to the footer with a hairline between them, with no strip of paper.

## Motion

Motion is the atelier hanging its work: slow, quiet, and only ever moving the frames, never the page around them. It moves things with transform and opacity only, eases out on the `--ease-settle` token (`cubic-bezier(0.16, 1, 0.3, 1)`), and under "reduce motion" nothing moves at all. The one exception to "transform and opacity" is a colour change on hover: a link, pill or the Menu button, or a form field's border on hover or focus, which eases over `--duration-exit` rather than snapping. Under "reduce motion" even that is instant.

The durations are tokens in `tokens.css`: `--duration-press` (150ms), `--duration-exit` (200ms), `--duration-open` (380ms), `--duration-grow` (500ms), `--duration-rise` (800ms), `--duration-linger` (900ms), `--duration-settle` (1.4s), `--duration-turn` (1s, the sending arc's turn) and `--stagger` (90ms). Scroll reveals come from `src/motion.ts`, which reads the same tokens. A few timings are still literals in their own files: the filter's glide (550ms, with arriving cards 120ms behind) in `gallery.astro`, and in `SetupViewer.astro` the viewer's photo fade-in (500ms) and the longest the page holds still for a cover on its way (300ms).

- **Homepage hero:** on load the wordmark, tagline and "Get a quote" rise 1.5rem and fade in over 800ms, one stagger apart, while the arch rises beside them and its photo settles from 1.06. It is CSS only.
- **Scroll reveals:** the first time it scrolls into view, content rises 1.5rem and fades in over 800ms: the homepage's "See the gallery", Packages teaser, Service area line and closing call to action. Setup cards (Gallery and homepage) do the same while their photo settles from 1.06 to full size inside the arch over 1.4s. Things arriving together are staggered 90ms apart, capped at four steps. Content stays visible by default, so no page depends on the script to be seen.
- **Hover and press:** on hover or keyboard focus a Gallery card's photo eases to 1.04 inside the arch over 900ms, and a press settles the card to 0.98. Pills settle to 0.98 on press too. Links and pills ease between colours over 200ms. Menu and footer links draw a 1px line out from the centre on hover or keyboard focus.
- **Phone menu:** the panel slides down 0.75rem and fades in over 380ms, and lifts away faster (200ms). The menu icon's three lines fold into an × at the same pace.
- **Event type filter:** the gallery's script animates the cards itself, over 550ms. Cards that stay glide to their new places, leaving cards fade out in 200ms, and arriving cards fade and rise 1rem, 120ms behind. The solid forest highlight glides from the old chip to the new one over 380ms. On a phone the row scrolls the chosen chip to its middle; under "reduce motion" it jumps there.
- **Packages & Rentals:** Package cards and booking steps rise into view like the homepage sections, staggered as rows. Rental cards arrive like Setup cards, their photos settling into the arch.
- **Contact:** field borders ease to forest over 200ms. An error message eases in just under its field over 380ms, dropping 0.375rem into place. While sending, the arc in the Send pill fades in and turns once a second. Under "reduce motion" the arc is hidden and the label alone says it is sending.
- **Thank-you page:** arrives like the homepage hero, CSS only: the arch motif, the heading and the words rise in one stagger apart. Both pages use the shared `rise-in` keyframes in `global.css`.
- **Photo viewer:** the tapped card's photo grows into the viewer: a View Transition over 500ms on `--ease-settle`, in which the photo keeps its content lined up while it moves and scales, and the arch cross-fades into the paper-matted print as the wall fades in behind it. Closing from the cover runs it back into the card over 380ms. Closing from any other photo, or opening by forward or a reload, simply fades the wall: in over 380ms, away faster (200ms). Only transform and opacity move: the script places both photos itself rather than letting the browser resize them. The header stays under the wall while it runs. A cover still on its way when the card is tapped holds the page for up to 300ms (fetched as soon as the pointer or focus reaches the card), then the viewer opens without it growing. In a browser without View Transitions nothing grows and the wall fades as above. Under "reduce motion" the viewer appears and closes at once. Previous, Next, the arrow keys and the thumbnails glide the track to the photo with the browser's smooth scroll; under "reduce motion" they jump. The thumbnails ease between dimmed and full over 200ms. Photos still loading fade in over 500ms once ready.

## Do's and Don'ts

### Do:
- **Do** put every featured photo of a Setup or Rental in the arch (4:5 aspect, `rounded.arch`), cropped by CSS with `object-fit: cover`.
- **Do** use the custom properties in `src/styles/tokens.css` for colour, type, space and `--radius`. Add a new token there, with its contrast ratio noted, rather than writing a new one-off value.
- **Do** keep one solid forest pill as the main action in each place, with outline pills or text links for anything beside it.
- **Do** separate sections with paper and sage bands and 1px hairlines.
- **Do** let the photos carry the colour. The frame around them stays paper, ink and green.
- **Do** keep touch targets at least 44px tall and every page free of sideways scrolling at 375px.
- **Do** write any motion with transform and opacity only (hover and focus colour fades aside), on the motion tokens, slow and restrained, and turn it all off under `prefers-reduced-motion`.

### Don't:
- **Don't** use `sage` for text, or put text on a full-strength sage background.
- **Don't** add drop shadows, gradients or glows to cards or buttons.
- **Don't** add a party-store look: bright primary colours, confetti, balloon clip art, bubbly or script display fonts, or pattern backgrounds.
- **Don't** set headings bolder than 500, or set labels, buttons or form text in the serif.
- **Don't** add new rectangular buttons. Calls to action are pills.
- **Don't** alter or re-crop the stored photos. Framing happens in CSS.
