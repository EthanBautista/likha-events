# 05: Packages & Rentals page: Packages and booking

**What to build:** A visitor opens Packages & Rentals and sees:
- the Packages (name, price, what's included) under "Packages from $X", with a "message us for a custom quote" link,
- a "How booking works" section: inquiry, then quote, then a 50% non-refundable Down payment to hold the date, plus a travel fee outside the GTA.

This ticket introduces the Package collection, with sample content. Rentals come in ticket 06. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups), which provides the known-bad fixture test

**Status:** ready-for-agent

- [ ] Package collection schema:
  - required: name, price in CAD (whole dollars), what's included (list), display order,
  - sample flag
- [ ] 3 sample Packages (the cheapest at $450), visibly marked sample
- [ ] Packages render in display order
- [ ] "Packages from $X" uses the lowest Package price from the content, not a hard-coded value. The value is exposed so the homepage can reuse it
- [ ] A custom-quote link and a link to Contact
- [ ] A "How booking works" section on a sage band, with the Down payment and travel-fee wording
- [ ] The build fails on an invalid Package, such as one with no price. This is a new case in the known-bad fixture test
- [ ] Playwright tests:
  - each Package renders with its fields, in display order,
  - "from $X" matches the cheapest Package,
  - the booking steps and travel-fee note are present
