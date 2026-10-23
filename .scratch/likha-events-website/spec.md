Status: ready-for-agent

# Spec: Likha Events website (first version)

## Problem Statement

Likha Events designs and sets up decorations and backdrops for baby showers, birthdays and other events across the GTA, but it has no website: only an Instagram account and a Facebook page. Customers can't see the work in one place, don't know what a Package costs or that Rentals exist, and ask the same questions over and over (price, Down payment, travel). The owner isn't technical and needs to add new Setups from a phone without asking anyone for help.

## Solution

A four-page website for Likha Events (Home, Gallery, Packages & Rentals, Contact), hosted for free on Netlify at `likhaevents.ca`. Visitors can browse past Setups by Event type, see Packages (starting at $450) and Rentals, read how booking works, and send an Inquiry through a contact form that is emailed to the owner. The owner logs in to an editor page at `/admin` from a phone to add Setups, edit Packages and Rentals, and pick which Setups feature on the homepage. The design follows the Likha brand guide: off-white background, charcoal text, forest-green actions, sage bands, photos framed in the brand's arch shape. The first version ships with clearly marked sample Setups, Packages and Rentals that the owner replaces through the editor page once the real photos and package details arrive.

## User Stories

### Visitors: finding and trusting Likha Events

1. As a visitor, I want to see the Likha Events logo and the line "We create. You celebrate." as soon as the homepage loads, so that I know whose site I'm on and what they do.
2. As a visitor, I want a large photo framed in an arch at the top of the homepage, so that I immediately see the quality of the work.
3. As a visitor, I want a "Get a quote" button at the top of the homepage, so that I can inquire without scrolling.
4. As a visitor, I want to see three featured Setups on the homepage, so that I get a quick taste of the best work.
5. As a visitor, I want a "See the gallery" link under the featured Setups, so that I can see more.
6. As a visitor, I want the homepage to tell me Packages start from $450, so that I know roughly what to budget before I inquire.
7. As a visitor, I want the homepage to mention that Rentals exist, so that I know I can hire items without a full Package.
8. As a visitor, I want the homepage to say Likha Events is based in North York and serves the whole GTA, so that I know whether they come to me.
9. As a visitor, I want a closing "Planning an event? Send an inquiry" section with an Instagram link, so that I have a clear next step after browsing.
10. As a visitor, I want a menu with Home, Gallery, Packages & Rentals and Contact on every page, so that I can move around easily.
11. As a visitor on a phone, I want the menu to collapse into a menu button, so that it doesn't crowd the screen.
12. As a visitor on a phone, I want every page to fit my screen without sideways scrolling, so that the site is comfortable to use.
13. As a visitor, I want pages to load quickly on mobile data, so that I don't give up waiting for photos.
14. As a visitor using a screen reader, I want photos to have descriptions and the menu and form to be properly labelled, so that I can use the site.
15. As a visitor, I want each browser tab titled with the page name and "Likha Events", so that I can tell my tabs apart and recognise the business.

### Visitors: Gallery

16. As a visitor, I want to see all Setups as a grid of cover photos, so that I can scan the work quickly.
17. As a visitor, I want to filter the gallery by Event type (Baby shower, Birthday, Other), so that I only see Setups like the event I'm planning.
18. As a visitor, I want an "All" option in the filter, so that I can go back to seeing everything.
19. As a visitor, I want each Setup to show a short caption, so that I know what the occasion or theme was.
20. As a visitor, I want to tap a Setup and see all of its photos (up to 9), so that I can see details like the cake table and close-ups.
21. As a visitor, I want to close a Setup's photos and return to where I was in the gallery, so that I don't lose my place.
22. As a visitor, I want a "Get a quote" link near the gallery, so that I can inquire when a Setup inspires me.

### Visitors: Packages & Rentals

23. As a visitor, I want to see each Package with its name, price and what's included, so that I can compare them.
24. As a visitor, I want the page to say "Packages from $450" with a "message us for a custom quote" option, so that I know bigger or custom events are possible.
25. As a visitor, I want a separate Rentals section, so that I can find items to hire without a full setup.
26. As a visitor, I want each Rental to show a name, a photo, a price per event and a one-line description, so that I know exactly what I'd be hiring.
27. As a visitor, I want a "How booking works" section that lists inquiry, quote, then a 50% non-refundable Down payment to hold my date, so that I know the process before I commit.
28. As a visitor, I want to know a travel fee applies outside the Service area, so that I'm not surprised later.
29. As a visitor, I want a link from the Packages & Rentals page to the Contact page, so that I can inquire about a Package or Rental I like.

### Visitors: Contact and Inquiries

30. As a visitor, I want a contact form, so that I can send an Inquiry with my event details in one go.
31. As a visitor, I want the form to ask for my name, a phone number or email, the event date, the venue or city, and the Event type, so that Likha Events has what it needs to quote.
32. As a visitor, I want the number of guests, theme or colours, décor wanted and inspiration photos to be optional, so that I can send an Inquiry even if I haven't decided everything.
33. As a visitor, I want to attach up to 3 inspiration photos, so that I can show the look I'm after.
34. As a visitor, I want the form to tell me clearly when a required field is missing, so that I can fix it before sending.
35. As a visitor, I want to be told if I try to attach more than 3 photos, so that I know why my Inquiry won't send.
36. As a visitor, I want a confirmation page after sending, so that I know my Inquiry went through and roughly when to expect a reply.
37. As a visitor who prefers chatting, I want Instagram and Facebook buttons on the Contact page, so that I can message Likha Events directly instead.
38. As a visitor, I want Instagram and Facebook links in the footer of every page, so that I can follow Likha Events.

### Owner: receiving Inquiries

39. As the owner, I want each Inquiry emailed to likhaproductions25@gmail.com, so that I see it where I already check messages.
40. As the owner, I want the email to include every field the customer filled in and their inspiration photos, so that I can quote without asking again.
41. As the owner, I want spam submissions filtered out, so that my inbox isn't flooded by bots.
42. As the owner, I don't want my phone number shown on the site, so that I don't get spam or sales calls.

### Owner: editing the site from a phone

43. As the owner, I want to log in to an editor page at `/admin` from my phone, so that I can update the site without a computer.
44. As the owner, I want to add a new Setup by choosing photos from my phone, picking an Event type and writing a short caption, so that new work appears on the site.
45. As the owner, I want to choose one cover photo and up to 8 more for each Setup, so that the gallery stays tidy.
46. As the owner, I want a "Feature on homepage" switch on each Setup, so that I choose which Setups visitors see first.
47. As the owner, I want to edit or delete an existing Setup, so that I can fix mistakes or remove old work.
48. As the owner, I want to add, edit and remove Packages (name, price, what's included), so that my prices stay current.
49. As the owner, I want to set the order Packages appear in, so that the $450 Package comes first.
50. As the owner, I want to add, edit and remove Rentals (name, photo, price per event, one-line description), so that the Rentals list stays current.
51. As the owner, I want the editor to stop me saving a Setup, Package or Rental with a required field missing, so that I can't break the site by accident.
52. As the owner, I want my changes to appear on the live site within a few minutes of saving, so that I know they worked.
53. As the owner, I want every change I make to Setups, Packages and Rentals to be kept in a history that can be undone, so that a mistake is never permanent.
54. As the owner, I don't want to be able to change the page layout or headings from the editor, so that I can't accidentally break the design.

### Owner and developer: ownership and maintenance

55. As the owner, I want the domain and the photo storage in my business's name, so that the business always keeps its address and its photos.
56. As the developer, I want the code (in a public repo, see ADR 0003) and the hosting on my own accounts, so that I can maintain the site and fix problems without asking for access.
57. As the developer, I want the sample Setups, Packages and Rentals to be clearly labelled "sample", so that nobody mistakes them for real content before launch.
58. As the developer, I want the site to fail to build if any content is invalid, so that broken content never goes live.
59. As the developer, I want automated browser tests that check the pages, filter, form and links, so that changes don't silently break the site.
60. As the developer, I want to be able to add a new Event type (such as Gender reveal or Bridal shower) in one place, so that the gallery filter, the editor and the form stay in sync.

## Implementation Decisions

- **Stack** (see ADR 0001): a static Astro 7 site with no server code. Text content lives as files in the repo, and Netlify hosts it on the free tier.
- **Photos** (see ADR 0002): Setup and Rental photos are stored on Cloudinary. Content files hold each photo's Cloudinary URL, not the image itself.
- **Accounts** (see ADR 0003): the code is in a public repo under the developer's GitHub account (EthanBautista), and hosting is on the developer's Netlify account. Cloudinary and the domain are owned by the business's email.
- **Content model**: three content collections, each validated by a schema at build time.
  - **Setup**:
    - caption (required, short text),
    - Event type (required, one of the Event types),
    - cover photo (required),
    - additional photos (0–8),
    - featured on homepage (yes/no, default no),
    - date (optional, used to sort newest first),
    - sample flag.
  - **Package**:
    - name (required),
    - price in CAD (required, whole dollars),
    - what's included (required list of short lines),
    - display order (required number),
    - sample flag.
  - **Rental**:
    - name (required),
    - photo (required),
    - price per event in CAD (required),
    - one-line description (required),
    - display order,
    - sample flag.
- **Event types**: a single list (Baby shower, Birthday, Other) defined in one place. The Setup schema, the gallery filter, the contact form's Event type dropdown and the editor's Event type field all come from it. Corporate client isn't an Event type and isn't part of this version.
- **Featured Setups**: the homepage shows up to three Setups marked as featured, newest first. If fewer than three are marked, it fills the gap with the newest unfeatured Setups, so the section never looks empty.
- **"Packages from $X"**: the homepage teaser and the Packages page heading use the lowest Package price from the content, not a hard-coded $450, so they stay correct when prices change.
- **Gallery**:
  - Everything renders statically, with each Setup's photos in the page.
  - Filtering by Event type happens in the browser.
  - The filter state is reflected in the URL, so a filtered view can be shared or linked (for example, the homepage could link to baby showers only).
  - Tapping a Setup opens an accessible photo viewer showing its photos. It closes with a button, the Escape key or the back gesture.
- **Images**:
  - Photos are served from Cloudinary in responsive sizes and modern formats, using Cloudinary URL transformations, so they load fast on phones.
  - One shared image component turns a stored photo URL into a responsive image. Sample content uses placeholder images bundled with the site, and the same component handles both.
  - Cover photos are cropped into the arch frame with CSS, and the original photos aren't altered.
  - Gallery images load lazily, to keep traffic (and Cloudinary credits) low.
- **Editor page**:
  - A Git-based, phone-friendly editor that reads a Decap-compatible configuration (Sveltia CMS), served at `/admin`.
  - It uses the GitHub backend, with login through Netlify's OAuth provider.
  - It edits only the three collections. Each save becomes a commit, which triggers a Netlify rebuild.
  - Photo fields use the editor's Cloudinary media library, so phone uploads go straight to Cloudinary. A Cloudinary upload preset shrinks each photo to about 2500px wide.
  - The owner logs in with their own GitHub account, which is added as a collaborator on the repo.
  - Its field definitions mirror the content schemas: the same required fields, the same limits (8 additional photos) and the same Event type options.
- **Contact form**:
  - It's a Netlify Form, detected at build time.
  - Required fields: name, contact (phone or email), event date, venue or city, Event type.
  - Optional fields: guests, theme or colours, décor wanted, inspiration photos.
  - Required fields use native browser validation. A small script blocks sending with more than 3 photos and shows a clear message.
  - Netlify's honeypot field filters spam.
  - After sending, the visitor lands on a thank-you page.
  - Email notifications to likhaproductions25@gmail.com are configured in the Netlify dashboard during launch, not in code.
- **Contact details**:
  - Instagram: https://www.instagram.com/likha.events
  - Facebook: https://www.facebook.com/p/LIKHA-Events-61581441256098/
  - Both are defined once, in a site settings module used by the Contact page and the footer.
  - No phone number appears anywhere on the site.
- **Naming**: the business is "Likha Events" in all text and page titles. Titles follow the pattern "Gallery · Likha Events". The logo artwork shows "Likha" and is used as an image.
- **Brand**:
  - The logo and arch motif are extracted as vector artwork from the brand guide PDF.
  - Colours are defined once as design tokens, from the brand guide's four: cream background (#F1F0E4), charcoal text, buttons and links (#353B38), tan (#BCA88D) and sage (#7D8D86) for bands and motifs.
  - Headings use a free, self-hosted, high-contrast serif that echoes the wordmark. Body text uses a clean sans-serif.
  - Colour contrast meets WCAG AA.
- **Navigation**: the menu is Home · Gallery · Packages & Rentals · Contact. Below tablet width it collapses into an accessible menu button.
- **Service area copy**: "Based in North York, serving the whole GTA." The booking section notes that a travel fee applies outside the GTA.
- **Sample content**: about 6 sample Setups spread across all three Event types (2 featured), 3 sample Packages starting at $450, and 3 sample Rentals. All use neutral placeholder images and are marked sample.
- **SEO basics**: each page has a unique title and description, plus Open Graph tags for link previews on Instagram and Facebook.

## Testing Decisions

- **What makes a good test**: tests only check what a visitor or the owner can observe in a browser: text on the page, where links go, what the filter shows, what the form accepts or rejects. They never check component internals, CSS class names or how the content is loaded, so the design can be reworked without rewriting tests.
- **Seam 1, the built site in a browser** (primary): Playwright runs against the production build served locally, at desktop and phone widths. It covers:
  - navigation to all four pages and the active menu state,
  - the phone menu button,
  - the homepage sections and featured Setups, including the fallback when fewer than three are featured,
  - the "from $X" price coming from the lowest Package,
  - the gallery filter, including the URL state and "All",
  - the photo viewer opening, showing all photos and closing, including with Escape,
  - Packages and Rentals rendering with their fields,
  - the "How booking works" steps and the travel-fee note,
  - required-field validation and the 3-photo limit on the contact form,
  - the form being marked for Netlify, with the honeypot present,
  - Instagram and Facebook links pointing to the right URLs, and no phone number anywhere,
  - no horizontal scrolling at 375px width,
  - page titles following "… · Likha Events".
- **Seam 2, the build as a content gate**: an Astro build with an invalid content entry, such as a Rental without a price or a Setup with 9 additional photos, must fail. This is covered by the schemas themselves. A test builds from a fixture with a known-bad entry and asserts the build fails.
- **Seam 3, editor fields match the content schemas**: one test loads the editor configuration and checks, for each collection, that its fields, required flags, limits and Event type options match the content schemas. This stops the editor and site drifting apart.
- **Manual at launch**: sending a real Inquiry and confirming the email (with attachments) reaches likhaproductions25@gmail.com, and logging in to `/admin` from the owner's phone and publishing a test Setup.
- **Prior art**: none. The repo has no code yet, so these tests set the pattern.

## Out of Scope

- A page or section for Corporate clients.
- More Event types beyond Baby shower, Birthday and Other.
- An About page.
- Online booking, a calendar, or taking payment (including the Down payment) on the site.
- Showing a phone number.
- The owner editing page text, headings or layout.
- Real photos, the real Package details from the owner's package picture, and the real Rentals list. These are entered through the editor once they arrive.
- Registering the domain and creating the Netlify, Cloudinary and domain accounts. These are manual launch steps.
- Analytics and tracking.
- Languages other than English.

## Further Notes

- **Domain**: `likha.ca` and `likha.com` are taken. `likhaevents.ca` (and optionally `likhaevents.com`) appeared unregistered as of 2026-10-19, which must be confirmed when buying.
- **Waiting on the owner**: the package picture (what each Package includes and costs), the original Setup photos, and the logo files on Google Drive. The logo can be extracted from the brand guide PDF in the meantime.
- **Glossary**: vocabulary follows `GLOSSARY.md` (Setup, Event type, Package, Rental, Inquiry, Corporate client, Service area, Down payment).
- **Cloudinary**: the free plan is 25 credits a month. Expect roughly 10 credits at about 1,000 visitors a month, and watch it at around 5,000. ADR 0002 records the way out if it's outgrown.
- **Netlify Forms**: the free tier allows about 100 submissions a month and limits attachment size. That's plenty for launch, but worth revisiting if Inquiries grow.
