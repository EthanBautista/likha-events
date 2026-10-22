import type { InquiryStatus } from "./inquiry-statuses";

// Money on an Inquiry, shared by the Inquiries module and the dashboard, so the two always agree. Money is
// in CAD and kept as whole cents, used exactly as entered, with nothing done for HST.

/** An Inquiry's amounts the owner keeps, each in whole cents. */
export const amounts = ["agreedPrice", "downPayment", "balance"] as const;

export type AmountField = (typeof amounts)[number];

/** The Inquiry statuses whose Balance is still to be paid, so Owed is counted on them. */
export const owedStatuses: readonly InquiryStatus[] = ["Booked", "Done"];

/** What Owed goes by: an Inquiry's status and amounts. */
interface WithAmounts extends Partial<Record<AmountField, number>> {
  status: InquiryStatus;
}

/**
 * What's still Owed on an Inquiry, in whole cents: its Agreed price less the Down payment and Balance
 * received, never below zero. Undefined unless it's Booked or Done, or with no Agreed price to go by.
 */
export function owed({ status, agreedPrice, downPayment = 0, balance = 0 }: WithAmounts): number | undefined {
  if (!owedStatuses.includes(status) || agreedPrice === undefined) return undefined;
  return Math.max(0, agreedPrice - downPayment - balance);
}

/** One thing the owner spent money on for an Inquiry's event, its amount in whole cents. */
export interface Cost {
  description: string;
  amount: number;
}

/**
 * An amount as the owner enters it, in dollars with or without cents, such as "650", "650.5", "$1,250.00",
 * in whole cents. Null when nothing is entered, and undefined when it isn't an amount.
 */
export function centsIn(entered: string): number | null | undefined {
  const given = entered.trim().replace(/^\$\s*/, "");
  if (!given) return null;
  // A comma only ever groups thousands, so "650,50" isn't taken for $65,050.
  if (given.includes(",") && !/^\d{1,3}(,\d{3})+(\.\d*)?$/.test(given)) return undefined;
  const match = given.replaceAll(",", "").match(/^(\d*)(?:\.(\d{0,2}))?$/);
  if (!match || !(match[1] || match[2])) return undefined;
  const cents = Number(match[1] || 0) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : undefined;
}

/** Whole cents as the owner enters them, such as "1250.00", for an amount field to hold. */
export const asEntered = (cents: number) => `${Math.trunc(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

/** Whole cents in Canadian dollars, such as "$1,250.00". */
export const dollars = (cents: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);

/** The total of an Inquiry's Costs, in whole cents. */
export const costsTotal = ({ costs = [] }: { costs?: Cost[] }) => costs.reduce((total, { amount }) => total + amount, 0);
