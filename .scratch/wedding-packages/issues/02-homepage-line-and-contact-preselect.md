# 02: Homepage wedding line and the contact form's chosen Event type

**What to build:** The homepage's Packages teaser adds "Wedding Packages from $Y", linking to the Wedding Packages section. The contact form chooses the Event type named by `?type=` on load, so the section's "Ask about a Wedding Package" link opens it with Wedding chosen. See the spec: `.scratch/wedding-packages/spec.md`.

**Blocked by:** 01

**Status:** done

- [x] The homepage line shows the lowest Wedding Package price and links to the Wedding Packages section
- [x] The line is left out when there are no Wedding Packages (fixture site)
- [x] `/contact/?type=<slug>` chooses that Event type in the dropdown, using the gallery filter's slugs from the Event types module
- [x] An unknown slug, or none, leaves "Choose one"
- [x] Playwright tests for the homepage line, `?type=wedding` and an unknown type
