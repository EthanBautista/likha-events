// The four pages a visitor can reach from the main menu.
export const menuPages = [
  { name: "Home", path: "/" },
  { name: "Gallery", path: "/gallery/" },
  { name: "Packages & Rentals", path: "/packages-and-rentals/" },
  { name: "Contact", path: "/contact/" },
] as const;

// Every page on the site: the menu pages plus those reached another way, such as after sending an Inquiry.
export const allPages = [...menuPages, { name: "Thank you", path: "/contact/thanks/" }] as const;
