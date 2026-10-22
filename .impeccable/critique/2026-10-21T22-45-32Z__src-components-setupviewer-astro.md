---
target: the Photo viewer, Event type filter and gallery cards
total_score: 20
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
target_identity: "file:C:\\likha\\src\\components\\SetupViewer.astro"
target_fingerprint: "sha256:66f15faaf40a84c8eeea09afd54e2b2336900801f009d4b9b939975d7d8cf854"
target_path: "C:\\likha\\src\\components\\SetupViewer.astro"
timestamp: 2026-10-21T22-45-32Z
slug: src-components-setupviewer-astro
---
Method: dual-agent (A: design review · B: detector + browser overlay)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Viewer shows no count or position |
| 2 | Match system / real world | 2 | Vertical scroll fights the phone photo-app model |
| 3 | User control and freedom | 3 | Back/Escape/Close all work; no jump to a photo |
| 4 | Consistency and standards | 3 | On-system, but breaks lightbox conventions |
| 5 | Error prevention | 3 | Magic 6rem bar height breaks with 2-line captions |
| 6 | Recognition rather than recall | 2 | No thumbnails; cards don't say how many photos |
| 7 | Flexibility and efficiency | 1 | No arrow keys, thumbnails or jump-to |
| 8 | Aesthetic and minimalist design | 2 | Viewer chrome and dead paper compete with the photo |
| 9 | Error recovery | 2 | A failed photo shows the broken-image icon |
| 10 | Help and documentation | n/a | Gallery surface |
| **Total** | | **20/36** | **Acceptable** |

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
