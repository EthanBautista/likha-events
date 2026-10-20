// Business-wide settings, defined once and reused by the layout, footer and Contact page.
// No phone number belongs here or anywhere on the site (spec: the owner doesn't want one shown).

export const siteName = "Likha Events";

export const social = {
  instagram: "https://www.instagram.com/likha.events",
  facebook: "https://www.facebook.com/p/LIKHA-Events-61581441256098/",
} as const;

export const mainMenu = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery/" },
  { label: "Packages & Rentals", href: "/packages-and-rentals/" },
  { label: "Contact", href: "/contact/" },
] as const;
