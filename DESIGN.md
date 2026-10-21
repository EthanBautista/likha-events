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
    padding: "{spacing.xs} 0"
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
- No motion yet. Motion comes in tickets 13 to 15 and must respect "reduce motion".

## Colors

A warm neutral page, with green as the brand's single accent: forest for action, sage for atmosphere. The tokens live in `src/styles/tokens.css` as `--color-<key>`, with each text pairing's contrast ratio noted beside it.

### Primary
- **Forest** (`action`): the brand's voice for action. Solid buttons, links, prices, the logo and wordmark, selected filter chips, the "sample" tag and the booking step numbers.
- **Deep Forest** (`action-hover`): hover state for solid buttons and links.
- **Paper on Forest** (`on-action`): text on forest. Same value as `bg`.

### Secondary
- **Sage** (`sage`): the brand guide's sage, used only for decoration, such as the hover underline in the menu and future motifs. At 3.5:1 on paper it is **never used for text**.
- **Sage Mist** (`sage-band`): a light tint of sage used for the soft bands (homepage Packages teaser, booking section, footer, Contact's chat panel), the empty arch behind a loading photo, and the outline button's hover fill.

### Neutral
- **Paper** (`bg`): the page background.
- **Charcoal Ink** (`text`): all body text and headings.
- **Slate** (`text-muted`): secondary text such as hints, the "(optional)" marker, Rental descriptions, the travel-fee note and copyright. It is also the input border colour.
- **Hairline** (`line`): borders and dividers, such as under the header, around Package cards, between list lines and inside the viewer bar.
- **Brick** (`error`): form error messages only.
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
- **Title** (`--text-lg`): Rental names, booking step titles and the viewer's heading. Setup captions use it at line-height 1.3. The footer tagline and the Service area line use it at the body line-height.
- **Body** (`--text-base`): all running text, at most 65ch per line, with `text-wrap: pretty` on paragraphs and `balance` on headings.
- **Label** (`--text-sm`): hints, errors and copyright. Menu links add 0.04em tracking. The "sample" tag is uppercase with 0.08em tracking.

### Named Rules
**The Serif Speaks for the Studio Rule.** The serif is for headings, captions, prices and the tagline. Labels, form text, buttons and navigation use the sans.

**The Medium Weight Rule.** Headings sit at weight 500. Cormorant gets heavier quickly, so don't go bolder for emphasis. Use size or a sage-band setting instead.

## Layout

- **Container:** content is centred in a column up to `content-width`, with the fluid `gutter` on each side (16px on a 375px phone).
- **Vertical rhythm:** sections are padded `xl` top and bottom. Page ends and the footer gap use `2xl`. Within a section, headings sit `sm`–`lg` above their content.
- **Grids:** auto-fitting card grids with no fixed column count. Setups use cells of at least 16rem, Packages 18rem, Rentals 14rem and booking steps 15rem, each capped at `min(100%, …)` so nothing overflows at 375px. Setup grids use a taller row gap (`xl`) than column gap (`lg`) so each caption stays with its arch.
- **Bands:** a `sage-band` section runs the full width of the page while its content stays in the container. Paper and sage bands alternate to separate sections, with no rules or cards between them.
- **Breakpoints:** 48rem (the menu collapses below it, and the footer goes to two columns above it) and 56rem (the homepage hero splits into text and arch, and Contact splits into form and chat panel).
- **Alignment:** homepage sections are centred. Gallery, Packages and Contact are left-aligned for reading and scanning, except the Package cards, which are centred under their arch tops.
- **Touch targets:** pills, filter chips, form fields, the Send button, the phone Menu button and the footer's social links are at least 2.75rem (44px) tall. See the drift notes under Components for the exceptions.

## Elevation & Depth

The system is flat. There are no box-shadows anywhere. Depth comes from tone: paper sits on top, `sage-band` sits behind it, and 1px hairlines separate. The only overlay is the Photo viewer, a native dialog over a charcoal backdrop at 85% opacity.

### Named Rules
**The Paper and Mist Rule.** Lift something by moving it onto or off a sage band, or by giving it a hairline. Don't add drop shadows.

## Shapes

The arch is the signature shape: a 4:5 portrait whose top is a full semicircle, sitting on two barely-rounded feet (`rounded.arch`). Photos are cropped into it with CSS only, and the original image is never altered. The arch frames the homepage hero, every Setup cover and every Rental photo. Package cards take a shallower version of the same arch (a top curve 8rem tall) so text fits inside.

Buttons and filter chips take the arch's curve as a **pill** (`rounded.pill`). Small square elements (the "sample" tag, inputs, the viewer's photos, the phone Menu button) use the soft `--radius`. The booking step numbers are full circles. Lines are always 1px.

`--radius` is the only radius token in `tokens.css`. The pill and arch values are repeated as literals in each component that uses them.

The vector artwork in `src/assets/brand/` (`arch.svg`, `arch-balloons.svg`, `logo-lockup.svg`, `logo-wordmark.svg`) is the brand's own. Only the wordmark is in use so far. The arch outlines are on hand for motifs.

### Named Rules
**The Arch Frames the Work Rule.** Any photo of Likha Events' work shown as a single feature goes in an arch. The viewer's photo list is the exception, because it shows the whole photo uncropped.

## Components

### Buttons
Soft and assured: pill-shaped, at least 44px tall, in the sans at body size.
- **Primary (solid):** forest pill with paper text. Used for the main action in each place: the homepage's "Get a quote" and "Send an inquiry", and the Photo viewer's Close.
- **Outline:** 1px forest border, transparent fill, forest text. Used for a secondary action that should still look like a button, such as "See the gallery" under the featured Setups, and for the Event type filter.
- **Hover:** solid deepens to `action-hover`. Outline fills with `sage-band`.
- **Text link:** a forest underlined link for tertiary actions beside a pill, such as "Follow us on Instagram" in the homepage closing section and "See Packages & Rentals" in the sage band.
- **Focus:** a 2px forest outline, offset 3px, on every focusable element.
- **Drift to fix in the polish tickets:** these calls to action still use `--radius` rectangles instead of pills:
  - Gallery's "Get a quote" and the booking call to action on Packages & Rentals. Both also lack the 44px minimum height.
  - Contact's Send button.
  - Contact's Instagram and Facebook chat buttons, which also fill solid forest on hover instead of `sage-band`.

### Chips (Event type filter)
- **Style:** the outline pill.
- **State:** the selected Event type (`aria-pressed="true"`) is solid forest. "All" is always first.

### Cards / Containers
- **Setup card:** an arch with the cover photo over a `sage-band` fill, then the caption centred below it in serif Title. No border and no background. The whole arch is the button that opens the Photo viewer.
- **Rental card:** the same arch and centred text: the name (Title), the price per event in forest, then a one-line description in slate.
- **Package card:** a paper card with a 1px hairline border and an arch-topped shape, centred. It shows the name (Headline), the price (Display, in forest) and a left-aligned "what's included" list with a hairline between each line.
- **Sage panel:** Contact's "Prefer to chat?" box, a `sage-band` block with `--radius` corners and `lg` padding.

### Inputs / Fields
- **Style:** white background, 1px slate border, `--radius` corners, 44px tall, full width up to the form's 34rem. Labels sit above in sans at weight 500, and optional fields add a slate "(optional)".
- **Focus:** the global 2px forest outline.
- **Error:** a brick message in Label size below the field. Required fields use native browser validation, and the 3-photo limit has its own message.

### Navigation
- **Desktop (48rem and up):** the forest "Likha" wordmark on the left, then Home · Gallery · Packages & Rentals · Contact as Label-size links with 0.04em tracking, in charcoal. Hover turns forest with a sage underline. The current page is forest with a forest underline. A hairline runs under the header. The links are about 40px tall, which is under the 44px target.
- **Phone:** the menu collapses behind a "Menu" button (hairline border, `--radius` corners, three-line icon that turns into an ×), opening into a full-width stacked list at body size. The current page is underlined.
- **Footer:** a `sage-band` band with the wordmark, the serif tagline and the Instagram and Facebook links with line icons. Below them a hairline, then the copyright.

### Photo viewer
A native `<dialog>` up to 60rem wide on paper over the charcoal backdrop. A sticky bar holds the Setup's caption (Title) and the Close button. Below it, the Setup's photos are stacked full width, uncropped, with `--radius` corners. The page behind doesn't scroll or shift while the viewer is open.

### Sample tag
A small forest label (uppercase, 0.08em tracking) centred at the foot of an arch, or at the top of a Package card. It stays until the owner replaces sample content.

### Booking steps
A numbered list on a `sage-band` band. Each step has a 2.5rem forest circle with a serif numeral in paper, a Title-style heading and a short body line.

## Do's and Don'ts

### Do:
- **Do** put every featured photo of a Setup or Rental in the arch (4:5 aspect, `rounded.arch`), cropped by CSS with `object-fit: cover`.
- **Do** use the custom properties in `src/styles/tokens.css` for colour, type, space and `--radius`. Add a new token there, with its contrast ratio noted, rather than writing a new one-off value.
- **Do** keep one solid forest pill as the main action in each place, with outline pills or text links for anything beside it.
- **Do** separate sections with paper and sage bands and 1px hairlines.
- **Do** let the photos carry the colour. The frame around them stays paper, ink and green.
- **Do** keep touch targets at least 44px tall and every page free of sideways scrolling at 375px.
- **Do** write any motion (tickets 13 to 15) with transform and opacity only, slow and restrained, and turn it all off under `prefers-reduced-motion`.

### Don't:
- **Don't** use `sage` for text, or put text on a full-strength sage background.
- **Don't** add drop shadows, gradients or glows to cards or buttons.
- **Don't** add a party-store look: bright primary colours, confetti, balloon clip art, bubbly or script display fonts, or pattern backgrounds.
- **Don't** set headings bolder than 500, or set labels, buttons or form text in the serif.
- **Don't** add new rectangular buttons. Calls to action are pills.
- **Don't** alter or re-crop the stored photos. Framing happens in CSS.
