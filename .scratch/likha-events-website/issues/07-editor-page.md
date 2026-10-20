# 07: Editor page (/admin)

**What to build:** The owner opens `/admin` on a phone, logs in, and can add, edit and delete:
- **Setups**: choose photos from the phone, Event type, caption, and the "Feature on homepage" switch,
- **Packages**,
- **Rentals**.

The editor won't save an entry with a required field missing. Each save becomes a commit, and the owner can't change the layout or headings. It uses a Git-based, Decap-compatible editor (Sveltia CMS) with the GitHub backend. Login through Netlify OAuth is wired up at launch. See the spec and ADR 0001.

**Blocked by:** 02 (Gallery: Setups and Event type filter), 04 (Packages & Rentals page)

**Status:** ready-for-agent

- [ ] The editor is served at `/admin` and works at phone width
- [ ] It has collections for Setups, Packages and Rentals only. Their fields, required flags and limits (8 additional photos) mirror the content schemas, and the Event type options come from the shared list
- [ ] Photo fields use the Cloudinary media library, so phone uploads go straight to Cloudinary and the content stores the photo URL (see ADR 0002). Confirm the exact Sveltia CMS Cloudinary setup against its current docs
- [ ] The Cloudinary upload preset shrinks each photo to about 2500px wide on upload. Document the preset settings so they can be recreated
- [ ] Package and Rental display order can be edited
- [ ] A test loads the editor configuration and checks, for each collection, that its fields, required flags, limits and Event type options match the content schemas
- [ ] A short plain-language guide for the owner on adding a Setup from a phone
