import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { eventTypesSchema, packageSchema, rentalSchema, setupSchema } from "./content-schemas";

// Every content file is checked against these schemas at build time, so invalid content fails
// the build instead of going live.

const setups = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/setups" }),
  schema: setupSchema,
});

const packages = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/packages" }),
  schema: packageSchema,
});

// Wedding Packages are Packages listed apart, so they're checked by the same schema.
const weddingPackages = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/wedding-packages" }),
  schema: packageSchema,
});

const rentals = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/rentals" }),
  schema: rentalSchema,
});

// The Event types list is one file, so it's one entry.
const eventTypes = defineCollection({
  loader: file("src/content/event-types.json", { parser: (text) => ({ "event-types": JSON.parse(text) }) }),
  schema: eventTypesSchema,
});

export const collections = { setups, packages, weddingPackages, rentals, eventTypes };
