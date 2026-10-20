# 13: Motion and polish: Gallery and photo viewer

**What to build:** The Gallery and the Setup photo viewer feel premium. Arch-framed photos reveal softly as the visitor scrolls, cards respond gently to hover and tap, filtering eases between results, and the viewer opens and closes smoothly. The motion is slow and restrained, so the photos stay the focus. Use the `impeccable` skill: animate first, then polish. It reads PRODUCT.md and DESIGN.md from ticket 12. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 12 (Design context for impeccable)

**Status:** ready-for-agent

- [ ] Gallery cards fade and rise into view on scroll, staggered, once per card
- [ ] Cards respond to hover (desktop) and press (phone) with a subtle lift or photo zoom inside the arch frame
- [ ] Changing the Event type filter eases between results instead of jumping
- [ ] The viewer opens and closes with a smooth transition, and moving between photos is smooth
- [ ] All motion uses transform and opacity only, with no layout shift, and stays smooth on a mid-range phone
- [ ] With "reduce motion" turned on, nothing moves: content appears straight away
- [ ] A polish pass on spacing, alignment, captions and type across the Gallery and viewer at desktop and 375px
- [ ] Existing Gallery and viewer Playwright tests still pass
- [ ] A Playwright test with reduced motion emulated confirms content is visible without waiting for animations
