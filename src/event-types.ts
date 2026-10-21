// What the Event types are, for the whole site. The owner keeps the list in the editor, and the gallery,
// contact form and editor page read it only from here (through getEventTypes in event-types-list.ts).

/** The catch-all Event type. It isn't on the owner's list: the site always adds it, so it can't be removed or renamed. */
export const otherEventType = "Other";

/** How an Event type is written in a URL, such as the gallery's `?type=baby-shower`. */
export const eventTypeSlug = (eventType: string) => eventType.toLowerCase().replaceAll(" ", "-");

/** Names that differ only in capitals or surrounding spaces are one Event type. */
const sameName = (name: string) => name.trim().toLowerCase();

const alphabetically = (a: string, b: string) => a.localeCompare(b);

/** A Setup, as far as its Event type goes. */
type WithEventType = { data: { eventType: string } };

export interface EventTypes {
  /** Every Event type, for forms: the owner's list alphabetically, then Other. */
  all: string[];
  /** A Setup's effective Event type: its stored one if that's on the list, otherwise Other. */
  of: (setup: WithEventType) => string;
  /** The Event types that have Setups, the most Setups first, ties alphabetically, then Other. */
  inGallery: (setups: WithEventType[]) => string[];
}

/**
 * The Event types, given the owner's list of names. A repeated name keeps its first spelling. A blank
 * name, or Other, is left out: the editor refuses both, and a slip in the list never breaks the site.
 */
export function eventTypesFrom(names: string[]): EventTypes {
  const listed = new Map<string, string>();
  for (const name of names) {
    const key = sameName(name);
    if (key && key !== sameName(otherEventType) && !listed.has(key)) listed.set(key, name.trim());
  }
  const all = [...[...listed.values()].toSorted(alphabetically), otherEventType];
  const of: EventTypes["of"] = (setup) => listed.get(sameName(setup.data.eventType)) ?? otherEventType;

  const inGallery: EventTypes["inGallery"] = (setups) => {
    const counts = Map.groupBy(setups, of);
    const count = (eventType: string) => counts.get(eventType)?.length ?? 0;
    const named = [...listed.values()].filter((eventType) => count(eventType) > 0);
    const byCount = named.toSorted((a, b) => count(b) - count(a) || alphabetically(a, b));
    return count(otherEventType) > 0 ? [...byCount, otherEventType] : byCount;
  };

  return { all, of, inGallery };
}
