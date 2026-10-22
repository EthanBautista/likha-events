// Business-wide settings, defined once and reused by the layout, footer and Contact page.
// No phone number belongs here or anywhere on the site (spec: the owner doesn't want one shown).

export const siteName = "Likha Events";

export const social = {
  instagram: "https://www.instagram.com/likha.events",
  facebook: "https://www.facebook.com/p/LIKHA-Events-61581441256098/",
} as const;

/** The site's GitHub repo. The editor saves to it, and only those who can push to it may see Inquiries. */
export const siteRepo = "EthanBautista/likha-events";

/** How soon the owner replies to an Inquiry, promised on the thank-you page. */
export const inquiryReplyTime = "within 2 days";

export const mainMenu = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery/" },
  { label: "Packages & Rentals", href: "/packages-and-rentals/" },
  { label: "Contact", href: "/contact/" },
] as const;
