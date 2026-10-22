# 06: Money on an Inquiry

**What to build:** On each Inquiry, the owner records the Agreed price, the Down payment received, the Balance received and a list of Costs, and sees what's still Owed. See the spec: `.scratch/inquiry-dashboard/spec.md` (Money).

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Agreed price, Down payment received and Balance received, in CAD with cents, stored as whole cents, used exactly as entered
- [ ] Costs as a list of items, each with a description and an amount, and their total
- [ ] Owed = Agreed price − Down payment − Balance, shown on Booked or Done Inquiries, never below zero
- [ ] Tests: entering and editing amounts, adding and removing Cost items, Owed in each status
