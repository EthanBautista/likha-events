# 15: Motion and polish: Packages & Rentals and Contact

**What to build:** Packages & Rentals and Contact feel premium. Packages, Rentals and the booking steps reveal softly on scroll, and the Contact form gives smooth, clear feedback while filling it in, on errors and on sending. The motion matches the rest of the site from tickets 13 and 14. Use the `impeccable` skill: animate first, then polish. It reads PRODUCT.md and DESIGN.md from ticket 12. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 13 (Motion and polish: Gallery and photo viewer)

**Status:** done

- [x] Motion timings and easings are the shared tokens from ticket 13, not redefined
- [x] Packages, Rentals and the "How booking works" steps reveal softly on scroll
- [x] Contact form fields have clear focus states. Error messages appear smoothly, and sending shows clear progress before the thank-you page
- [x] The thank-you page arrives with the same gentle entrance as the rest of the site
- [x] Buttons and links on these pages have consistent hover, press and focus states
- [x] With "reduce motion" turned on, nothing moves: content appears straight away
- [x] A polish pass on spacing, alignment and type across these pages at desktop and 375px
- [x] Existing Playwright tests still pass, and the reduced-motion test from ticket 13 covers these pages

## Comments

**Done (2026-10-20).** Packages, Rentals and the booking steps now rise softly into view, staggered as rows, using the shared `revealOnScroll` from `src/motion.ts`. Rentals arrive like Setup cards, their photos settling into the arch. The thank-you page rises in like the homepage hero, with the brand's arch-and-balloons in sage above the heading.

- Contact errors now show under each field instead of in the browser's popup. They ease in, become the field's description, turn its border brick, and go once the field is answered. A failed send shows every message and focuses the first. The guests field has its own message too.
- While sending, the Send pill reads "Sending your inquiry…" with a turning arc (hidden under "reduce motion"), a status line announces it, and a second press sends nothing. Coming back to the form from the thank-you page resets it.
- Fields deepen to a forest border on hover and focus. The photo picker's button is a small outline pill.
- The booking call to action, Send and the chat buttons are now pills, which closes DESIGN.md's drift notes. The chat buttons fill with paper on hover, since they sit on a sage panel.
- The homepage hero's keyframes are now the shared `rise-in` in `global.css`, used by the thank-you page too.
- `reduced-motion.spec.ts` now covers Packages & Rentals, Contact's errors and sending state, and the thank-you page. `contact.spec.ts` covers the inline messages and the sending state.
- Polish: the space before "Message us for a custom quote" was missing. The booking band now runs down to the footer with a hairline, instead of leaving a strip of paper between two sage bands.
