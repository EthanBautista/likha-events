// The contact form's inspiration photo fields, shared by the form and the function that saves each
// Inquiry, so a change to how many photos the form takes reaches both.

/** The most inspiration photos an Inquiry can carry. */
export const maxPhotos = 3;

/** Netlify Forms takes one file per field, so each photo is sent in its own field. */
export const photoFields = Array.from({ length: maxPhotos }, (_, index) => `inspiration-photo-${index + 1}`);
