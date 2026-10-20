# 07: Contact form and Inquiries

**What to build:** A visitor fills in the Contact form to send an Inquiry with the required details: name, phone or email, event date, venue or city, and Event type. They get clear messages for missing fields and land on a thank-you page after sending. They can choose Instagram or Facebook instead. The form is a Netlify Form, so Inquiries can be emailed to the owner once the site is launched. The optional fields and inspiration photos come in ticket 08. See the spec: `.scratch/likha-events-website/spec.md`.

**Blocked by:** 02 (Gallery: Setups), which provides the shared Event type list

**Status:** done

- [x] The form is marked for Netlify Forms detection and has a honeypot spam field
- [x] Required fields are enforced with clear, labelled messages. The Event type options come from the shared Event type list
- [x] Submitting goes to a thank-you page that says roughly when to expect a reply
- [x] Instagram and Facebook buttons are on the page, from site settings. There's no phone number
- [x] All fields have labels screen readers can use
- [x] Playwright tests:
  - missing required fields block sending,
  - the Event type options match the list,
  - the Netlify attributes and the honeypot are present,
  - the social buttons link to the right pages
