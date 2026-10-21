import { getEntry } from "astro:content";
import { eventTypesFrom, type EventTypes } from "./event-types";

// Reads the owner's Event types list for event-types.ts. Kept apart so the content schemas and the
// tests can use event-types.ts outside Astro.

/** The site's Event types, from the owner's list. */
export async function getEventTypes(): Promise<EventTypes> {
  const list = await getEntry("eventTypes", "event-types");
  if (!list) throw new Error("The Event types list, src/content/event-types.json, is missing.");
  return eventTypesFrom(list.data.names);
}
