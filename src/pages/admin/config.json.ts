import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { editorConfig } from "../../editor-config";
import { getEventTypes } from "../../event-types-list";

// The editor page loads its configuration from here. Every save rebuilds the site, so a new
// Package or Rental is offered the display order after the highest one saved so far.

async function nextDisplayOrder(collection: "packages" | "rentals"): Promise<number> {
  const entries = await getCollection(collection);
  return Math.max(0, ...entries.map((entry) => entry.data.order)) + 1;
}

export const GET: APIRoute = async () => {
  const nextOrders = { packages: await nextDisplayOrder("packages"), rentals: await nextDisplayOrder("rentals") };
  const config = editorConfig(nextOrders, await getEventTypes());
  return new Response(JSON.stringify(config, null, 2), { headers: { "Content-Type": "application/json" } });
};
