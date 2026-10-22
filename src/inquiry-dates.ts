// When an Inquiry's event falls, shared by the list function's order and the dashboard's groups, so
// the two always agree.

/** Upcoming events (today counts), past ones, and Inquiries with no event date, in list order. */
export const eventTimings = ["Upcoming", "Past", "No date yet"] as const;

export type EventTiming = (typeof eventTimings)[number];

/** Today's date in Toronto, as YYYY-MM-DD. */
export const torontoToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());

/** When an event falls, given its date and today's, both as YYYY-MM-DD. */
export const eventTiming = (eventDate: string | undefined, today: string): EventTiming =>
  !eventDate ? "No date yet" : eventDate >= today ? "Upcoming" : "Past";
