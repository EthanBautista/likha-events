# 03: Inquiry status, filtering and notes

**What to build:** The owner moves each Inquiry to any Inquiry status (New, Quoted, Booked, Done, Declined), filters the list by status, always sees how many are New, and writes notes on an Inquiry. See the spec: `.scratch/inquiry-dashboard/spec.md` (The list).

**Blocked by:** 02

**Status:** done

- [x] Any status can be set from any status. Nothing changes status automatically
- [x] A status filter with All the default
- [x] A count of New Inquiries always visible
- [x] Notes, editable and saved on the Inquiry
- [x] A contact-form Inquiry's customer answers can't be edited (enforced by the Inquiries module, not just hidden)
- [x] Tests: any-to-any status, filtering, the New count, notes, the refused edit
