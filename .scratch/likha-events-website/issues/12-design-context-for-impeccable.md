# 12: Design context for impeccable

**What to build:** The site's product facts and design system are written down once, so each motion-and-polish ticket reads them instead of working them out again. Run `/impeccable init` to write `PRODUCT.md`, then `/impeccable document` to write `DESIGN.md` from the built site. The init step asks the developer a few questions, so someone needs to be around to answer. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 04 (Setup photo viewer), 06 (Packages & Rentals page: Rentals), 08 (Inquiry optional details and inspiration photos), 09 (Homepage)

**Status:** done

- [x] `PRODUCT.md` records who the site is for (people planning a baby shower or birthday in the GTA), what it must do (show Setups, explain Packages and Rentals, collect Inquiries), and the fixed constraints: no phone number, WCAG AA, the owner edits content from a phone
- [x] Facts already in the spec, ADRs and GLOSSARY.md are pulled from there rather than asked again
- [x] `DESIGN.md` records the design system as built: brand colour, type and spacing tokens, the arch motif, and the shared components
- [x] Neither file invents a new look or changes the site. This ticket only writes the two files

## Comments

**Done (2026-10-20).** PRODUCT.md and DESIGN.md are at the repo root. `.impeccable/design.json` is the sidecar that `/impeccable document` writes alongside DESIGN.md. No site files changed.

- The developer was interviewed for the facts the repo didn't have:
  - positioning: designed, not just set up; full service; the style follows the customer's request, elevated but not necessarily calm;
  - voice: warm and plain;
  - evidence: several bookings done, few reviews yet, so nothing may be invented;
  - North Star: "The Party Atelier";
  - component feel: soft and assured.
- **For tickets 13 to 15:** pills are the standard call-to-action shape. DESIGN.md (Components, Buttons, "Drift to fix") lists the calls to action that are still rectangles: Gallery's "Get a quote", the Packages booking call to action, Contact's Send button and its chat buttons. Some also miss the 44px height, and the chat buttons use a different hover. The desktop menu links are about 40px tall, under the 44px target.
