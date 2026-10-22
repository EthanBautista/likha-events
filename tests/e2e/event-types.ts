import { readFileSync } from "node:fs";
import { join } from "node:path";

// The owner's Event types list, read as plain data so tests follow whatever names the list holds.
const eventTypesFile = join(import.meta.dirname, "../../src/content/event-types.json");

/** The names on the owner's list, as written there. Other is never on it. */
function readEventTypeNames(): string[] {
  return (JSON.parse(readFileSync(eventTypesFile, "utf8")) as { names: string[] }).names;
}

/** The Event types the spec says forms offer: the list alphabetically, then Other. */
export function eventTypesForForms(): string[] {
  return [...readEventTypeNames().toSorted((a, b) => a.localeCompare(b)), "Other"];
}

/**
 * The Event types the spec says get a gallery pill, given the Setups: those with at least one Setup, the most
 * Setups first, ties alphabetically, then Other. A Setup whose Event type isn't on the list counts as Other.
 */
export function eventTypesInGallery(setups: { eventType: string }[]): string[] {
  const names = readEventTypeNames();
  const count = (name: string) =>
    setups.filter((setup) => (names.includes(setup.eventType) ? setup.eventType : "Other") === name).length;
  const named = names.filter((name) => count(name) > 0).toSorted((a, b) => count(b) - count(a) || a.localeCompare(b));
  return count("Other") > 0 ? [...named, "Other"] : named;
}

/** The Event types on the list that no Setup has. */
export function eventTypesWithoutSetups(setups: { eventType: string }[]): string[] {
  return readEventTypeNames().filter((name) => !setups.some((setup) => setup.eventType === name));
}
