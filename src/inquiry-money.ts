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

/** Money across Inquiries, in whole cents. */
export interface MoneyTotals {
  /** Down payments and Balances received, whatever each Inquiry's status. */
  earned: number;
  /** What's still Owed on Booked and Done Inquiries. */
  owed: number;
  /** Earned less the Costs of every Inquiry. Spending not tied to one event isn't in it. */
  profitOnEvents: number;
}

/** A month's totals, the month as YYYY-MM. */
export interface MonthTotals extends MoneyTotals {
  month: string;
}

/** A year's totals, with those of each of its months that has an event. */
export interface YearTotals extends MoneyTotals {
  year: string;
  months: MonthTotals[];
}

/** What the totals go by: an Inquiry's event date, as YYYY-MM-DD, its status, amounts and Costs. */
interface TotalledInquiry extends WithAmounts {
  eventDate?: string;
  costs?: Cost[];
}

/**
 * Earned, Owed and Profit on events, by the month and year of each Inquiry's event: the most recent
 * year first, and its months in calendar order. Inquiries with no event date are left out of them, and
 * counted as undated.
 */
export function totals(inquiries: TotalledInquiry[]): { years: YearTotals[]; undated: number } {
  const months = new Map<string, MonthTotals>();
  for (const inquiry of inquiries) {
    if (!inquiry.eventDate) continue;
    const month = inquiry.eventDate.slice(0, 7);
    const totalled = months.get(month) ?? { month, ...noMoney() };
    addTo(totalled, moneyOn(inquiry));
    months.set(month, totalled);
  }

  const years = new Map<string, YearTotals>();
  for (const totalled of [...months.values()].sort((a, b) => a.month.localeCompare(b.month))) {
    const year = totalled.month.slice(0, 4);
    const yearTotals = years.get(year) ?? { year, ...noMoney(), months: [] };
    addTo(yearTotals, totalled);
    yearTotals.months.push(totalled);
    years.set(year, yearTotals);
  }

  return {
    years: [...years.values()].sort((a, b) => b.year.localeCompare(a.year)),
    undated: inquiries.filter(({ eventDate }) => !eventDate).length,
  };
}

/** One Inquiry's part in the totals. */
function moneyOn(inquiry: TotalledInquiry): MoneyTotals {
  const earned = (inquiry.downPayment ?? 0) + (inquiry.balance ?? 0);
  return { earned, owed: owed(inquiry) ?? 0, profitOnEvents: earned - costsTotal(inquiry) };
}

/** Totals with no money in them yet. */
const noMoney = (): MoneyTotals => ({ earned: 0, owed: 0, profitOnEvents: 0 });

/** Adds money into the totals it's part of, changing them in place. */
function addTo(into: MoneyTotals, money: MoneyTotals) {
  into.earned += money.earned;
  into.owed += money.owed;
  into.profitOnEvents += money.profitOnEvents;
}
