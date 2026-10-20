// Photo fields store an image URL (ADR 0002): a Cloudinary URL for real photos. The only other
// accepted value is a sample placeholder bundled with the site, such as "/samples/placeholder-1.svg".

const cloudinaryUpload = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;
const samplePlaceholder = /^\/samples\/[\w-]+\.(svg|png|jpg|webp)$/;

export function isCloudinaryUrl(url: string): boolean {
  return cloudinaryUpload.test(url);
}

export function isPhotoUrl(url: string): boolean {
  return isCloudinaryUrl(url) || samplePlaceholder.test(url);
}

/** The Cloudinary URL for this photo at the given width, in the best format the browser accepts. */
export function cloudinaryUrlAtWidth(url: string, width: number): string {
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
