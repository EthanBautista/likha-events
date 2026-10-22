import { getCollection, type CollectionEntry } from "astro:content";

type PackageCollection = "packages" | "weddingPackages";

/** A Package or a Wedding Package: Wedding Packages are Packages listed apart. */
export type Package = CollectionEntry<PackageCollection>;

async function inOrder(collection: PackageCollection): Promise<Package[]> {
  const packages: Package[] = await getCollection(collection);
  return packages.toSorted((a, b) => a.data.order - b.data.order);
}

async function lowestPrice(collection: PackageCollection): Promise<number | undefined> {
  const packages: Package[] = await getCollection(collection);
  if (packages.length === 0) return undefined;
  return Math.min(...packages.map((pkg) => pkg.data.price));
}

/** Every Package, in the display order the owner set. Wedding Packages aren't among them. */
export function getPackagesInOrder(): Promise<Package[]> {
  return inOrder("packages");
}

/**
 * The cheapest Package's price, for "Packages from $X" here and on the homepage. Wedding Packages
 * don't count, so their prices never raise it.
 * Undefined when the owner has removed every Package, so pages can drop the "from" price.
 */
export function getLowestPackagePrice(): Promise<number | undefined> {
  return lowestPrice("packages");
}

/** Every Wedding Package, in the display order the owner set. */
export function getWeddingPackagesInOrder(): Promise<Package[]> {
  return inOrder("weddingPackages");
}

/**
 * The cheapest Wedding Package's price, for "Wedding Packages from $Y".
 * Undefined when the owner has removed every Wedding Package, so pages can leave them out.
 */
export function getLowestWeddingPackagePrice(): Promise<number | undefined> {
  return lowestPrice("weddingPackages");
}

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/** A whole-dollar CAD price the way a visitor reads it, such as "$1,200". */
export function formatPrice(price: number): string {
  return cad.format(price);
}
