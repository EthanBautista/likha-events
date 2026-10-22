// When an Inquiry's event falls, and the list's order, shared by the Inquiries module and the
// dashboard's groups, so the two always agree.

/** Upcoming events (today counts), past ones, and Inquiries with no event date, in list order. */
export const eventTimings = ["Upcoming", "Past", "No date yet"] as const;

export type EventTiming = (typeof eventTimings)[number];

/** Today's date in Toronto, as YYYY-MM-DD. */
export const torontoToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());

/** When an event falls, given its date and today's, both as YYYY-MM-DD. */
export const eventTiming = (eventDate: string | undefined, today: string): EventTiming =>
  !eventDate ? "No date yet" : eventDate >= today ? "Upcoming" : "Past";

/** What the list's order goes by: an Inquiry's event date, and when it was received, as an ISO timestamp. */
interface Listed {
  eventDate?: string;
  receivedAt: string;
}

/**
 * Orders Inquiries for the list, given today's date: upcoming events soonest first, then past events most
 * recent first, then those with no event date. Ties go to the one received most recently.
 */
export function inListOrder(today: string) {
  const group = ({ eventDate }: Listed) => eventTimings.indexOf(eventTiming(eventDate, today));
  return (a: Listed, b: Listed) => {
    const byGroup = group(a) - group(b);
    if (byGroup) return byGroup;
    const [first, second] = eventTiming(a.eventDate, today) === "Upcoming" ? [a, b] : [b, a];
    const byDate = (first.eventDate ?? "").localeCompare(second.eventDate ?? "");
    return byDate || b.receivedAt.localeCompare(a.receivedAt);
  };
}
