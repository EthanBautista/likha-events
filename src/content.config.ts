import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { eventTypes } from "./event-types";
import { isPhotoUrl } from "./photos";

// Every content file is checked against these schemas at build time, so invalid content fails
// the build instead of going live.

const photo = z.string().refine(isPhotoUrl, "must be a Cloudinary image URL or a bundled sample placeholder");

const setups = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/setups" }),
  schema: z.object({
    caption: z.string().trim().min(1),
    eventType: z.enum(eventTypes),
    coverPhoto: photo,
    /** Photos shown after the cover, so a Setup has at most 9 in all. */
    photos: z.array(photo).max(8).default([]),
    featured: z.boolean().default(false),
    /** When the event took place, used to sort newest first. */
    date: z.coerce.date().optional(),
    /** Placeholder content shipped before launch, marked "Sample" on the site. */
    sample: z.boolean().default(false),
  }),
});

const packages = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/packages" }),
  schema: z.object({
    name: z.string().trim().min(1),
    /** In CAD, whole dollars. */
    price: z.number().int().positive(),
    /** What's included, one short line each. */
    included: z.array(z.string().trim().min(1)).min(1),
    /** Where the Package appears on the page, lowest first. */
    order: z.number(),
    /** Placeholder content shipped before launch, marked "Sample" on the site. */
    sample: z.boolean().default(false),
  }),
});

export const collections = { setups, packages };
