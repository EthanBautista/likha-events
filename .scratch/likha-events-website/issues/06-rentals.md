# 06: Packages & Rentals page: Rentals

**What to build:** A visitor on Packages & Rentals sees a Rentals section, separate from the Packages, listing each Rental with its name, photo, price per event and a one-line description. This ticket introduces the Rental collection, with sample content. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 05 (Packages & Rentals page: Packages and booking)

**Status:** ready-for-agent

- [ ] Rental collection schema:
  - required: name, photo, price per event in CAD, one-line description,
  - display order,
  - sample flag
- [ ] Rental photos go through the shared image component from ticket 02
- [ ] 3 sample Rentals, visibly marked sample
- [ ] Rentals render in display order, in their own section after the Packages
- [ ] The build fails on an invalid Rental, such as one with no price. This is a new case in the known-bad fixture test
- [ ] Playwright tests:
  - each Rental renders with its fields, in display order,
  - the Rentals section is separate from the Packages
