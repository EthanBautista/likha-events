// Photo fields store an image URL (ADR 0002): a Cloudinary URL for real photos. The only other
// accepted value is a sample placeholder bundled with the site, such as "/samples/placeholder-1.svg".

const cloudinaryUpload = String.raw`https://res\.cloudinary\.com/[^/]+/image/upload/`;
const samplePlaceholder = String.raw`/samples/[\w-]+\.(?:svg|png|jpg|webp)`;

const cloudinaryUploadRegex = new RegExp(`^${cloudinaryUpload}`);
const samplePlaceholderRegex = new RegExp(`^${samplePlaceholder}$`);

export function isCloudinaryUrl(url: string): boolean {
  return cloudinaryUploadRegex.test(url);
}

export function isPhotoUrl(url: string): boolean {
  return isCloudinaryUrl(url) || samplePlaceholderRegex.test(url);
}

const photoWithoutCommas = `(?:${cloudinaryUpload}[^,]+|${samplePlaceholder})`;
/**
 * The editor's check on a photo field, as a regular expression, so the editor accepts the same photos
 * as isPhotoUrl. Sveltia CMS tests it against all of a field's photos joined with commas, so each
 * photo here is an address without commas, which is how Cloudinary uploads arrive.
 */
export const editorPhotosPattern = `^${photoWithoutCommas}(?:,${photoWithoutCommas})*$`;

/** The Cloudinary URL for this photo at the given width, in the best format the browser accepts. */
export function cloudinaryUrlAtWidth(url: string, width: number): string {
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
