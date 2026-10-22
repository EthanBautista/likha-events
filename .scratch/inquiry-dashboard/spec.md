Status: ready-for-agent

# Spec: The Inquiry dashboard

## Problem Statement

Each Inquiry reaches the owner as an email in Gmail, and more arrive by Instagram and Facebook message. As Inquiries pile up, the owner can't easily tell which still need a reply, which have been quoted, which became bookings and which fell through. He also has no simple way to see what he has earned from his events, or what they cost him. A tool such as Trello would mean one more account for a non-technical owner to log in to.

## Solution

An Inquiry dashboard at `/admin/inquiries`, next to the editor and behind the same GitHub login. Every Inquiry sent through the contact form appears there automatically, with its inspiration photos. The owner adds Inquiries from Instagram and Facebook messages by hand. Each Inquiry has an Inquiry status (New, Quoted, Booked, Done or Declined) that the owner sets, plus notes. Once he quotes, he records the Agreed price, the Down payment and Balance received, and a list of Costs. The dashboard totals Earned, Owed and Profit on events by month and by year. The email for each new Inquiry keeps arriving: the email is the alert, and the dashboard is the record. See ADR 0004 for the architecture.

## User Stories

### Getting in

1. As the owner, I want to log in to the Inquiry dashboard with the same GitHub account as the editor, so that there's no new password to remember.
2. As the owner, I want to stay logged in on my phone, so that checking Inquiries is quick.
3. As the owner, I want links between the editor and the Inquiry dashboard, so that I can move between them.
4. As the owner, I want nobody without access to the site's repo to see any Inquiry, so that my customers' details stay private.

### Inquiries arriving

5. As the owner, I want every Inquiry from the contact form to appear on the dashboard by itself, so that I never have to copy one in.
6. As the owner, I want each Inquiry's inspiration photos on the dashboard, so that I don't have to dig out the email.
7. As the owner, I want new Inquiries to start as New, so that I can see what still needs a reply.
8. As the owner, I want to keep getting an email for each new Inquiry, so that I'm alerted without remembering to check the dashboard.
9. As the owner, I want spam that Netlify catches kept off the dashboard, so that the list stays clean.

### Working through Inquiries

10. As the owner, I want to see all Inquiries in one list, with the soonest upcoming events first, so that I deal with the most urgent first.
11. As the owner, I want each row to show the customer's name, event date, Event type and Inquiry status, so that I can scan the list.
12. As the owner, I want to filter the list by Inquiry status, so that I can see, for example, only the Quoted ones waiting on a reply.
13. As the owner, I want to see how many Inquiries are New, so that I know at a glance whether anyone is waiting on me.
14. As the owner, I want to open an Inquiry and see everything the customer sent, so that I can write a quote.
15. As the owner, I want to set an Inquiry to any Inquiry status, so that I can skip steps and undo a wrong tap.
16. As the owner, I want to write notes on an Inquiry, so that I remember what we discussed.
17. As the owner, I want the customer's own answers protected from editing, so that I always have what they actually sent.

### Inquiries from Instagram and Facebook

18. As the owner, I want to add an Inquiry by hand from an Instagram or Facebook message, so that all my Inquiries are in one place.
19. As the owner, I want to record whether an Inquiry came from the contact form, Instagram or Facebook, so that I know where my customers find me.
20. As the owner, I want to add an Inquiry with only a name and a way to reach them, so that I can capture it before I know everything.
21. As the owner, I want to edit the details of an Inquiry I added by hand, so that I can fill them in as I learn them.
22. As the owner, I want to attach inspiration photos to an Inquiry I add by hand, so that screenshots from a chat are kept with it.

### Removing Inquiries

23. As the owner, I want to delete an Inquiry after confirming, so that spam that slipped through or a duplicate doesn't clutter the list.
24. As the owner, I want a customer who didn't book to be marked Declined rather than deleted, so that I keep a record of them.

### Money

25. As the owner, I want to record the Agreed price on an Inquiry, so that I know what the customer will pay.
26. As the owner, I want to record the Down payment and Balance received, so that I know who has paid what.
27. As the owner, I want to list each Cost of an event with a description and amount, so that I remember what I spent the money on.
28. As the owner, I want to see what's still Owed on each Inquiry, so that I can follow up on unpaid Balances.
29. As the owner, I want to see Earned, Owed and Profit on events for each month and each year, so that I know how the business is doing.
30. As the owner, I want money counted in the month of the event, so that each event's money and Costs land together.
31. As the owner, I want Profit on events labelled clearly, so that I don't mistake it for my business's overall profit.

### On a phone

32. As the owner, I want the dashboard to work well on my phone, so that I can update an Inquiry right after a chat.

## Implementation Decisions

### Architecture (ADR 0004)

- The site stays a static Astro build. The dashboard is a static page under `/admin/` (not indexed, like the editor) whose script talks to Netlify Functions. Functions live in the standard Netlify functions folder and are deployed by the same Netlify site.
- **Storage:** Netlify Blobs. Each Inquiry is one JSON record, keyed by a generated id. Its photos are separate blobs referenced from the record. Nothing about Inquiries goes in the repo.
- **Login:** the page signs in with GitHub through Netlify's OAuth provider, the same provider the editor uses. Every function call sends the GitHub token, and the function lets it through only if GitHub says that user can push to `EthanBautista/likha-events`. Photos are served through a function with the same check, never as public URLs.
- **One access-check module** owns "may this request see Inquiries?". Every function uses it, and tests can substitute GitHub's answer.
- **One Inquiries module** owns reading and writing records: creating one from a form submission or by hand, changing its status, notes, details and money, deleting it, listing them, and computing Owed and the totals. Functions are thin layers over it, and it is tested directly against a local Blobs store.

### Inquiries arriving

- A `submission-created` function, which Netlify runs for each Inquiry that passes its spam filter, creates a record from the `inquiry` form with status New and source Contact form. It copies each inspiration photo into Blobs straight away, because Netlify's file links don't last. If a photo can't be copied, the Inquiry is still saved and shows which photo is missing.
- Netlify Forms and the owner's email notification are unchanged.

### The Inquiry record

- From the customer: name, phone number or email, event date, venue or city, Event type, number of guests, theme or colours, décor wanted, inspiration photos. Kept exactly as sent on contact-form Inquiries.
- Kept by the owner: Inquiry status, source (Contact form, Instagram or Facebook), notes, Agreed price, Down payment received, Balance received, Costs (each a description and an amount), and when it was received.
- **Hand-added Inquiries** need only a name and a way to reach the customer (an Instagram or Facebook handle counts). Everything else is optional, and their customer details stay editable.
- Money is in CAD and allows cents, stored as whole cents. Amounts are used exactly as entered, with nothing done for HST.

### The list

- Upcoming events come first, soonest first. Past events follow, most recent first. Inquiries with no event date come last.
- A filter by Inquiry status, with All the default, and a count of New Inquiries always visible.
- Any status can be set from any status. Nothing changes status automatically: the owner sets Done himself.

### Money

- **Owed** on an Inquiry is its Agreed price minus the Down payment and Balance received, counted only on Booked or Done Inquiries and never below zero.
- **Earned** is Down payments plus Balances received on every Inquiry, whatever its status. A Declined customer's non-refundable Down payment still counts.
- **Profit on events** is Earned minus the Costs of every Inquiry. Spending not tied to one event is out of scope, and the label says "Profit on events".
- Totals are grouped by the month and year of the event date. Inquiries with no event date are left out of the totals, and the dashboard says how many were left out.

### Design

- Follows DESIGN.md and the brand, built phone-first for a non-technical owner. Run Impeccable's shape step before building the list and detail views.

## Testing Decisions

- Test what the owner sees and does, and the Inquiries module's behaviour, never internal helpers.
- **Inquiries module tests** against a local Blobs store: creating from a form submission payload (including a photo that fails to copy), adding by hand with only name and contact, rejecting edits to a contact-form Inquiry's customer answers, list order (upcoming, past, undated), filtering, any-to-any status, delete, Owed, and monthly and yearly Earned, Owed and Profit on events, including a Declined Inquiry with a Down payment and an undated one.
- **Access-check tests**: a push-access user gets in, a read-only or unknown user and a missing or bad token are refused. Every function refuses without access, including the photo function.
- **Playwright e2e** on the dashboard with a stubbed GitHub check and a local store: the list, filter and New count, opening an Inquiry with its photos, changing status, notes, adding by hand, deleting with a confirm step, money entry and totals. Include the axe check and a phone-sized viewport, as the existing suites do.
- **Manual at launch**: a real contact-form Inquiry appears on the dashboard with its photos, the email still arrives, and the owner logs in from his phone.

## Out of Scope

- Pulling in Instagram or Facebook messages automatically.
- Replacing Netlify Forms (see ADR 0004 for when it would be).
- Business expenses not tied to one event, receipts, tax and HST handling, and exports for an accountant.
- Replying to customers from the dashboard, reminders and calendars.
- Deleting old Inquiries automatically.
- Separate access levels: anyone who can push to the repo sees everything, money included.

## Further Notes

- Glossary terms added: Inquiry dashboard, Inquiry status, Agreed price, Balance, Cost, Earned, Owed, Profit on events. Inquiry now also covers ones the owner adds from Instagram or Facebook.
- The Netlify Forms free tier allows about 100 Inquiries a month. Watch it, and see ADR 0004 for the way out.
- Customers' details live on the developer's Netlify account (ADR 0003). Handing the site over means moving the Blobs store too.
