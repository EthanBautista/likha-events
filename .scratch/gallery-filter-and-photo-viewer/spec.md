Status: ready-for-agent

# Spec: Owner-managed Event types, a filter that grows, and a better Photo viewer

## Problem Statement

Likha Events takes any kind of event: baby showers, birthdays, gender reveals, proposals, anniversaries, weddings and more. The site only knows three Event types (Baby shower, Birthday, Other), and they are fixed in code. When the owner does a bridal shower or a graduation, it disappears into Other, and only the developer can add a new type. As the portfolio grows, the gallery's wrapping row of filter pills will become a wall of pills on a phone, and the gallery page will hold every Setup and every photo at once.

The Photo viewer also feels cheap and junior. It's one long vertical scroll of photos on the cream page, under a heavy bordered bar. A visitor can't tell how many photos a Setup has or where they are among them, and there's no way to move one photo at a time the way they would in a phone's photo app.

## Solution

Event types become a list the owner manages in the editor. They start with Baby shower, Birthday, Gender reveal, Proposal, Anniversary, Wedding and Other, and he can add new ones (such as Bridal shower) himself. A Setup picks its Event type from that list. The gallery filter shows a pill only for Event types that have at least one Setup, so a new type appears in the gallery as soon as he publishes a Setup for it. The contact form offers the whole list, because it describes the events he accepts, not only the ones he has photos of.

The filter stays single-select and shareable through `?type=`. On phones it becomes one row that swipes sideways, and on desktop it wraps. Pills are ordered by how many Setups they have, with All first and Other last.

The Photo viewer becomes an immersive, full-screen view that shows one photo at a time. On a phone the visitor swipes between photos natively. On desktop they use arrow buttons, the arrow keys, or a row of thumbnails. A "3 / 8" counter shows where they are. Photos show whole and uncropped. The tapped card's photo grows into the viewer and shrinks back into the card on close. The visual direction is chosen from prototypes after an Impeccable critique, not decided up front.

## User Stories

### Event types (owner)

1. As the owner, I want to add a new Event type from the editor on my phone, so that I can show any kind of event I do without asking the developer.
2. As the owner, I want the Event type on a Setup to be picked from a list, so that a typo can't create a duplicate type such as "bridal Shower".
3. As the owner, I want a new Event type to need adding only once, so that every later Setup of that kind just picks it.
4. As the owner, I want the Event types list to start with Baby shower, Birthday, Gender reveal, Proposal, Anniversary, Wedding and Other, so that the events I already do are ready to use.
5. As the owner, I want Other to always be there, so that a one-off event always has somewhere to go.
6. As the owner, I want to be unable to remove or rename Other, so that the catch-all can never go missing.
7. As the owner, I want to rename an Event type, so that I can fix its wording later.
8. As the owner, I want Setups whose Event type I removed to still appear on the site (under Other), so that deleting a type never breaks the site or hides my work.
9. As the owner, I want the Event types in the editor's dropdown listed alphabetically with Other last, so that I can find one quickly.
10. As the owner, I want the owner guide to explain adding, renaming and removing Event types, so that I can do it without help.
11. As the owner, I want the owner guide to tell me when to give a kind of event its own type (about 2–3 Setups of it under Other), so that Other doesn't become a dumping ground.
12. As the owner, I want the editor to refuse to save a Setup without an Event type, with a message saying what to fix, so that a forgotten field never stops the site from publishing.
13. As the owner, I want the editor to refuse a blank Event type name, or one made only of spaces, so that the list can't hold an empty pill.
14. As the owner, I want the editor to refuse "Other" as a name on the list, so that I don't end up with two Others.
15. As the owner, I want a type I add twice (such as "Wedding" and "wedding ") to show up only once on the site, so that a slip in the list never doubles a pill.

### Gallery filter (visitor)

16. As a visitor, I want to see a filter pill only for Event types that have Setups, so that no pill leads to an empty gallery.
17. As a visitor, I want a new kind of event to appear in the filter as soon as the owner publishes a Setup for it, so that the gallery reflects all of his work.
18. As a visitor, I want All to come first, so that I can always get back to everything.
19. As a visitor, I want the Event types with the most Setups to come first, so that the strongest parts of the portfolio are easiest to reach.
20. As a visitor, I want Other to come last, so that the named occasions come first.
21. As a visitor on a phone, I want the filter to stay on one row that I can swipe sideways, so that a long list of Event types doesn't push the photos off the screen.
22. As a visitor on a phone, I want the last visible pill cut off at the edge of the screen, so that I can tell the row scrolls.
23. As a visitor on a phone, I want the chosen pill to be scrolled into view when the page loads from a filtered link, so that I can see which Event type I'm looking at.
24. As a visitor on desktop, I want the pills to wrap onto more rows, so that I can see every Event type at once.
25. As a visitor, I want to choose one Event type at a time, so that I see exactly the occasion I'm planning.
26. As a visitor, I want the chosen Event type kept in the URL, so that I can share or bookmark a filtered gallery.
27. As a visitor, I want a link to an Event type that has no Setups (or doesn't exist) to show every Setup, so that an old or mistyped link still shows the work.
28. As a keyboard or screen reader visitor, I want the filter to keep working from the keyboard and announcing how many Setups are shown, so that the swipeable row isn't a step back for me.

### Photo viewer (visitor)

29. As a visitor, I want the viewer to show one photo at a time, filling the screen, so that each photo gets my full attention.
30. As a visitor on a phone, I want to swipe sideways between photos, with the photo following my finger, so that it feels like my phone's own photo app.
31. As a visitor on desktop, I want previous and next arrow buttons beside the photo, so that I can move with the mouse.
32. As a keyboard visitor, I want the left and right arrow keys to move between photos, so that I don't have to reach for the buttons.
33. As a visitor, I want a "3 / 8" counter, so that I know how many photos there are and where I am.
34. As a visitor on desktop, I want a row of thumbnails, so that I can jump straight to any photo.
35. As a visitor, I want the thumbnail of the current photo marked, so that I can see where I am in the row.
36. As a visitor on a phone, I want no thumbnails, so that the photo has the whole screen.
37. As a visitor, I want the previous button hidden or disabled on the first photo and the next button on the last, so that I know I've reached an end.
38. As a visitor, I want each photo shown whole and uncropped, portrait or landscape, so that I see the full Setup.
39. As a visitor on a phone, I want to pinch to zoom into a photo, so that I can look at details such as the cake or the balloons.
40. As a visitor, I want the viewer to open on the cover photo I tapped, so that it continues from what I chose.
41. As a visitor, I want the tapped card's photo to grow smoothly into the viewer and shrink back into the card on close, so that I can see where I came from and where I return to.
42. As a visitor with "reduce motion" turned on, I want the viewer to open, close and change photos without movement, so that nothing moves that I asked not to.
43. As a visitor, I want the caption and Close button to stay quietly at the top, so that the photo stays the focus.
44. As a visitor, I want the viewer to look polished and intentional, so that I trust Likha Events with my event.
45. As a visitor, I want the back gesture, Escape and Close to still close the viewer and return me to the card, so that nothing I'm used to breaks.
46. As a screen reader visitor, I want each photo announced with its position (for example "photo 3 of 8") and the counter's change announced politely, so that I can follow along.
47. As a visitor on a slow connection, I want photos further along to load only as I approach them, so that the viewer opens quickly.

### Contact form (visitor)

48. As a visitor planning an event, I want the contact form's Event type dropdown to list every Event type the owner has added, even ones not in the gallery yet, so that I can pick my occasion.
49. As a visitor, I want Other at the end of that dropdown, so that I can still send an Inquiry for an unusual event.

### Growth

50. As a visitor, I want the gallery to stay fast once the portfolio is large, so that I don't wait for dozens of Setups to load (see Further Notes for when "Show more" is added).

## Implementation Decisions

### Event types become content

- Event types stop being a fixed list in code. They become one content entry the owner edits: a single "Event types" list in the editor (a file collection in Sveltia CMS, ADR 0001), holding the names.
- The list is seeded with: Anniversary, Baby shower, Birthday, Gender reveal, Proposal, Wedding. **Other** is not stored in the list. The site always adds it, so it can't be deleted or renamed.
- A Setup's Event type field changes from a fixed select to a pick from that list (a relation-style select fed by the list, plus Other). The editor config test must still prove the editor can't save what the build would reject.
- The Setup schema's Event type becomes a non-empty string instead of a fixed enum. It's no longer checked against the list at build time. A deliberate trade-off, made on purpose: a Setup whose Event type isn't on the list (because the type was removed or renamed) is **shown as Other**, and the build doesn't fail. This keeps the site working when the owner tidies up the list.
- **Guardrails, so a blank Event type never reaches the build.** The build still rejects a Setup with a blank Event type, as the last line of defence. The editor stops it long before that:
  - The Setup's Event type field is required and offers only names from the list plus Other, so there's nothing to type into. If he tries to save without one, the editor shows a message next to the field and doesn't save.
  - A new Setup starts with no Event type chosen. It doesn't default to Other, because a default would hide a forgotten choice.
  - Each name on the Event types list must contain something other than spaces (the same "Write something here, not just spaces" rule the editor already uses). A blank entry can't be saved.
  - "Other" (in any capitals) is refused as a name on the list, with a message saying Other is always there.
  - The site trims every name and treats names that differ only in capitals or spaces as one Event type, keeping the first spelling. A duplicate slip in the list never makes two pills, two dropdown options or two `?type=` slugs.
  - The editor config test proves that each of these editor rules matches what the build and the Event types module accept, as it already does for the other fields.
- One module still owns "what are the Event types" for the whole site, and the gallery, contact form and editor read only from it. It gives:
  - every Event type for forms: the list sorted alphabetically, then Other;
  - a Setup's effective Event type: its stored type if that's on the list, otherwise Other;
  - the gallery's Event types: those with at least one Setup (by effective type), ordered by Setup count, highest first, ties alphabetical, Other last;
  - the slug of each type for `?type=`, unchanged (lowercase, spaces become hyphens). Renaming a type changes its slug, which is accepted.
- The existing sample Setups keep their types. The graduation and bridal brunch samples stay under Other, since no Graduation or Bridal shower type is seeded.

### Gallery filter

- Single-select, the URL behaviour as now, and the "Showing N Setups" status as now.
- An unknown `?type=`, or one for a type with no Setups, shows every Setup with All chosen.
- Layout: on narrow screens, one row with horizontal scroll and scroll-snap, no visible scrollbar, and padding that leaves the last visible pill cut off at the screen edge. On wider screens, it wraps. On load the chosen pill is scrolled into view.
- The filter still stays hidden without JavaScript, as now.
- The filter reads which pills to render from the Event types module, so pills with no Setups are never in the page at all.

### Photo viewer

- Still a modal dialog per Setup, opened by the existing card button. History, back gesture, Escape, Close and focus return stay exactly as now.
- The photos become a horizontal scroll-snap track, one photo per screen, so swiping is the browser's own native scroll. JavaScript only adds the extras (counter, buttons, keys, thumbnails), and without it the photos are still a track you can swipe or scroll.
- The counter "N / total" updates as the track settles on a photo. Each photo's alternative text keeps "photo N of total".
- On desktop (wide screens with a fine pointer), it adds previous/next buttons beside the photo, the left/right arrow keys, and a thumbnail row below that jumps to a photo and marks the current one. On phones there are no thumbnails and no arrows, only the counter.
- At the first and last photo the matching button is disabled. There's no wrap-around.
- Photos are shown whole (contain, not cover), with slightly rounded corners, fitting the space left after the caption and counter. They're not arch-cropped.
- Pinch-zoom is left to the browser. There's no custom zoom.
- Photos other than the cover load lazily.
- Opening runs a View Transition from the tapped card's photo to the viewer's first photo, and closing runs it back to the card. Under reduced motion, or without View Transitions, the viewer fades or simply appears, matching the existing reduced-motion rules.
- There's no previous/next Setup control.

### Visual direction

- Run an Impeccable critique of the current viewer, filter and gallery cards first. It reads PRODUCT.md and DESIGN.md.
- Build 2–3 throwaway prototype directions for the viewer's look (starting with the warm charcoal already used behind the viewer, plus one or two alternatives, such as deep sage, or cream done properly). The owner and developer compare them on a phone, and the chosen one is built.
- In scope for redesign: the viewer and the filter row. The cards change only if the critique finds real problems.
- Record the chosen direction in DESIGN.md once built.

### Contact form

- The Event type dropdown lists every Event type (alphabetical, Other last) from the Event types module.

## Testing Decisions

- Tests check only what a visitor or the owner can see and do: the pills shown and their order, the URL, the photo shown, the counter, focus, history. They never check internal helpers or class names. That matches the existing suites.
- **Playwright e2e on the built site** (prior art: the gallery filter, Setup viewer, reduced motion and contact specs):
  - Update the gallery filter spec. Pills match the Event types that have sample Setups, in count order with All first and Other last. URL sharing, loading from a link, unknown types and the keyboard/status behaviour still pass.
  - On a phone-sized viewport, the filter is one row and scrolls sideways, and a filtered link scrolls its pill into view.
  - Update the Setup viewer spec. It opens on the cover. The counter reads "1 / N". Next/previous buttons and arrow keys move one photo and update the counter. A thumbnail jumps to its photo. The buttons are disabled at each end. On a phone-sized viewport, no thumbnails or arrows are shown, and swiping (scrolling the track) changes the counter. The existing close/back/focus/history tests and the axe check still pass.
  - Reduced motion: the viewer and photo changes show straight away with no running animations (extend the existing reduced-motion spec).
  - Contact form: the Event type dropdown lists every Event type alphabetically with Other last.
- **Fixture sites** (prior art: the homepage featured-fallback fixture) for content the samples can't show:
  - Many Event types, some with no Setups. Only types with Setups get pills, in count order. The contact form lists all of them.
  - A Setup whose Event type isn't on the list. It appears under Other, and the build succeeds.
  - An Event types list holding the same name twice in different capitals or spacing gives one pill and one contact form option.
- **Editor config test** (prior art: the existing editor config spec):
  - The Event types list field exists, and its name pattern rejects blank, spaces-only and "Other" in any capitals.
  - The Setup's Event type field is required, has no default, and picks only from that list plus Other.
  - The editor still can't save a Setup the build would reject.
- **Build gate** (prior art: the invalid-content spec, where each bad case is one file):
  - Add bad-Setup cases for a missing Event type, an empty one, and one made only of spaces. Each must fail the build.
  - A Setup with an Event type that isn't on the list must build, and shows under Other.

## Out of Scope

- Multi-select filtering.
- Previous/next Setup inside the viewer.
- Per-photo captions, Setup details (date, what was included) and a "Get a quote" call to action inside the viewer.
- A custom zoom control.
- "Show more" on the gallery and a "More" menu for the filter (see Further Notes for when they arrive).
- Redesigning the gallery cards, unless the critique calls for it.
- Grouping Event types (for example "Weddings & engagements").
- Keeping old `?type=` links working after a rename.

## Further Notes

- **Growth thresholds, recorded so they aren't forgotten:**
  - At about 30 Setups, add "Show more" to the gallery in steps of 12, applied after the filter.
  - At about 12 Event types with Setups, revisit the filter with a "top types + More" menu.
- The gallery-filter spec currently writes the Event types and their URLs out by hand, so links such as the homepage's "baby showers only" keep working. Keep that intent for the seeded types whose links are used elsewhere on the site.
- The current viewer has known gaps (ticket 13's comments): photos have no stored dimensions, and Firefox closes the viewer instantly. The one-at-a-time layout needs the photo space reserved, so check this again while building it.
- The glossary terms stay as they are: Setup, Event type, Photo viewer, Inquiry. The owner adds Event types, not "categories".
