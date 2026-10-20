import { getCollection, type CollectionEntry } from "astro:content";

export type Setup = CollectionEntry<"setups">;

/** Every Setup, newest first. Setups without a date come last. */
export async function getSetupsNewestFirst(): Promise<Setup[]> {
  const setups = await getCollection("setups");
  const time = (setup: Setup) => setup.data.date?.getTime() ?? Number.MIN_SAFE_INTEGER;
  return setups.toSorted((a, b) => time(b) - time(a));
}
