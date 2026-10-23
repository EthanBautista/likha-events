# 08: Inquiry optional details and inspiration photos

**What to build:** A visitor filling in the Contact form can also add the optional details: number of guests, theme or colours, décor wanted, and up to 3 inspiration photos. They get a clear message if they pick too many photos or a file that isn't an image. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 07 (Contact form and Inquiries)

**Status:** done

- [x] The optional fields are present, labelled for screen readers, and sending works without them
- [x] Inspiration photos accept images only and are capped at 3, with a clear message
- [x] The form still submits as a Netlify Form with the photos attached (the form encoding supports file uploads)
- [x] Playwright tests:
  - the form sends with the optional fields left empty,
  - a 4th photo is rejected with the message,
  - a non-image file is rejected

## Comments

- Netlify Forms takes only one file per field, so visitors pick their photos in one field and a script sends each in its own field (`inspiration-photo-1` to `-3`). The other two fields sit hidden in the form so Netlify finds them at build time. Without JavaScript, only the first photo is sent.
- Netlify caps a form post at 8 MB, so three full-size phone photos could go over it. Worth checking when sending the real test Inquiry at launch (ticket 16).
- 2026-10-22: The 8 MB cap is now handled. At launch a big-photo Inquiry showed the thank-you page but never reached Netlify, the inbox or the dashboard, as Netlify drops an oversized post without a word. The form now redraws each photo in the browser as a JPEG at most 2000px wide before sending (keeping a small one as it is when the JPEG would be bigger), and if the photos still come to more than 7.5 MB (such as HEIC photos the browser can't open), it isn't sent and says the photos are too large.
