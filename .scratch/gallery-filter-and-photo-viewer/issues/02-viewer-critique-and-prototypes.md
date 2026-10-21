# 02: Critique the gallery and prototype Photo viewer directions

**What to build:** The Photo viewer feels cheap and junior, so its look is chosen from things the developer can see, not from a description. Run an Impeccable critique of the current Photo viewer, Event type filter and gallery cards, then build 2–3 throwaway prototypes of the one-photo-at-a-time viewer in different visual directions to compare side by side on a phone. Use the `impeccable` skill (critique) and the `prototype` skill. They read PRODUCT.md and DESIGN.md. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Visual direction).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] An Impeccable critique of the Photo viewer, the filter row and the gallery cards at 375px and desktop, with its findings written in this ticket's comments
- [x] For the cards, the critique says plainly whether anything needs fixing. They are redesigned only if it does
- [x] 2–3 throwaway prototypes of the one-photo-at-a-time viewer: warm charcoal (the colour already behind the viewer) plus one or two alternatives such as deep sage, or cream done properly. Each shows a whole, uncropped photo, the caption, the Close button, the "N / total" counter and desktop thumbnails
- [x] The prototypes run on a phone with real sample photos, kept out of the shipped site
- [x] The developer picks a direction. The choice, and the reason, are recorded in this ticket's comments (this last step needs the developer)
- [x] The prototype code is removed or left clearly marked as throwaway

## Comments

### Impeccable critique (2026-10-21)

Run dual-agent (a design review, plus the detector and a browser overlay) on the built site at 375px and 1280px. The sample photos are flat SVG placeholders, so the review judged structure, framing and chrome, not photo impact. Score: **20/36** (heuristic 10, help, is n/a for a gallery), which is Acceptable. The cards and the viewer's plumbing pull the score up; the viewer's look pulls it down.

**Detector.** The CLI scan of `SetupViewer.astro`, `SetupCard.astro`, `Photo.astro` and `gallery.astro` was clean. The browser overlay flagged one thing, the cream page background (`#f8f6f1`), on every view. It's a false positive here: the warm paper is a documented brand decision in DESIGN.md.

**What's working**
- **The arch cards.** The arch crop, the sage-mist fill (which doubles as the loading state), the serif caption and the centred Sample tag are clearly Likha's. The focus ring traces the arch and caption together.
- **The viewer's behaviour.** Native dialog, its own history entry, the back gesture, Escape, focus return, a stable page behind, and it works without JavaScript. The rebuild keeps all of it.
- **The filter's honesty.** A real `aria-pressed` group, shareable through `?type=`, a safe fallback for unknown types, the count announced only on a choice, and the motion is off under reduce motion.

**Priority issues**
1. **[P1] The viewer is a document, not a viewer** (`SetupViewer.astro`). There's no count and no position, and you can't move one photo at a time. On a phone about 1.5 photos show at once, the next bleeding in. Nine photos are a 4,100px scroll with nothing to say how far is left. This is the "cheap and junior" feeling, at the moment a visitor is most interested. → the one-photo-at-a-time track, counter, buttons, keys and thumbnails of ticket 04.
2. **[P1] The surface and chrome are wrong for a photo viewer.** The cream sheet flattens pale photos. The bar's hairline plus the forest-outlined × read as a form header. On phones the dialog fills the screen, so the charcoal backdrop is never seen, and the viewer looks like a plainer new page. On desktop the photo sits in a 960px paper column with ~200px of dead paper each side. → chosen from the prototypes below.
3. **[P2] The mobile first screen buries the work, and the filter wraps clumsily.** The first arch starts at y=511 of 812. The 4 pills wrap to 2 rows with Other alone on the second, and the seeded list makes that 8 pills. → the one-row swipeable filter of ticket 03. Also consider `.intro` margin-bottom `xl` → `lg`.
4. **[P2] The viewer's layout maths is fragile.** `max-height: calc(100dvh - 6rem)` assumes a one-line caption, but captions wrap at 375px. Photos have no stored dimensions, so lazy photos shift as they load. → lay the viewer out as a grid (`auto 1fr auto`) so the stage is whatever is left, and reserve the photo box (the prototypes do this).
5. **[P2] Both surfaces end weakly.** The viewer simply stops after the last photo. The gallery's only "Get a quote" is at the top, so a parent who just fell for a Setup has to scroll back up for it (Product Principle 3). → a closing block under the grid with the solid "Get a quote" pill. A quote link inside the viewer stays out of scope per the spec.

**The cards: does anything need fixing?** No redesign. Two small, additive fixes:
- **Above-the-fold covers lazy-load.** `Photo.astro` defaults to `loading="lazy"` and `SetupCard` never overrides it, so the first cover (the page's largest image) waits on mobile data. Pass `loading="eager"` on the first 1–3 cards, and `fetchpriority="high"` on the first, in `gallery.astro` and `index.astro`.
- **Nothing says how much is behind a cover.** A card with 9 photos looks the same as one with 1. A small slate "9 photos" line under the caption would set expectations and pair with the viewer's "1 / 9". Optional.
- Minor: screen readers hear each card's caption three times (cover alt, figcaption, button). The cover could take `alt=""`.

**Minor observations**
- DESIGN.md describes the filter as a View Transition, but the code animates the cards itself with a gliding highlight. Fix this when ticket 03 updates DESIGN.md.
- The solid "Get a quote" and the solid selected "All" sit close together on the gallery top: two forest blobs. That blurs "one solid green action at a time".
- Timing literals: the viewer's 500ms photo fade, and the filter's 550ms glide and 120ms delay.
- The viewer refetches the cover at a larger size and fades it in from empty. The grow-from-card transition (ticket 05) fixes this.
- About 190px of empty paper under the last card row on desktop.

**Questions it raised**
- The arch is the brand's binding motif, yet it vanishes at the moment of most interest. Could the thumbnails, or the transition from the card, carry it? (Prototype C's arch thumbnails try this.)
- Is one quiet "Get a quote" on the viewer's last photo worth reopening the spec's out-of-scope line?

### Prototypes (2026-10-21)

Three directions for the one-photo-at-a-time viewer, on the throwaway branch **`prototype/viewer-directions`** (commits 7dc54e7 and 1cdab33), never merged to main. They share the mechanics (native scroll-snap swiping, the "N / total" counter, Previous and Next, the arrow keys, desktop thumbnails, disabled ends) and differ in look and layout:

- **A · Warm charcoal, the photo app.** The photo full-bleed on `#1f2423`, the caption and a borderless × floating on top, and the counter under the photo. Desktop: round arrows at the screen edges and a filmstrip of thumbnails.
- **B · Deep sage, the atelier wall.** Each photo hung like a print, in a thin paper mat on a `#2c3a33` wall, with a museum label under it (Event type eyebrow, serif caption, a large serif "3 / 9") and a labelled "× Close" pill. Desktop: the photo on the left, and a label column on the right with the caption, counter, Previous/Next pills and a 3-column grid of thumbnails.
- **C · Cream, done properly, the portfolio page.** The photo on a sage-mist panel inset from the paper, an Event type eyebrow over the caption, and a forest segment sliding along a hairline to show how far through you are. Desktop: Previous and Next pills either side of the counter, and arch-shaped thumbnails.

Every Setup's placeholders are swapped for 11 real event-décor photos from Wikimedia Commons, a mix of portrait and landscape, loud and pastel. Credits are in `public/prototype-viewer-photos/CREDITS.md` on the branch. The prototype markup only renders in `astro dev`, so a production build of the branch serves the same gallery pages. But a build still copies the stand-in photos into `dist` and bundles the unused prototype script and CSS, so **never deploy or merge the branch**. All the prototype code carries a "PROTOTYPE, throwaway" header.

To compare them on a phone (same Wi-Fi as the computer):

    git switch prototype/viewer-directions
    npm run prototype:viewer

Open the printed Network URL plus `/gallery` on the phone, tap a card, and flip between A, B and C with the pink bar at the bottom. The bar works inside the open viewer, and the URL keeps the variant, the open Setup and the photo across reloads. The Neutral bridal brunch arch has 9 photos.

Checked so far in Chromium at a 375×812 phone viewport (touch, Pixel 5 profile) and at 1280×800. Swiping, the counter, Previous/Next, the arrow keys, the thumbnails and the disabled ends all work in each variant, and every photo shows whole, portrait or landscape. It hasn't been opened on a real phone yet, so the "run on a phone" box stays open until the developer compares them there.

B moves the caption below the photo, into a museum label. That breaks story 43 ("the caption and Close button stay quietly at the top"). If B wins, either accept that change to the spec or keep B's wall and mat with the caption at the top.

**Still needed from the developer:** open the prototypes on a real phone, pick a direction, and record the choice and why here. Ticket 04 builds it, and DESIGN.md records it.

### Developer's answers to the critique (2026-10-21)

- **What comes next:** the viewer first. Once a direction is picked, ticket 04 builds it, with the stage sized by a grid (`auto 1fr auto`) rather than a fixed allowance for the caption (priority issues 1, 2 and 4).
- **Cards:** only the faster first covers. Load the first 1–3 covers eagerly, and the first with `fetchpriority="high"`, on the Gallery and the homepage. No "9 photos" line.
- **Story 43 stays.** If B wins, keep its sage wall and paper mat but put the caption back at the top.

### Direction chosen (2026-10-21)

**B · Deep sage, the atelier wall.** The developer compared all three on a real phone and on desktop. Why B:
- **The photos stand out.** The thin paper mat on the deep sage wall lifts both pale photos (cupcakes, fondant) and busy ones (the gold baby-shower wall) better than charcoal or cream.
- **It feels most like Likha.** The sage wall and serif label read as the atelier and use the brand's own sage, rather than a generic dark photo viewer.
- **The desktop layout.** The photo beside a label column with a thumbnail grid works best on a wide screen.

**For ticket 04:** story 43 stays, so build B with the caption and Close at the top rather than in a label under the photo. Keep B's wall (`#2c3a33`, which becomes a token with its contrast ratios), the paper mat around each photo, the serif "3 / 9" counter and the labelled "Close" pill. On desktop, keep the photo-plus-label-column layout with the thumbnail grid. The prototype is on `prototype/viewer-directions` for reference; it stays off main. DESIGN.md records the direction once it's built.
