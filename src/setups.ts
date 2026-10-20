import { getCollection, type CollectionEntry } from "astro:content";

export type Setup = CollectionEntry<"setups">;

/** Every Setup, newest first. Setups without a date come last. */
export async function getSetupsNewestFirst(): Promise<Setup[]> {
  const setups = await getCollection("setups");
  const time = (setup: Setup) => setup.data.date?.getTime() ?? Number.MIN_SAFE_INTEGER;
  return setups.toSorted((a, b) => time(b) - time(a));
}

/**
 * The Setups shown on the homepage: up to three featured ones, newest first. When the owner
 * features fewer than three, the newest unfeatured Setups fill the gap so the section never looks empty.
 */
export async function getHomepageSetups(): Promise<Setup[]> {
  const setups = await getSetupsNewestFirst();
  const featured = setups.filter((setup) => setup.data.featured);
  const unfeatured = setups.filter((setup) => !setup.data.featured);
  return [...featured, ...unfeatured].slice(0, 3);
}
