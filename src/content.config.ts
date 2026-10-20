import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { packageSchema, rentalSchema, setupSchema } from "./content-schemas";

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

const rentals = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/rentals" }),
  schema: rentalSchema,
});

export const collections = { setups, packages, rentals };
