import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Package content files, read as plain data so tests follow whatever Packages the site has,
// sample or real, instead of hard-coding them.
const packagesDir = join(import.meta.dirname, "../../src/content/packages");

export interface PackageFile {
  name: string;
  price: number;
  included: string[];
  order: number;
  sample?: boolean;
}

/** Every Package, in the display order the owner set. */
export function readPackagesInOrder(): PackageFile[] {
  return readdirSync(packagesDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(packagesDir, name), "utf8")) as PackageFile)
    .sort((a, b) => a.order - b.order);
}

/** A whole-dollar CAD price the way a visitor reads it, such as "$1,200". */
export function dollars(price: number): string {
  return `$${price.toLocaleString("en-CA")}`;
}
