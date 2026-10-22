# 01: Wedding Packages on the Packages & Rentals page

**What to build:** The owner edits Wedding Packages in their own list in the editor. Visitors see them in a "Wedding Packages from $Y" section between Packages and Rentals, while "Packages from $X" stays at the regular Packages' price. See the spec: `.scratch/wedding-packages/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A Wedding Packages collection, checked by the Package schema (reused, not copied)
- [x] About 2 sample Wedding Packages, priced above the regular Packages and marked sample
- [x] The Packages module gives Wedding Packages in display order and their lowest price (undefined when there are none)
- [x] A "Wedding Packages from $Y" section between Packages and Rentals, using the Package card, with an "Ask about a Wedding Package" link to `/contact/?type=wedding`
- [x] The section is left out when there are no Wedding Packages (fixture site)
- [x] "Packages from $X" still uses only the regular Packages
- [x] A "Wedding Packages" list in the editor with the same fields, hints and next-display-order default as Packages, covered by the editor config test
- [x] The build fails on an invalid Wedding Package: a new invalid-content case
- [x] Playwright tests: fields and order, both "from" prices, the section's position
