import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Setup content files, read as plain data so tests follow whatever Setups the site has,
// sample or real, instead of hard-coding them.
const setupsDir = join(import.meta.dirname, "../../src/content/setups");

export interface SetupFile {
  caption: string;
  eventType: string;
  coverPhoto: string;
  photos?: string[];
  date?: string;
  sample?: boolean;
}

export function readSetups(): SetupFile[] {
  return readdirSync(setupsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(setupsDir, name), "utf8")) as SetupFile);
}

/** Captions in the order the spec says the gallery shows them: dated Setups newest first, undated ones last. */
export function captionsNewestFirst(setups: SetupFile[]): string[] {
  const dated = setups.filter((setup) => setup.date).sort((a, b) => b.date!.localeCompare(a.date!));
  const undated = setups.filter((setup) => !setup.date);
  return [...dated, ...undated].map((setup) => setup.caption);
}
