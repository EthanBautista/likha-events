# 02: Gallery: Setups and Event type filter

**What to build:** A visitor opens the Gallery and sees every Setup as a grid of arch-framed cover photos with short captions, newest first. They can filter by Event type: All, Baby shower, Birthday or Other. The filtered view is reflected in the URL, so it can be shared or linked to. This ticket introduces the Setup content collection, the single Event type list and the sample Setups. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 01 (Site skeleton, brand and test setup)

**Status:** ready-for-agent

- [ ] Event types (Baby shower, Birthday, Other) are defined in one place and reused everywhere they appear
- [ ] Setup collection schema:
  - required: caption, Event type, cover photo,
  - 0–8 additional photos,
  - featured on homepage (default no),
  - optional date,
  - sample flag
- [ ] About 6 sample Setups across all three Event types (2 of them featured), with neutral placeholder images and visibly marked sample
- [ ] Photo fields store an image URL (Cloudinary for real photos, see ADR 0002). One shared image component turns a stored URL into a responsive image, using Cloudinary transformations for Cloudinary URLs and plain images for the bundled sample placeholders
- [ ] The gallery grid shows cover photos framed in the arch shape, with captions. Photos are served in responsive sizes and modern formats, and load lazily
- [ ] Filtering by Event type works, with an "All" option. The filter state is in the URL and is restored on load
- [ ] A "Get a quote" link to Contact sits near the gallery
- [ ] The build fails on an invalid Setup, such as one with 9 additional photos or no caption. A test builds from a known-bad fixture and asserts the build fails
- [ ] Playwright tests:
  - the grid renders,
  - each filter shows only matching Setups,
  - "All" resets the filter,
  - a filtered URL loads already filtered
