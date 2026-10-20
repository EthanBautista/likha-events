# 11: Editor photo uploads

**What to build:** The owner adds photos to a Setup or Rental in `/admin` by choosing them from their phone. The photos upload straight to Cloudinary, shrunk to a sensible size, and the content stores the photo URL. The owner gets a short plain-language guide to adding a Setup from their phone. See the spec, ADR 0001 and ADR 0002.

**Blocked by:** 10 (Editor page)

**Status:** done

- [x] Photo fields use the Cloudinary media library, so phone uploads go straight to Cloudinary and the content stores the photo URL (see ADR 0002). Confirm the exact Sveltia CMS Cloudinary setup against its current docs
- [x] The Cloudinary upload preset shrinks each photo to about 2500px wide on upload. Document the preset settings so they can be recreated
- [x] The editor configuration test from ticket 10 checks that every photo field uses the Cloudinary media library
- [x] A short plain-language guide for the owner on adding a Setup from a phone

## Comments

- From ticket 10's review: the editor can save content the build rejects, which breaks the next deploy.
  - Photo fields accept any address. An upload saves as `/uploads/...` (the placeholder `media_folder` in `src/editor-config.ts`) and a pasted non-Cloudinary link is accepted too, but the schema only allows Cloudinary or `/samples/` addresses. Replace the placeholder `media_folder`. Sveltia image fields accept a `pattern` check, and with `multiple` it's tested against all values joined with commas, so a pattern can allow Cloudinary addresses and keep existing sample placeholders editable.
  - Text that's only spaces passes the editor's required check (unconfirmed) but fails the schema's `trim().min(1)`: caption, name, description and the "What's included" lines. A `pattern` such as `\S` on those fields would stop it.
  - Extend the editor configuration test to cover both, since it doesn't compare them today.
- Done: photo fields use Sveltia's Cloudinary media library, set once for the whole editor (`media_libraries.cloudinary`), with uploading into the repo turned off (`media_libraries.default: false`) and the placeholder `media_folder` removed, which Sveltia allows once a cloud library is set. Fields store the photo's full Cloudinary URL. Checked against Sveltia's Cloudinary docs and the installed 0.249.1 types.
  - The cloud name and API key are `set-at-launch` placeholders until the business's Cloudinary account exists. Ticket 16 has the step.
  - The upload preset is set in Cloudinary as the Media Library's default for images, since Sveltia passes no preset. Its settings are in `docs/cloudinary-upload-preset.md`.
  - Photo fields have a `pattern` built in `src/photos.ts` from the same pieces as `isPhotoUrl`, so pasted links that aren't Cloudinary or `/samples/` are refused. It accepts only addresses without commas, which is how Cloudinary uploads arrive.
  - Caption, name, description and "What's included" lines have a `\S` pattern. In 0.249.1, Sveltia's required check already trims text, so spaces-only text was refused anyway. The pattern makes the match with the schema visible in the config, and the test checks it.
  - The owner's guide is `docs/owner-guide-adding-a-setup.md`. Its button names in the Cloudinary steps should be checked on a phone at launch.
