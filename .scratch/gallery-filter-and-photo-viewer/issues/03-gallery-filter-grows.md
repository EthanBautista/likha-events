# 03: The gallery filter grows with the portfolio

**What to build:** However many Event types the owner adds, the gallery filter stays tidy. A pill appears only once an Event type has a Setup, so a new type turns up in the gallery as soon as he publishes a Setup for it. Pills are ordered by how many Setups they have. On a phone they sit in one row the visitor swipes sideways, and on desktop they wrap. The filter row is restyled to the direction chosen in 02, along with any card fixes the critique found. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Gallery filter).

**Blocked by:** 01 (The owner manages Event types), 02 (Critique and prototype directions)

**Status:** done

- [x] Only Event types with at least one Setup (by effective Event type) get a pill. The others aren't in the page at all
- [x] Pill order: All first, then by number of Setups (most first, ties alphabetical), Other last
- [x] On a narrow screen the pills form one row that scrolls sideways with scroll-snap, with no visible scrollbar, and the last visible pill cut off at the edge. On a wide screen they wrap
- [x] Loading a filtered link scrolls its pill into view
- [x] A `?type=` that is unknown or has no Setups shows every Setup with All chosen
- [x] Single-select, URL sharing, the "Showing N Setups" status and keyboard use work as now, and the filter is still hidden without JavaScript
- [x] The filter row is restyled to the direction chosen in 02, and any card fixes the critique called for are made
- [x] The gallery filter spec is updated for the new order and still covers the seeded types' links (such as the homepage's "baby showers only")
- [x] A fixture site with many Event types, some with no Setups, checks the pills shown and their order, and that the contact form still lists them all
- [x] A phone-sized test checks the filter is one row that scrolls, and that a filtered link brings its pill into view
- [x] Reduced-motion and axe checks still pass

## Comments

### Built (2026-10-21)

- **Which pills, and their order,** were already right from ticket 01's Event types module. This ticket locks them in with tests: the gallery filter spec checks the order against the sample Setups, and a new fixture site (`many-event-types`, ten Event types, three with no Setups and two Setups under a type that isn't on the list) checks the pills, their order, a link to a type with no Setups, and that the contact form still lists all ten plus Other.
- **Layout.** Under 48rem the pills are one row that scrolls sideways with soft scroll-snap (`proximity`) and no scrollbar. The row runs past the page gutter to the screen's edges, so the last pill in view is cut off there. On load, and on each choice, the chosen pill is scrolled to the middle of the row (instantly under reduce motion). From 48rem the pills wrap.
- **Restyle.** Direction B was chosen for the Photo viewer, so the developer kept the filter's forest chips (outline pills, solid forest gliding highlight). The restyle is the edge-to-edge swipe row, plus the critique's `.intro` spacing (`xl` → `lg`), which lifts the first card on a phone. The "two forest blobs" note (the solid Get a quote beside the solid selected All) stays open.
- **Card fix.** The first three Gallery covers load eagerly, and the first with `fetchpriority="high"`. The homepage needed nothing: its hero already loads the first homepage Setup's cover that way, and its cards sit below it.
- DESIGN.md now describes the filter's order and phone/desktop layout, and its motion section no longer calls the filter a View Transition.
- With only four sample pills, the e2e phone test can't prove the row scrolls (the samples may fit at 375px). The fixture site's phone tests do.
