# 14: Motion and polish: Homepage, header and footer

**What to build:** The Homepage and the shared header and footer feel premium. The hero arrives gracefully, homepage sections reveal softly on scroll, the phone menu slides open, and header and footer links respond gently. The motion matches the Gallery's from ticket 13, so the site feels like one piece. Use the `impeccable` skill: animate first, then polish. It reads PRODUCT.md and DESIGN.md from ticket 12. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 13 (Motion and polish: Gallery and photo viewer)

**Status:** ready-for-agent

- [ ] Motion timings and easings are the shared tokens from ticket 13, not redefined
- [ ] The homepage hero (logo, tagline, arch photo, "Get a quote") arrives with a short, gentle entrance
- [ ] The featured Setups, the Packages teaser, the Service area line and the closing call to action reveal softly on scroll
- [ ] The phone menu slides open and closed instead of appearing instantly
- [ ] Header, footer and homepage buttons and links have consistent hover, press and focus states
- [ ] With "reduce motion" turned on, nothing moves: content appears straight away
- [ ] A polish pass on spacing, alignment and type across the homepage, header and footer at desktop and 375px
- [ ] Existing Playwright tests still pass, and the reduced-motion test from ticket 13 covers the homepage and the phone menu
