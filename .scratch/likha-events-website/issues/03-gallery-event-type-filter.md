# 03: Gallery: Event type filter

**What to build:** A visitor on the Gallery filters Setups by Event type: All, Baby shower, Birthday or Other. The filtered view is reflected in the URL, so it can be shared or linked to. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups)

**Status:** done

- [x] Filter options come from the shared Event type list, plus "All"
- [x] Choosing an Event type shows only matching Setups. "All" shows every Setup
- [x] The filter state is in the URL and is restored on load
- [x] The filter works with a keyboard and a screen reader, and the active option is marked
- [x] Playwright tests, at desktop and 375px phone width:
  - each filter shows only matching Setups,
  - "All" resets the filter,
  - a filtered URL loads already filtered
