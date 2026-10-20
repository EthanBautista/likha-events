// The Event types a Setup can be for, defined once. The Setup schema reads this list, and the
// gallery filter, contact form and editor page are to read it too, so a new Event type is added here only.
export const eventTypes = ["Baby shower", "Birthday", "Other"] as const;

export type EventType = (typeof eventTypes)[number];

/** How an Event type is written in a URL, such as the gallery's `?type=baby-shower`. */
export const eventTypeSlug = (eventType: EventType) => eventType.toLowerCase().replaceAll(" ", "-");
