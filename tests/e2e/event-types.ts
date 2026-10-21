import { readFileSync } from "node:fs";
import { join } from "node:path";

// The owner's Event types list, read as plain data so tests follow whatever names the list holds.
const eventTypesFile = join(import.meta.dirname, "../../src/content/event-types.json");

/** The names on the owner's list, as written there. Other is never on it. */
export function readEventTypeNames(): string[] {
  return (JSON.parse(readFileSync(eventTypesFile, "utf8")) as { names: string[] }).names;
}

/** The Event types the spec says forms offer: the list alphabetically, then Other. */
export function eventTypesForForms(): string[] {
  return [...readEventTypeNames().toSorted((a, b) => a.localeCompare(b)), "Other"];
}
