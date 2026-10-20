# 08: Inquiry optional details and inspiration photos

**What to build:** A visitor filling in the Contact form can also add the optional details: number of guests, theme or colours, décor wanted, and up to 3 inspiration photos. They get a clear message if they pick too many photos or a file that isn't an image. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 07 (Contact form and Inquiries)

**Status:** ready-for-agent

- [ ] The optional fields are present, labelled for screen readers, and sending works without them
- [ ] Inspiration photos accept images only and are capped at 3, with a clear message
- [ ] The form still submits as a Netlify Form with the photos attached (the form encoding supports file uploads)
- [ ] Playwright tests:
  - the form sends with the optional fields left empty,
  - a 4th photo is rejected with the message,
  - a non-image file is rejected
