# 03: The gallery filter grows with the portfolio

**What to build:** However many Event types the owner adds, the gallery filter stays tidy. A pill appears only once an Event type has a Setup, so a new type turns up in the gallery as soon as he publishes a Setup for it. Pills are ordered by how many Setups they have. On a phone they sit in one row the visitor swipes sideways, and on desktop they wrap. The filter row is restyled to the direction chosen in 02, along with any card fixes the critique found. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Gallery filter).

**Blocked by:** 01 (The owner manages Event types), 02 (Critique and prototype directions)

**Status:** ready-for-agent

- [ ] Only Event types with at least one Setup (by effective Event type) get a pill. The others aren't in the page at all
- [ ] Pill order: All first, then by number of Setups (most first, ties alphabetical), Other last
- [ ] On a narrow screen the pills form one row that scrolls sideways with scroll-snap, with no visible scrollbar, and the last visible pill cut off at the edge. On a wide screen they wrap
- [ ] Loading a filtered link scrolls its pill into view
- [ ] A `?type=` that is unknown or has no Setups shows every Setup with All chosen
- [ ] Single-select, URL sharing, the "Showing N Setups" status and keyboard use work as now, and the filter is still hidden without JavaScript
- [ ] The filter row is restyled to the direction chosen in 02, and any card fixes the critique called for are made
- [ ] The gallery filter spec is updated for the new order and still covers the seeded types' links (such as the homepage's "baby showers only")
- [ ] A fixture site with many Event types, some with no Setups, checks the pills shown and their order, and that the contact form still lists them all
- [ ] A phone-sized test checks the filter is one row that scrolls, and that a filtered link brings its pill into view
- [ ] Reduced-motion and axe checks still pass
