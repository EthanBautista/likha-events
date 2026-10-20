# Static Astro site with a Git-based editor, hosted on Netlify

The site owner isn't technical and needs to add Setups and edit Packages from a phone, while the site itself costs nothing to run beyond the domain. We chose a static Astro site whose content (Setups, Packages, Rentals) lives as files in the GitHub repo (photos excepted, see ADR 0002), edited through a Git-based editor page at `/admin`, hosted on Netlify's free tier, which also receives contact-form Inquiries.

## Considered Options

- **Next.js + Sanity**: a more polished hosted editor, but more accounts and moving parts than a four-page site needs, and the content would live outside the repo.
- **Wix / Squarespace**: easiest for the owner, but a monthly fee and less control over the design.
- **Plain HTML**: simplest to build, but every change would need a developer.

## Consequences

Edits from the editor page become commits, so every change to the site's text content is versioned and can be undone. Inquiries depend on Netlify Forms; moving off Netlify means replacing the form backend.
