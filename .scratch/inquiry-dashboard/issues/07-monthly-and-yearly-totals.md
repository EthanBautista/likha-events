# 07: Earned, Owed and Profit on events by month and year

**What to build:** The dashboard shows Earned, Owed and Profit on events for each month and each year, grouped by event date. See the spec: `.scratch/inquiry-dashboard/spec.md` (Money).

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Earned = Down payments + Balances received on every Inquiry, whatever its status
- [ ] Owed = the sum of Owed on Booked and Done Inquiries
- [ ] Profit on events = Earned − Costs of every Inquiry, labelled "Profit on events"
- [ ] Grouped by the month and year of the event date. Undated Inquiries are left out, and the dashboard says how many
- [ ] Tests: a month with several Inquiries, a Declined Inquiry with a Down payment, an undated Inquiry, a year total
