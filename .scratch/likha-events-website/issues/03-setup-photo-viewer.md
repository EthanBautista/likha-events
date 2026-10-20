# 03: Setup photo viewer

**What to build:** A visitor taps a Setup in the Gallery and sees all of its photos (the cover plus up to 8 more) in an accessible viewer. They close it with a button, the Escape key or the back gesture, and land back where they were in the gallery. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups and Event type filter)

**Status:** ready-for-agent

- [ ] Tapping a Setup opens a viewer showing all of its photos with the caption
- [ ] The viewer works with a keyboard and a screen reader: focus moves into it and returns to the Setup on close, and photos have descriptions
- [ ] It closes with the close button, Escape, or the browser or phone back gesture, without leaving the Gallery
- [ ] The gallery's scroll position and active filter are kept after closing
- [ ] Playwright tests:
  - opening shows the right number of photos,
  - each way of closing works,
  - the filter survives opening and closing
