import { getCollection, type CollectionEntry } from "astro:content";

export type Rental = CollectionEntry<"rentals">;

/** Every Rental, in the display order the owner set. */
export async function getRentalsInOrder(): Promise<Rental[]> {
  const rentals = await getCollection("rentals");
  return rentals.toSorted((a, b) => a.data.order - b.data.order);
}
