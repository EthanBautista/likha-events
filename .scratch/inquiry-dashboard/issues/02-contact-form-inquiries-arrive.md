# 02: Contact-form Inquiries arrive on the dashboard

**What to build:** Every Inquiry that passes Netlify's spam filter appears on the dashboard as New, with its inspiration photos, while the email keeps arriving. The list shows name, event date, Event type and Inquiry status, upcoming events first. Opening an Inquiry shows everything the customer sent. See the spec: `.scratch/inquiry-dashboard/spec.md` (Inquiries arriving, The Inquiry record, The list).

**Blocked by:** 01

**Status:** done

- [x] A `submission-created` function creates a record from the `inquiry` form: status New, source Contact form, received time
- [x] Each inspiration photo is copied into Blobs straight away. If one fails, the Inquiry is still saved and shows the photo is missing
- [x] A photo function serves photos only with access
- [x] List order: upcoming soonest first, then past most recent first, then undated
- [x] An Inquiry detail view with every customer field and its photos
- [x] Run Impeccable's shape step for the list and detail views first, phone-first
- [x] Tests: creating from a form payload (with and without photos, and with a failed photo), list order, and the e2e list and detail views with the axe check
