import { getCollection, type CollectionEntry } from "astro:content";

export type Package = CollectionEntry<"packages">;

/** Every Package, in the display order the owner set. */
export async function getPackagesInOrder(): Promise<Package[]> {
  const packages = await getCollection("packages");
  return packages.toSorted((a, b) => a.data.order - b.data.order);
}

/** The cheapest Package's price, for "Packages from $X" here and on the homepage. */
export async function getLowestPackagePrice(): Promise<number> {
  const packages = await getCollection("packages");
  if (packages.length === 0) throw new Error("There are no Packages, so there is no 'from' price to show.");
  return Math.min(...packages.map((pkg) => pkg.data.price));
}

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/** A whole-dollar CAD price the way a visitor reads it, such as "$1,200". */
export function formatPrice(price: number): string {
  return cad.format(price);
}
