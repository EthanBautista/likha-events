# 05: Contact form and Inquiries

**What to build:** A visitor fills in the Contact form to send an Inquiry.
- **Required**: name, phone or email, event date, venue or city, Event type.
- **Optional**: number of guests, theme or colours, décor wanted, up to 3 inspiration photos.

They get clear messages for missing fields or too many photos, and land on a thank-you page after sending. They can choose Instagram or Facebook instead. The form is a Netlify Form, so Inquiries can be emailed to the owner once the site is launched. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups and Event type filter), which provides the shared Event type list

**Status:** ready-for-agent

- [ ] The form is marked for Netlify Forms detection and has a honeypot spam field
- [ ] Required fields are enforced with clear, labelled messages. The Event type options come from the shared Event type list
- [ ] The optional fields are present. Inspiration photos accept images only and are capped at 3, with a clear message
- [ ] Submitting goes to a thank-you page that says roughly when to expect a reply
- [ ] Instagram and Facebook buttons are on the page, from site settings. There's no phone number
- [ ] All fields have labels screen readers can use
- [ ] Playwright tests:
  - missing required fields block sending,
  - a 4th photo is rejected with the message,
  - the Event type options match the list,
  - the Netlify attributes and the honeypot are present,
  - the social buttons link to the right pages
