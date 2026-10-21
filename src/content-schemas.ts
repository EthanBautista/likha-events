import { z } from "astro/zod";
import { other } from "./event-types";
import { isPhotoUrl } from "./photos";

// What each content entry must hold. The build checks every content file against these (see
// content.config.ts), and the editor page's fields are tested against them so the two never drift.

const photo = z.string().refine(isPhotoUrl, "must be a Cloudinary image URL or a bundled sample placeholder");

export const setupSchema = z.object({
  caption: z.string().trim().min(1),
  /** Any name: one that isn't on the Event types list is shown as Other, so tidying the list never breaks the site. */
  eventType: z.string().trim().min(1),
  coverPhoto: photo,
  /** Photos shown after the cover, so a Setup has at most 9 in all. */
  photos: z.array(photo).max(8).default([]),
  featured: z.boolean().default(false),
  /** When the event took place, used to sort newest first. */
  date: z.coerce.date().optional(),
  /** Placeholder content shipped before launch, marked "Sample" on the site. */
  sample: z.boolean().default(false),
});

/** The owner's list of Event types. Other isn't on it, because the site always adds it. */
export const eventTypesSchema = z.object({
  names: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine((name) => name.toLowerCase() !== other.toLowerCase(), "Other is always there, so it isn't on the list"),
    )
    .default([]),
});

export const packageSchema = z.object({
  name: z.string().trim().min(1),
  /** In CAD, whole dollars. */
  price: z.number().int().positive(),
  /** What's included, one short line each. */
  included: z.array(z.string().trim().min(1)).min(1),
  /** Where the Package appears on the page: 1 first, then 2, and so on. */
  order: z.number().int().min(1),
  /** Placeholder content shipped before launch, marked "Sample" on the site. */
  sample: z.boolean().default(false),
});

export const rentalSchema = z.object({
  name: z.string().trim().min(1),
  photo,
  /** Per event, in CAD, whole dollars. */
  price: z.number().int().positive(),
  /** One line saying what the Rental is. */
  description: z.string().trim().min(1),
  /** Where the Rental appears on the page: 1 first, then 2, and so on. */
  order: z.number().int().min(1),
  /** Placeholder content shipped before launch, marked "Sample" on the site. */
  sample: z.boolean().default(false),
});
