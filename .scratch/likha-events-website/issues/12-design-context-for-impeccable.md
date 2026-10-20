# 12: Design context for impeccable

**What to build:** The site's product facts and design system are written down once, so each motion-and-polish ticket reads them instead of working them out again. Run `/impeccable init` to write `PRODUCT.md`, then `/impeccable document` to write `DESIGN.md` from the built site. The init step asks the developer a few questions, so someone needs to be around to answer. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 04 (Setup photo viewer), 06 (Packages & Rentals page: Rentals), 08 (Inquiry optional details and inspiration photos), 09 (Homepage)

**Status:** ready-for-agent

- [ ] `PRODUCT.md` records who the site is for (people planning a baby shower or birthday in the GTA), what it must do (show Setups, explain Packages and Rentals, collect Inquiries), and the fixed constraints: no phone number, WCAG AA, the owner edits content from a phone
- [ ] Facts already in the spec, ADRs and GLOSSARY.md are pulled from there rather than asked again
- [ ] `DESIGN.md` records the design system as built: brand colour, type and spacing tokens, the arch motif, and the shared components
- [ ] Neither file invents a new look or changes the site. This ticket only writes the two files
