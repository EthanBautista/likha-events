# 04: Packages & Rentals page

**What to build:** A visitor opens Packages & Rentals and sees:
- the Packages (name, price, what's included) under "Packages from $X", with a "message us for a custom quote" link,
- a separate Rentals section (name, photo, price per event, one-line description),
- a "How booking works" section: inquiry, then quote, then a 50% non-refundable Down payment to hold the date, plus a travel fee outside the GTA.

This ticket introduces the Package and Rental collections, with sample content. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 01 (Site skeleton, brand and test setup)

**Status:** ready-for-agent

- [ ] Package collection schema:
  - required: name, price in CAD (whole dollars), what's included (list), display order,
  - sample flag
- [ ] Rental collection schema:
  - required: name, photo, price per event in CAD, one-line description,
  - display order,
  - sample flag
- [ ] Rental photos go through the shared image component from ticket 02
- [ ] 3 sample Packages (the cheapest at $450) and 3 sample Rentals, visibly marked sample
- [ ] Packages and Rentals render in display order, in separate sections
- [ ] "Packages from $X" uses the lowest Package price from the content, not a hard-coded value. The value is exposed so the homepage can reuse it
- [ ] A custom-quote link and a link to Contact
- [ ] A "How booking works" section on a sage band, with the Down payment and travel-fee wording
- [ ] The build fails on an invalid Package or Rental, such as a Rental with no price. This is covered by the known-bad fixture test
- [ ] Playwright tests:
  - both sections render with their fields,
  - "from $X" matches the cheapest Package,
  - the booking steps and travel-fee note are present
