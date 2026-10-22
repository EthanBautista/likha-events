Status: ready-for-agent

# Spec: Wedding Packages

## Problem Statement

Likha Events does weddings, but the site has one list of Packages under "Packages from $450". A couple planning a wedding can't tell whether Likha Events does weddings, or what one costs. If wedding-priced Packages went into the same list, they would sit among the $450 baby shower Packages and blur both prices.

## Solution

Wedding Packages become their own list, with the same fields as a Package. The owner edits them in a separate "Wedding Packages" list in the editor. The Packages & Rentals page shows them in their own "Wedding Packages from $Y" section, between Packages and Rentals, and the homepage adds one line pointing to it. The section's inquiry link opens the contact form with Wedding already chosen. "Packages from $X" keeps counting only the other Packages, so it stays at $450. The site ships with about 2 sample Wedding Packages marked "Sample" until the owner enters the real ones.

## User Stories

1. As a couple planning a wedding, I want a Wedding Packages section, so that I know Likha Events does weddings and what it costs.
2. As a couple planning a wedding, I want each Wedding Package to show its name, price and what's included, so that I can compare them.
3. As a couple planning a wedding, I want the section to say "Wedding Packages from $Y", so that I know the starting price before I inquire.
4. As a visitor planning a baby shower, I want "Packages from $X" to still show the price of the regular Packages, so that wedding prices don't put me off.
5. As a couple planning a wedding, I want a link from the Wedding Packages section to the contact form with Wedding already chosen, so that I save a step.
6. As a visitor on the homepage, I want a line saying "Wedding Packages from $Y", so that I learn Likha Events does weddings without hunting for it.
7. As the owner, I want a separate "Wedding Packages" list in the editor, so that I can't put a wedding Package among the regular ones by mistake.
8. As the owner, I want to add, edit, remove and reorder Wedding Packages the same way as Packages, so that there's nothing new to learn.
9. As the owner, I want the editor to stop me saving a Wedding Package with a required field missing, so that I can't break the site.
10. As the owner, I want the Wedding Packages section and the homepage line to disappear if I remove every Wedding Package, so that the site never shows an empty section.
11. As the developer, I want sample Wedding Packages marked "Sample", so that the section can be seen and tested before the owner sends the real ones.

## Implementation Decisions

- **A new content collection, Wedding Packages**, in its own folder, checked by the same schema as Packages (name, price in whole CAD dollars, what's included, display order, sample flag). It reuses the Package schema rather than copying it, so the two can't drift.
- **Editor:** a "Wedding Packages" folder collection beside Packages, with the same fields, hints and next-display-order default. The editor config test covers it the same way it covers Packages.
- **The Packages module** gains Wedding Packages in display order and their lowest price, with the same "undefined when there are none" behaviour as Packages. "Packages from $X" keeps reading only the Packages collection.
- **Packages & Rentals page:** a "Wedding Packages from $Y" section between Packages and Rentals, using the existing Package card, with a one-line lead and an "Ask about a Wedding Package" link to `/contact/?type=wedding`. When there are no Wedding Packages, the whole section is left out.
- **Homepage:** one line in the Packages teaser, "Wedding Packages from $Y", linking to the Wedding Packages section on the Packages & Rentals page. Left out when there are none.
- **Contact form:** a `?type=` in the URL, using the same slug as the gallery filter, chooses that Event type in the dropdown on load. An unknown slug, or none, leaves "Choose one". Wedding is already on the owner's Event types list, so no content change is needed.
- **Sample content:** about 2 sample Wedding Packages, priced clearly above the regular Packages and marked sample.

## Testing Decisions

- Test only what a visitor or the owner sees and does, as the existing suites do.
- **Playwright e2e** (prior art: `packages-and-rentals.spec.ts`, `homepage.spec.ts`, `contact.spec.ts`):
  - The Wedding Packages render with their fields, in display order, in their own section between Packages and Rentals.
  - "Wedding Packages from $Y" matches the cheapest Wedding Package, and "Packages from $X" still matches the cheapest regular Package.
  - The homepage line shows the Wedding Packages' lowest price and links to the section.
  - `/contact/?type=wedding` opens with Wedding chosen. An unknown type leaves "Choose one".
- **Fixture site** (prior art: `tests/fixture-sites/`): with no Wedding Packages, the section and the homepage line are absent and the build succeeds.
- **Build gate** (prior art: the invalid-content spec): an invalid Wedding Package, such as one with no price, fails the build.
- **Editor config test:** the Wedding Packages collection's fields match the schema.

## Out of Scope

- Wedding-specific fields (ceremony and reception parts, add-ons, "from" prices) and wedding-specific booking terms. Wedding Packages have the same shape and terms as Packages.
- A general way to group Packages (for example a "Corporate" group).
- Choosing a Package on the contact form.

## Further Notes

- Glossary: **Wedding Package** was added. Wedding Packages are still Packages, listed apart.
- Wedding was seeded on the Event types list by the gallery-filter spec. If the owner removes it, `?type=wedding` just leaves "Choose one".
