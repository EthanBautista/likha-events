import { getStore, type Store } from "@netlify/blobs";

// The Inquiries module (ADR 0004) owns reading and writing Inquiries. Each Inquiry is one JSON
// record in Netlify Blobs, keyed by its id. Functions are thin layers over it.

export type InquiryStatus = "New" | "Quoted" | "Booked" | "Done" | "Declined";

export interface Inquiry {
  id: string;
  /** The customer's name. */
  name: string;
  status: InquiryStatus;
  /** When the Inquiry was received, as an ISO timestamp. */
  receivedAt: string;
}

export interface Inquiries {
  /** Every Inquiry. */
  list(): Promise<Inquiry[]>;
}

export function inquiriesIn(store: Store): Inquiries {
  return {
    async list() {
      const { blobs } = await store.list();
      const records = await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json" }) as Promise<Inquiry | null>));
      // A record deleted between listing and reading it is simply left out.
      return records.filter((record) => record !== null);
    },
  };
}

/** The site's Inquiries on Netlify. Read strongly, so a change shows on the dashboard straight away. */
export const netlifyInquiries = (): Inquiries => inquiriesIn(getStore({ name: "inquiries", consistency: "strong" }));
