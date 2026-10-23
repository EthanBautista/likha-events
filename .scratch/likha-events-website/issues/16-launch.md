# 16: Launch

**What to build:** The site goes live at `likhaevents.ca`, owned by Likha Events. Inquiries reach the owner's inbox, and the owner can publish a Setup from their phone. These are manual steps a person has to take.

**Blocked by:** 01–15

**Status:** ready-for-human

- [x] Confirm `likhaevents.ca` is available, and register it (optionally also `likhaevents.com`) in the owner's name with likhaproductions25@gmail.com
- [x] The developer sits with the owner to create a free GitHub account for them and add it as a collaborator on the private repo (EthanBautista), see ADR 0003. The owner isn't technical, so in the same sitting log in to `/admin` and to Cloudinary on the owner's phone, so both logins are remembered
- [x] A Cloudinary account is created with likhaproductions25@gmail.com, the developer is added as a user, and the upload preset from ticket 11 is created (see `docs/cloudinary-upload-preset.md`). Two-factor login on Cloudinary was skipped, since the console didn't offer it; 2-Step Verification is on for likhaproductions25@gmail.com instead, which every account's password reset goes through
- [x] The Cloudinary account's cloud name and API key (never the API secret) replace the `set-at-launch` placeholders in `src/editor-config.ts`
- [x] The owner has the guide `docs/owner-guide-adding-a-setup.md`
- [x] The repo is connected to the developer's Netlify account, and the custom domain and HTTPS work
- [x] Netlify OAuth is set up so the owner can log in to `/admin`
- [x] Form detection is turned on in the Netlify dashboard (it's off by default on new sites), and the `inquiry` form appears after the next deploy
- [x] Netlify Forms notifications send each Inquiry to likhaproductions25@gmail.com
- [x] A real test Inquiry with an inspiration photo arrives in the inbox
- [x] The owner publishes a test Setup from their phone and sees it live within a few minutes
- [ ] Sample content is replaced or removed once the real photos and the package picture arrive

## Comments

- 2026-10-22: Cloudinary's Media Library window, which Sveltia CMS opens for photo fields, is hard to use on a phone. Accepted for launch. If the owner struggles to publish a Setup from their phone, consider moving photos to the repo with Sveltia's own picker and Netlify Image CDN, which would revise ADR 0002.
- 2026-10-22: Photographers' photos are often over 10 MB, which Cloudinary's free plan refuses before the upload preset can shrink them. Decided to move Setup and Rental photos to the repo later, shrunk to 2500px WebP by Sveltia's own picker before upload, with Netlify Image CDN resizing them per screen. That fixes both this and the phone problem above. Needs its own ticket and a revised ADR 0002.
- 2026-10-22: An Inquiry with big photos showed "sent" but never arrived: Netlify drops a form post over 8 MB without a word. Fixed by shrinking photos in the browser before sending, and refusing to send photos that are still too large (see ticket 08).
- 2026-10-22: Netlify's free plan refused to build the private repo once the owner's editor saves added a second Git contributor ("unrecognized Git contributor"). The repo was made public, after checking its history holds no secrets. ADR 0003 records why.
