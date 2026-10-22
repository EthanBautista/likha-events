# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors**: people in the GTA planning a personal occasion, mostly a baby shower or a birthday. They usually find Likha Events through Instagram or Facebook, often on a phone, and want three things: to see the quality of past Setups, a rough budget, and an easy way to ask for a quote.
- **The owner**: runs Likha Events and isn't technical. They add new Setups and edit Packages and Rentals from a phone through the editor page at `/admin`. Inquiries are emailed to them at likhaproductions25@gmail.com (the email notification is set up in the Netlify dashboard at launch), and they track each one through its Inquiry status on the Inquiry dashboard at `/admin/inquiries`.
- **The developer**: maintains the code and hosting (ADR 0003).

Corporate clients are a later audience. This version doesn't target them (see GLOSSARY.md).

## Product Purpose

Likha Events designs and sets up decorations and backdrops for baby showers, birthdays and other events across the GTA. Before this site it had only an Instagram account and a Facebook page. The site:

- shows past Setups in one place, filterable by Event type;
- explains Packages (from the lowest Package price, currently $450) and Rentals;
- answers the repeat questions: price, the 50% non-refundable Down payment, and the travel fee outside the Service area;
- collects Inquiries through a contact form.

The owner counts it a success if it brings more bookings, makes the business look more professional, and cuts down repeat questions.

## Positioning

- **Designed, not just set up.** Each Setup is designed as a whole look (backdrop, arch, colours, details) for that customer's event, not picked from a stock balloon package.
- **Full service.** The customer sends an Inquiry, and Likha Events designs, delivers and sets up the décor. Rentals are the separate option for customers who want décor on its own, without the design and setup.
- **The style follows the customer's request.** Setups vary with each customer's theme and colours, so the site doesn't promise a single house style. The look is always elevated and never a party-store look, but it isn't necessarily calm or muted.

## Operating Context

- Visitors arrive mostly from Instagram and Facebook links, on phones over mobile data.
- Booking runs on messages, not on the site: Inquiry, then a quote, then a 50% non-refundable Down payment to hold the date. The site takes no payments and has no booking calendar.
- Customers also reach the owner through Instagram messages. The Contact page and footer link to Instagram and Facebook.
- The owner edits from a phone. Each save in the editor becomes a commit, and Netlify rebuilds the site within a few minutes.
- Service area: "Based in North York, serving the whole GTA" (Toronto, Durham, York, Peel and Halton). Events outside it pay a travel fee.

## Capabilities and Constraints

- Four pages (Home, Gallery, Packages & Rentals, Contact), plus a thank-you page after an Inquiry, the editor page at `/admin` and the Inquiry dashboard at `/admin/inquiries`.
- Static Astro site on Netlify's free tier (ADR 0001). The only server code is the Inquiry dashboard's Netlify Functions, which store Inquiries in Netlify Blobs (ADR 0004). Photos are stored on Cloudinary and served in responsive sizes (ADR 0002).
- Content is limited to Setups, the Event types list, Packages, Wedding Packages and Rentals, each checked by a schema at build time. The owner can't change page text, headings or layout.
- Event types: Baby shower, Birthday, Other, defined once in `src/event-types.ts`.
- **No phone number anywhere on the site.**
- A Setup has a cover photo plus up to 8 more. An Inquiry can attach up to 3 inspiration photos.
- Terminology follows GLOSSARY.md (Setup, Event type, Photo viewer, Package, Rental, Inquiry, Service area, Down payment). Use those words and avoid the listed alternatives.
- Out of scope for now: Corporate clients, an About page, online booking or payment, analytics, and languages other than English.
- Still to come from the owner: real Setup photos, the package picture (real Package contents and prices) and the real Rentals list. Until then the site shows content clearly labelled "sample".

## Brand Commitments

- The name is "Likha Events" in all text and page titles, with titles like "Gallery · Likha Events". The logo artwork shows the short form "Likha" and is used as an image.
- Tagline: "We create. You celebrate."
- The brand guide is `2025--11-13 - Likha-Brand Guidelines_V2.pdf`. It's kept on the developer's machine only, because it contains the owner's phone number, and is ignored by git. The logo and arch artwork taken from it are in `src/assets/brand/`. The arch shape is a binding brand motif.
- Voice: warm and plain. Friendly, short sentences, as if the owner were talking to a customer. Not formal or boutique-polished.

## Evidence on Hand

- Instagram (@likha.events) and Facebook accounts, linked from the site.
- Likha Events has done several bookings, but the owner hasn't given a count and has few reviews so far. **Don't invent testimonials, review quotes, star ratings, event counts or press.**
- No real photos are in the repo yet. The placeholders in `public/samples/` are not Likha Events' work and mustn't be presented as such.

## Product Principles

1. **The Setups are the pitch.** Photos of real work sell more than words, so everything else supports them.
2. **Answer the money questions up front.** Show the starting price, the Down payment and the travel fee before anyone asks.
3. **Every page leads to an Inquiry.** A next step (a quote link, the form, or Instagram) is never far away.
4. **The owner can't break it.** Anything the owner edits is limited to content fields checked by a schema, never layout.
5. **Fast on a phone.** Most visitors come from social apps on mobile data.

## Accessibility & Inclusion

- WCAG 2.x AA, including colour contrast for every text pairing.
- Photos have text descriptions, and the menu, Photo viewer and contact form are properly labelled and keyboard-usable.
- No sideways scrolling at 375px wide.
- Motion respects "reduce motion".
