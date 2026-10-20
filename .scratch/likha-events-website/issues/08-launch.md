# 08: Launch

**What to build:** The site goes live at `likhaevents.ca`, owned by Likha Events. Inquiries reach the owner's inbox, and the owner can publish a Setup from their phone. These are manual steps a person has to take.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07

**Status:** ready-for-human

- [ ] Confirm `likhaevents.ca` is available, and register it (optionally also `likhaevents.com`) in the owner's name with likhaproductions25@gmail.com
- [ ] The owner creates a free GitHub account and is added as a collaborator on the private repo (EthanBautista), see ADR 0003
- [ ] A Cloudinary account is created with likhaproductions25@gmail.com, two-factor login is turned on, the developer is added as a user, and the upload preset from ticket 07 is created
- [ ] The repo is connected to the developer's Netlify account, and the custom domain and HTTPS work
- [ ] Netlify OAuth is set up so the owner can log in to `/admin`
- [ ] Netlify Forms notifications send each Inquiry to likhaproductions25@gmail.com
- [ ] A real test Inquiry with an inspiration photo arrives in the inbox
- [ ] The owner publishes a test Setup from their phone and sees it live within a few minutes
- [ ] Sample content is replaced or removed once the real photos and the package picture arrive
