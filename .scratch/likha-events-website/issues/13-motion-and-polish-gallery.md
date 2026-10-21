# 13: Motion and polish: Gallery and photo viewer

**What to build:** The Gallery and the Setup photo viewer feel premium. Arch-framed photos reveal softly as the visitor scrolls, cards respond gently to hover and tap, filtering eases between results, and the viewer opens and closes smoothly. The motion is slow and restrained, so the photos stay the focus. Use the `impeccable` skill: animate first, then polish. It reads PRODUCT.md and DESIGN.md from ticket 12. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 12 (Design context for impeccable)

**Status:** done

- [x] Gallery cards fade and rise into view on scroll, staggered, once per card
- [x] Cards respond to hover (desktop) and press (phone) with a subtle lift or photo zoom inside the arch frame
- [x] Changing the Event type filter eases between results instead of jumping
- [x] The viewer opens and closes with a smooth transition, and moving between photos is smooth
- [x] All motion uses transform and opacity only, with no layout shift, and stays smooth on a mid-range phone
- [x] With "reduce motion" turned on, nothing moves: content appears straight away
- [x] A polish pass on spacing, alignment, captions and type across the Gallery and viewer at desktop and 375px
- [x] Existing Gallery and viewer Playwright tests still pass
- [x] A Playwright test with reduced motion emulated confirms content is visible without waiting for animations

## Comments

**Done (2026-10-20).** Gallery cards rise into view and their photos settle into the arch. Filtering runs as a View Transition, and the viewer rises in and drops away. Everything is transform and opacity on the `--ease-settle` token, and all of it is off under "reduce motion". DESIGN.md has a new Motion section describing it.

- Polish: Gallery's "Get a quote" is now a pill. Global `.pill` now styles links too, so the homepage's local copy of those rules was removed. Viewer photos are capped to the screen height and centred, so each one can be seen whole.
- `tests/e2e/gallery-reduced-motion.spec.ts` checks that with reduced motion, cards, filter results and the viewer show straight away, with no animations running.
- `setup-viewer.spec.ts`'s "stays scrolled" test now waits for the card's entrance to finish. Otherwise Playwright's scroll-before-click sees the card mid-rise and scrolls further, which a real tap doesn't do.
- **Left as they were:**
  - The Event type filter is hidden until the script runs. When it appears, it pushes the grid down a little on load.
  - Viewer photos have no stored width or height, so each one takes its space only once it loads. Fixing that needs the photo dimensions stored with the content.
  - On a phone the filter wraps "Other" onto a second row.
  - Firefox closes the viewer instantly, because it doesn't animate `overlay`.
