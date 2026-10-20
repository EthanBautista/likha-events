# 11: Editor photo uploads

**What to build:** The owner adds photos to a Setup or Rental in `/admin` by choosing them from their phone. The photos upload straight to Cloudinary, shrunk to a sensible size, and the content stores the photo URL. The owner gets a short plain-language guide to adding a Setup from their phone. See the spec, ADR 0001 and ADR 0002.

**Blocked by:** 10 (Editor page)

**Status:** ready-for-agent

- [ ] Photo fields use the Cloudinary media library, so phone uploads go straight to Cloudinary and the content stores the photo URL (see ADR 0002). Confirm the exact Sveltia CMS Cloudinary setup against its current docs
- [ ] The Cloudinary upload preset shrinks each photo to about 2500px wide on upload. Document the preset settings so they can be recreated
- [ ] The editor configuration test from ticket 10 checks that every photo field uses the Cloudinary media library
- [ ] A short plain-language guide for the owner on adding a Setup from a phone
