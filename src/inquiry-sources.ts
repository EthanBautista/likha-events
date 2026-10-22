// Where an Inquiry came from, shared by the Inquiries module and the dashboard's Add Inquiry form, so
// the two always agree.

/** The sources of the Inquiries the owner adds by hand. */
export const handAddedSources = ["Instagram", "Facebook"] as const;

export type HandAddedSource = (typeof handAddedSources)[number];

/** Where an Inquiry came from: the contact form, or a message the owner added it from by hand. */
export type InquirySource = "Contact form" | HandAddedSource;
