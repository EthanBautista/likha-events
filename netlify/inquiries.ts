import { getStore, type Store } from "@netlify/blobs";
import { eventTiming, eventTimings, torontoToday } from "../src/inquiry-dates";
import { photoFields } from "../src/inquiry-form";

// The Inquiries module (ADR 0004) owns reading and writing Inquiries. Each Inquiry is one JSON
// record in Netlify Blobs, keyed by its id, and its inspiration photos are blobs in a store of their
// own, referenced from the record. Functions are thin layers over it.

export type InquiryStatus = "New" | "Quoted" | "Booked" | "Done" | "Declined";

export type InquirySource = "Contact form" | "Instagram" | "Facebook";

export interface Inquiry {
  id: string;
  status: InquiryStatus;
  source: InquirySource;
  /** When the Inquiry was received, as an ISO timestamp. */
  receivedAt: string;
  // What the customer sent, kept exactly as sent. Optional answers left empty are left out.
  /** The customer's name. */
  name: string;
  /** A phone number or email, or for a hand-added Inquiry, an Instagram or Facebook handle. */
  contact: string;
  /** The event's date, as YYYY-MM-DD. */
  eventDate?: string;
  venue?: string;
  eventType?: string;
  guests?: string;
  theme?: string;
  decor?: string;
  photos: InquiryPhoto[];
}

/** An inspiration photo, or one that couldn't be saved. A saved one is served by its id. */
export type InquiryPhoto = { name: string; id: string } | { name: string; missing: true };

/** What Netlify sends the submission-created function for each submission that passes its spam filter. */
export interface FormSubmission {
  id: string;
  form_name: string;
  created_at: string;
  data: Record<string, unknown>;
}

/** Fetches a file from one of Netlify's file links. Tests substitute their own. */
export type FetchFile = (url: string) => Promise<Response>;

/** A saved inspiration photo's bytes and media type. */
export interface PhotoFile {
  body: ArrayBuffer;
  type: string;
}

export interface Inquiries {
  /**
   * Every Inquiry: upcoming events soonest first, then past events most recent first, then those with
   * no event date. Today, as YYYY-MM-DD, counts as upcoming; it defaults to today in Toronto.
   */
  list(today?: string): Promise<Inquiry[]>;
  /**
   * Saves an Inquiry sent through the contact form, as New. Submissions of other forms are ignored.
   * Its photos are copied straight away, as Netlify's links to them don't last.
   */
  receive(submission: FormSubmission): Promise<void>;
  /** A saved inspiration photo, by its id. */
  photo(id: string): Promise<PhotoFile | undefined>;
}

/** The contact form's name, and its fields for each customer answer. */
const contactForm = "inquiry";
const answerFields = {
  eventDate: "event-date",
  venue: "venue",
  eventType: "event-type",
  guests: "guests",
  theme: "theme",
  decor: "decor",
} as const;

export function inquiriesIn(records: Store, photoStore: Store, fetchFile: FetchFile = fetch): Inquiries {
  /** Copies a photo into the store. One that can't be copied is noted as missing, and the Inquiry is still saved. */
  async function copyPhoto({ url, name, type }: Upload, id: string): Promise<InquiryPhoto> {
    try {
      const response = await fetchFile(url);
      if (!response.ok) throw new Error(`Netlify answered ${response.status}`);
      const body = await response.arrayBuffer();
      const fetchedType = response.headers.get("Content-Type") ?? "";
      await photoStore.set(id, body, { metadata: { type: isImage(type) ? type : isImage(fetchedType) ? fetchedType : "" } });
      return { name, id };
    } catch (error) {
      console.error(`Couldn't copy inspiration photo ${id}:`, error);
      return { name, missing: true };
    }
  }

  return {
    async list(today = torontoToday()) {
      const { blobs } = await records.list();
      const found = await Promise.all(blobs.map(({ key }) => records.get(key, { type: "json" }) as Promise<Inquiry | null>));
      // A record deleted between listing and reading it is simply left out.
      return found.filter((record) => record !== null).sort(inListOrder(today));
    },

    async receive({ id, form_name, created_at, data }) {
      if (form_name !== contactForm) return;
      const text = (field: string) => (typeof data[field] === "string" ? data[field] : "");

      const inquiry: Inquiry = {
        id,
        status: "New",
        source: "Contact form",
        receivedAt: created_at,
        name: text("name"),
        contact: text("contact"),
        photos: [],
      };
      for (const [key, field] of Object.entries(answerFields)) {
        if (text(field)) inquiry[key as keyof typeof answerFields] = text(field);
      }
      const uploads = photoFields.map((field) => uploadIn(data[field])).filter((upload) => upload !== undefined);
      inquiry.photos = await Promise.all(uploads.map((upload, index) => copyPhoto(upload, `${id}-${index + 1}`)));
      await records.setJSON(id, inquiry);
    },

    async photo(id) {
      const found = await photoStore.getWithMetadata(id, { type: "arrayBuffer" });
      if (!found) return undefined;
      return { body: found.data, type: String(found.metadata.type) };
    },
  };
}

/** Orders Inquiries for the list, given today's date. Ties go to the one received most recently. */
function inListOrder(today: string) {
  const group = ({ eventDate }: Inquiry) => eventTimings.indexOf(eventTiming(eventDate, today));
  return (a: Inquiry, b: Inquiry) => {
    const byGroup = group(a) - group(b);
    if (byGroup) return byGroup;
    const [first, second] = eventTiming(a.eventDate, today) === "Upcoming" ? [a, b] : [b, a];
    const byDate = (first.eventDate ?? "").localeCompare(second.eventDate ?? "");
    return byDate || b.receivedAt.localeCompare(a.receivedAt);
  };
}

/** A file in a submission: Netlify's link to it, its name and the media type the browser gave it. */
interface Upload {
  url: string;
  name: string;
  type: string;
}

/** The file in a submission's file field, if one was sent. Netlify gives its details, or just its link. */
function uploadIn(value: unknown): Upload | undefined {
  if (typeof value === "string") return value ? { url: value, name: fileNameIn(value), type: "" } : undefined;
  if (typeof value !== "object" || value === null) return undefined;
  const { url, filename, type } = value as Record<string, unknown>;
  if (typeof url !== "string" || !url) return undefined;
  return {
    url,
    name: typeof filename === "string" && filename ? filename : fileNameIn(url),
    type: typeof type === "string" ? type : "",
  };
}

function fileNameIn(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "") || "Photo";
  } catch {
    return "Photo";
  }
}

const isImage = (type: string) => /^image\/[\w.+-]+$/.test(type);

/** The site's Inquiries on Netlify. Read strongly, so a change shows on the dashboard straight away. */
export const netlifyInquiries = (): Inquiries =>
  inquiriesIn(
    getStore({ name: "inquiries", consistency: "strong" }),
    getStore({ name: "inquiry-photos", consistency: "strong" }),
  );
