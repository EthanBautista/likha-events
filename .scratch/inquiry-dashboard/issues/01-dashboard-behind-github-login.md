# 01: An empty Inquiry dashboard behind the editor's GitHub login

**What to build:** The tracer bullet through the new architecture (ADR 0004). `/admin/inquiries` signs in with GitHub through Netlify's OAuth provider and calls a Netlify Function that lists Inquiries from Netlify Blobs. With nothing stored yet, the list is empty. Only users who can push to the repo get in. See the spec: `.scratch/inquiry-dashboard/spec.md` (Architecture).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Netlify Functions set up alongside the static Astro build, with a local way to run them and a local Blobs store for tests
- [x] The access-check module: lets a request through only if its GitHub token's user can push to `EthanBautista/likha-events`. Tests can substitute GitHub's answer
- [x] The Inquiries module's first piece, listing records, tested against a local store
- [x] A list function that refuses without access
- [x] The dashboard page: not indexed, signs in with GitHub, stays signed in, shows an empty list with an empty-state message
- [x] Links between the editor and the dashboard
- [x] Tests: access granted for a push-access user, refused for read-only, unknown or missing tokens
