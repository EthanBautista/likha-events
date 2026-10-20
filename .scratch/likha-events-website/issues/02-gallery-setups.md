# 02: Gallery: Setups

**What to build:** A visitor opens the Gallery and sees every Setup as a grid of arch-framed cover photos with short captions, newest first. This ticket introduces the Setup content collection, the single Event type list, the shared image component and the sample Setups. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 01 (Site skeleton, brand and test setup)

**Status:** done

- [x] Event types (Baby shower, Birthday, Other) are defined in one place and reused everywhere they appear
- [x] Setup collection schema:
  - required: caption, Event type, cover photo,
  - 0–8 additional photos,
  - featured on homepage (default no),
  - optional date,
  - sample flag
- [x] About 6 sample Setups across all three Event types (2 of them featured), with neutral placeholder images and visibly marked sample
- [x] Photo fields store an image URL (Cloudinary for real photos, see ADR 0002). One shared image component turns a stored URL into a responsive image, using Cloudinary transformations for Cloudinary URLs and plain images for the bundled sample placeholders
- [x] The gallery grid shows cover photos framed in the arch shape, with captions, newest first. Photos are served in responsive sizes and modern formats, and load lazily
- [x] A "Get a quote" link to Contact sits near the gallery
- [x] The build fails on an invalid Setup, such as one with 9 additional photos or no caption. A test builds from a known-bad fixture and asserts the build fails. Later tickets add their own bad cases to this test
- [x] Playwright tests:
  - the grid renders every Setup, newest first,
  - each card shows its caption and cover photo
