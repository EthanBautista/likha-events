import { getStore, type Store } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import { inListOrder, torontoToday } from "../src/inquiry-dates";
import { customerAnswers, maxPhotos, photoFields } from "../src/inquiry-form";
import { handAddedSources, type HandAddedSource, type InquirySource } from "../src/inquiry-sources";
import { inquiryStatuses, type InquiryStatus } from "../src/inquiry-statuses";

// The Inquiries module (ADR 0004) owns reading and writing Inquiries. Each Inquiry is one JSON
// record in Netlify Blobs, keyed by its id, and its inspiration photos are blobs in a store of their
// own, referenced from the record. Functions are thin layers over it.

export type { HandAddedSource, InquirySource, InquiryStatus };

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
  // Kept by the owner.
  /** The owner's notes, left out when there are none. */
  notes?: string;
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

/** An inspiration photo the owner attaches, with its file's name. */
export interface NewPhoto extends PhotoFile {
  name: string;
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
  /**
   * Saves an Inquiry the owner adds by hand from an Instagram or Facebook message, as New, received now.
   * Only a name and a way to reach the customer are needed; details left empty are left out.
   */
  add(details: NewInquiry): Promise<Inquiry>;
  /**
   * Attaches an inspiration photo, such as a screenshot of the chat, to an Inquiry added by hand, and
   * gives it back as it now is, or undefined if it isn't there. It takes as many as the contact form.
   */
  addPhoto(id: string, photo: NewPhoto): Promise<Inquiry | undefined>;
  /** A saved inspiration photo, by its id. */
  photo(id: string): Promise<PhotoFile | undefined>;
  /** Changes an Inquiry, and gives it back as it now is, or undefined if it isn't there. */
  change(id: string, changes: InquiryChanges): Promise<Inquiry | undefined>;
  /**
   * Deletes an Inquiry and its inspiration photos, such as spam that slipped through or a duplicate.
   * True once deleted, or false if it isn't there.
   */
  delete(id: string): Promise<boolean>;
}

/**
 * A change to an Inquiry. Any Inquiry status can be set from any other. A contact-form Inquiry's
 * customer answers and source are kept exactly as sent, so a change to one of them is refused. One
 * added by hand can have its details and source changed, and an optional detail left empty is taken off.
 */
export type InquiryChanges = Partial<Pick<Inquiry, CustomerAnswer>> & {
  source?: HandAddedSource;
  status?: InquiryStatus;
  /** The Inquiry's notes, in place of those it had. Notes of only spaces clear them. */
  notes?: string;
};

/** An Inquiry the owner adds by hand: where it came from, and what they know of the customer so far. */
export type NewInquiry = Pick<Inquiry, "name" | "contact"> & Partial<Pick<Inquiry, CustomerAnswer>> & { source: HandAddedSource };

/** An Inquiry's fields that hold what the customer sent, apart from their photos. */
type CustomerAnswer = (typeof customerAnswers)[number];

/** Something the Inquiries module won't save, saying why. Nothing is saved or changed. */
export class Refused extends Error {}

/** The contact form's name, and its fields for each customer answer. */
const contactForm = "inquiry";
const answerFields: Record<Exclude<CustomerAnswer, "name" | "contact">, string> = {
  eventDate: "event-date",
  venue: "venue",
  eventType: "event-type",
  guests: "guests",
  theme: "theme",
  decor: "decor",
};

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

    async add(details) {
      refuseNewInquiryItCantTake(details);
      const { source, ...given } = details;
      const inquiry: Inquiry = { id: randomUUID(), status: "New", source, receivedAt: new Date().toISOString(), name: "", contact: "", photos: [] };
      withDetails(inquiry, given);
      await records.setJSON(inquiry.id, inquiry);
      return inquiry;
    },

    async addPhoto(id, { name, body, type }) {
      const inquiry = (await records.get(id, { type: "json" })) as Inquiry | null;
      if (!inquiry) return undefined;
      if (inquiry.source === "Contact form") throw new Refused("A contact-form Inquiry keeps the photos the customer sent.");
      if (inquiry.photos.length >= maxPhotos) throw new Refused(`An Inquiry has up to ${maxPhotos} inspiration photos.`);
      if (!isImage(type)) throw new Refused("An inspiration photo is an image.");

      const photo = { name: name.trim() || "Photo", id: `${id}-${randomUUID()}` };
      await photoStore.set(photo.id, body, { metadata: { type } });
      const changed = { ...inquiry, photos: [...inquiry.photos, photo] };
      await records.setJSON(id, changed);
      return changed;
    },

    async photo(id) {
      const found = await photoStore.getWithMetadata(id, { type: "arrayBuffer" });
      if (!found) return undefined;
      return { body: found.data, type: String(found.metadata.type) };
    },

    async change(id, changes) {
      const inquiry = (await records.get(id, { type: "json" })) as Inquiry | null;
      if (!inquiry) return undefined;
      refuseChangesItCantTake(changes, inquiry);
      const { status, notes, source, ...details } = changes;
      const changed = { ...inquiry, ...(status && { status }), ...(source && { source }), ...(notes !== undefined && { notes }) };
      if (!changed.notes?.trim()) delete changed.notes;
      withDetails(changed, details);
      await records.setJSON(id, changed);
      return changed;
    },

    async delete(id) {
      const inquiry = (await records.get(id, { type: "json" })) as Inquiry | null;
      if (!inquiry) return false;
      // The photos go first, so none is left behind with no Inquiry pointing to it.
      await Promise.all(inquiry.photos.map((photo) => "id" in photo && photoStore.delete(photo.id)));
      await records.delete(id);
      return true;
    },
  };
}

/**
 * Refuses changes the owner can't make to this Inquiry. They come from the dashboard as they were sent,
 * so each one is checked here.
 */
function refuseChangesItCantTake(changes: unknown, inquiry: Inquiry): asserts changes is InquiryChanges {
  if (typeof changes !== "object" || changes === null || Array.isArray(changes)) throw new Refused("Send the changes to make.");
  for (const [field, value] of Object.entries(changes)) {
    if (field === "status") {
      if (!inquiryStatuses.includes(value)) throw new Refused(`An Inquiry status is one of ${inquiryStatuses.join(", ")}.`);
    } else if (field === "notes") {
      if (typeof value !== "string") throw new Refused("Notes are text.");
    } else if (inquiry.source === "Contact form" && (isCustomerAnswer(field) || field === "source")) {
      throw new Refused("A contact-form Inquiry keeps the customer's answers exactly as they sent them.");
    } else if (field === "source") {
      if (!handAddedSources.includes(value)) throw new Refused(`An Inquiry added by hand came from ${handAddedSources.join(" or ")}.`);
    } else if (isCustomerAnswer(field)) {
      refuseDetailItCantTake(field, value);
    } else {
      throw new Refused(`An Inquiry's ${field} can't be changed.`);
    }
  }
}

/** Refuses an Inquiry the owner can't add. It comes from the dashboard as it was sent, so it's checked here. */
function refuseNewInquiryItCantTake(details: unknown): asserts details is NewInquiry {
  if (typeof details !== "object" || details === null || Array.isArray(details)) throw new Refused("Send the Inquiry to add.");
  const { source, ...given } = details as Record<string, unknown>;
  if (!handAddedSources.includes(source as HandAddedSource)) throw new Refused(`Say whether it came from ${handAddedSources.join(" or ")}.`);
  for (const required of ["name", "contact"] as const) if (!(required in given)) refuseDetailItCantTake(required, "");
  for (const [field, value] of Object.entries(given)) {
    if (!isCustomerAnswer(field)) throw new Refused(`An Inquiry added by hand can't be given its ${field}.`);
    refuseDetailItCantTake(field, value);
  }
}

/**
 * Refuses a customer detail the owner gives that an Inquiry can't keep. A name and a way to reach them
 * are always needed; anything else can be left empty.
 */
function refuseDetailItCantTake(field: CustomerAnswer, value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Refused(`An Inquiry's ${field} is text.`);
  const given = value.trim();
  if (field === "name" && !given) throw new Refused("Give the customer's name.");
  if (field === "contact" && !given) throw new Refused("Give a way to reach the customer, such as a phone number, email or handle.");
  if (field === "eventDate" && given && !isDay(given)) throw new Refused("An event date is a day on the calendar, written as YYYY-MM-DD.");
  // As the contact form takes it, so every Inquiry's guests read the same way.
  if (field === "guests" && given && !/^[1-9]\d*$/.test(given)) throw new Refused("The number of guests is a whole number, like 40.");
}

/** Whether a date, as YYYY-MM-DD, is a day on the calendar, so it sorts and shows as one. */
const isDay = (date: string) => {
  const day = new Date(`${date}T00:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(day.getTime()) && day.toISOString().startsWith(date);
};

/** Gives an Inquiry the customer details the owner gave, already checked. One left empty is taken off. */
function withDetails(inquiry: Inquiry, details: Partial<Pick<Inquiry, CustomerAnswer>>) {
  for (const [field, value] of Object.entries(details) as [CustomerAnswer, string][]) {
    if (value.trim()) inquiry[field] = value.trim();
    else delete inquiry[field];
  }
}

const isCustomerAnswer = (field: string): field is CustomerAnswer => (customerAnswers as readonly string[]).includes(field);

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
