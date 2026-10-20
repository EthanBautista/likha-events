# 01: Site skeleton, brand and test setup

**What to build:** A visitor can open the Likha Events site and move between Home, Gallery, Packages & Rentals and Contact through a menu that collapses into a menu button on phones. The pages have placeholder content for now. Every page shows the Likha logo, uses the brand colours and fonts, and has a footer with Instagram and Facebook links.

This ticket also lays the groundwork every later ticket builds on:
- design tokens,
- the shared page layout,
- site settings (social links),
- the Netlify config,
- the Playwright test harness, run against the production build.

See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The Astro site builds and runs locally, and tests run against a served production build
- [x] The logo and arch motif are extracted as vector artwork from the brand guide PDF, and the logo is used in the header
- [x] Brand colours are defined once as design tokens: off-white background, charcoal text, forest-green actions, sage bands. Text contrast meets WCAG AA
- [x] Headings use an elegant self-hosted serif, and body text uses a clean sans-serif
- [x] The menu shows Home · Gallery · Packages & Rentals · Contact, with the current page marked. Below tablet width it collapses into an accessible menu button
- [x] The footer on every page links to https://www.instagram.com/likha.events and https://www.facebook.com/p/LIKHA-Events-61581441256098/. Both links are defined once, in site settings
- [x] Every page title follows "<Page> · Likha Events", and every page has a unique description and Open Graph tags
- [x] Netlify build config is in place
- [x] Playwright tests, at desktop and 375px phone width:
  - the menu reaches all four pages,
  - the phone menu opens and closes,
  - no page scrolls sideways,
  - page titles follow the pattern,
  - no phone number appears anywhere
