# 10: Editor page (/admin)

**What to build:** The owner opens `/admin` on a phone, logs in, and can add, edit and delete:
- **Setups**: Event type, caption, and the "Feature on homepage" switch,
- **Packages**,
- **Rentals**.

The editor won't save an entry with a required field missing. Each save becomes a commit, and the owner can't change the layout or headings. It uses a Git-based, Decap-compatible editor (Sveltia CMS) with the GitHub backend. Login through Netlify OAuth is wired up at launch. Choosing photos from the phone comes in ticket 11. See the spec and ADR 0001.

**Blocked by:** 02 (Gallery: Setups), 05 (Packages & Rentals page: Packages and booking), 06 (Packages & Rentals page: Rentals)

**Status:** ready-for-agent

- [ ] The editor is served at `/admin` and works at phone width
- [ ] It has collections for Setups, Packages and Rentals only. Their fields, required flags and limits (8 additional photos) mirror the content schemas, and the Event type options come from the shared list
- [ ] Package and Rental display order can be edited
- [ ] A test loads the editor configuration and checks, for each collection, that its fields, required flags, limits and Event type options match the content schemas

## Comments

- From ticket 06: display order is required for Packages and Rentals. Prefill it on new entries (for example, the next number) so the owner never has to type one.
