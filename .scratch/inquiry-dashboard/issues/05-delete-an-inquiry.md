# 05: Delete an Inquiry

**What to build:** The owner deletes spam that slipped through or a duplicate after a confirm step. The record and its photos are removed. The confirm step suggests Declined for a customer who just didn't book. See the spec: `.scratch/inquiry-dashboard/spec.md` (Removing Inquiries in User Stories).

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Delete with a confirm step that names the Inquiry and points to Declined for customers who didn't book
- [ ] Deleting removes the record and its photo blobs
- [ ] The delete function refuses without access
- [ ] Tests: cancel keeps it, confirm removes it and its photos
