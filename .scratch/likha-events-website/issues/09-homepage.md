# 09: Homepage

**What to build:** A visitor lands on the homepage and sees, top to bottom:
1. the logo, "We create. You celebrate.", one photo in an arch frame, and a "Get a quote" button,
2. three featured Setups, with a "See the gallery" link,
3. a "Packages from $X" teaser, with a line about Rentals,
4. "Based in North York, serving the whole GTA.",
5. a closing "Planning an event? Send an inquiry" section, with the Instagram link.

See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups), 05 (Packages & Rentals page: Packages and booking)

**Status:** ready-for-agent

- [ ] A hero with the logo, the tagline, an arch-framed photo, and a "Get a quote" button linking to Contact
- [ ] Up to three featured Setups, newest first. When fewer than three are featured, the newest unfeatured Setups fill the gap
- [ ] A "See the gallery" link
- [ ] The "Packages from $X" teaser uses the same lowest-price value as the Packages page, plus a line about Rentals linking there
- [ ] The Service area line
- [ ] A closing inquiry call to action, with the Instagram link
- [ ] Playwright tests:
  - the sections render in order,
  - the featured fallback works, using a fixture with only one featured Setup,
  - "from $X" matches the cheapest Package,
  - all links go to the right pages
