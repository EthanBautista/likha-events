// The Inquiry statuses, shared by the Inquiries module and the dashboard's status choices and filter,
// so the two always agree.

/** Every Inquiry status, in the order an Inquiry usually moves through them. */
export const inquiryStatuses = ["New", "Quoted", "Booked", "Done", "Declined"] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];
