# 14: Motion and polish: Homepage, header and footer

**What to build:** The Homepage and the shared header and footer feel premium. The hero arrives gracefully, homepage sections reveal softly on scroll, the phone menu slides open, and header and footer links respond gently. The motion matches the Gallery's from ticket 13, so the site feels like one piece. Use the `impeccable` skill: animate first, then polish. It reads PRODUCT.md and DESIGN.md from ticket 12. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 13 (Motion and polish: Gallery and photo viewer)

**Status:** done

- [x] Motion timings and easings are the shared tokens from ticket 13, not redefined
- [x] The homepage hero (logo, tagline, arch photo, "Get a quote") arrives with a short, gentle entrance
- [x] The featured Setups, the Packages teaser, the Service area line and the closing call to action reveal softly on scroll
- [x] The phone menu slides open and closed instead of appearing instantly
- [x] Header, footer and homepage buttons and links have consistent hover, press and focus states
- [x] With "reduce motion" turned on, nothing moves: content appears straight away
- [x] A polish pass on spacing, alignment and type across the homepage, header and footer at desktop and 375px
- [x] Existing Playwright tests still pass, and the reduced-motion test from ticket 13 covers the homepage and the phone menu

## Comments

**Done (2026-10-20).** The hero rises in on load, the arch's photo settling into the frame. Below it the featured Setups arrive like the Gallery's cards, and the other sections rise softly into view. The phone menu is now a panel that slides down over the page and lifts away. Menu and footer links draw a thin line out from the centre on hover, and pills settle back slightly when pressed. All of it is off under "reduce motion", including colour fades.

- The ticket 13 timings are now tokens in `tokens.css` (`--duration-*`, `--stagger`), and the Gallery and viewer use them. Scroll reveals moved from `gallery.astro` into `src/motion.ts`, which the homepage shares.
- `gallery-reduced-motion.spec.ts` is now `tests/e2e/reduced-motion.spec.ts`, covering the homepage and the phone menu as well as the Gallery.
- The phone menu lies over the page instead of pushing it down, so it can slide without animating height. A tap outside, Escape from anywhere, or tabbing on past the last link closes it. Without JavaScript it still stays open in the header.
- The iPhone touch listener that makes `:active` press states show moved from the Gallery grid into `BaseLayout`, so presses show on every page.
- Polish: desktop menu links are now 44px tall. The closing section's bottom padding was dropped, so the footer gap is the usual 2xl rather than about 9.5rem. The footer links sit on the tagline's baseline, and the Service area line is balanced at 375px.
