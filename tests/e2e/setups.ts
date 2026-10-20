import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Setup content files, read as plain data so tests follow whatever Setups the site has,
// sample or real, instead of hard-coding them.
const setupsDir = join(import.meta.dirname, "../../src/content/setups");

export interface SetupFile {
  caption: string;
  eventType: string;
  /** The photos after the cover. */
  photos?: string[];
  featured?: boolean;
  date?: string;
  sample?: boolean;
}

/** The site's Setups, or those in another folder of Setup files, such as a test fixture. */
export function readSetups(dir = setupsDir): SetupFile[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as SetupFile);
}

/** Dated Setups newest first, undated ones last. */
function newestFirst(setups: SetupFile[]): SetupFile[] {
  const dated = setups.filter((setup) => setup.date).sort((a, b) => b.date!.localeCompare(a.date!));
  const undated = setups.filter((setup) => !setup.date);
  return [...dated, ...undated];
}

/** Captions in the order the spec says the gallery shows them. */
export function captionsNewestFirst(setups: SetupFile[]): string[] {
  return newestFirst(setups).map((setup) => setup.caption);
}

/**
 * Captions of the Setups the spec says the homepage shows: up to three featured ones, newest first,
 * topped up with the newest unfeatured ones when fewer than three are featured.
 */
export function homepageCaptions(setups: SetupFile[]): string[] {
  const sorted = newestFirst(setups);
  const featured = sorted.filter((setup) => setup.featured);
  const unfeatured = sorted.filter((setup) => !setup.featured);
  return [...featured, ...unfeatured].slice(0, 3).map((setup) => setup.caption);
}
