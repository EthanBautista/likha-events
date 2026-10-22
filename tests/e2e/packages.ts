import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Package and Wedding Package content files, read as plain data so tests follow whatever Packages
// the site has, sample or real, instead of hard-coding them.
const contentDir = join(import.meta.dirname, "../../src/content");

export interface PackageFile {
  name: string;
  price: number;
  included: string[];
  order: number;
  sample?: boolean;
}

function readInOrder(folder: string): PackageFile[] {
  const dir = join(contentDir, folder);
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as PackageFile)
    .sort((a, b) => a.order - b.order);
}

/** Every Package, in the display order the owner set. */
export function readPackagesInOrder(): PackageFile[] {
  return readInOrder("packages");
}

/** Every Wedding Package, in the display order the owner set. */
export function readWeddingPackagesInOrder(): PackageFile[] {
  return readInOrder("wedding-packages");
}

/** A whole-dollar CAD price the way a visitor reads it, such as "$1,200". */
export function dollars(price: number): string {
  return `$${price.toLocaleString("en-CA")}`;
}
