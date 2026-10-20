import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The Rental content files, read as plain data so tests follow whatever Rentals the site has,
// sample or real, instead of hard-coding them.
const rentalsDir = join(import.meta.dirname, "../../src/content/rentals");

export interface RentalFile {
  name: string;
  photo: string;
  price: number;
  description: string;
  order: number;
  sample?: boolean;
}

/** Every Rental, in the display order the owner set. */
export function readRentalsInOrder(): RentalFile[] {
  return readdirSync(rentalsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(join(rentalsDir, name), "utf8")) as RentalFile)
    .sort((a, b) => a.order - b.order);
}
