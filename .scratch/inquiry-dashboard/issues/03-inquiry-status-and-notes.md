# 03: Inquiry status, filtering and notes

**What to build:** The owner moves each Inquiry to any Inquiry status (New, Quoted, Booked, Done, Declined), filters the list by status, always sees how many are New, and writes notes on an Inquiry. See the spec: `.scratch/inquiry-dashboard/spec.md` (The list).

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Any status can be set from any status. Nothing changes status automatically
- [ ] A status filter with All the default
- [ ] A count of New Inquiries always visible
- [ ] Notes, editable and saved on the Inquiry
- [ ] A contact-form Inquiry's customer answers can't be edited (enforced by the Inquiries module, not just hidden)
- [ ] Tests: any-to-any status, filtering, the New count, notes, the refused edit
