// The contact form's inspiration photo fields and the names of the answers it takes, shared by the
// forms and the Inquiries module, so a change to what an Inquiry holds reaches each of them.

/** The most inspiration photos an Inquiry can carry. */
export const maxPhotos = 3;

/** Netlify Forms takes one file per field, so each photo is sent in its own field. */
export const photoFields = Array.from({ length: maxPhotos }, (_, index) => `inspiration-photo-${index + 1}`);

/**
 * The names of an Inquiry's customer answers, apart from their photos, shared by the Inquiries module and
 * the dashboard's form for adding an Inquiry by hand, so the two always agree.
 */
export const customerAnswers = ["name", "contact", "eventDate", "venue", "eventType", "guests", "theme", "decor"] as const;
