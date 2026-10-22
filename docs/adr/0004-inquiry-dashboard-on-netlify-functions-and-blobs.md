# The Inquiry dashboard runs on Netlify Functions and Netlify Blobs, behind the editor's GitHub login

This partly reverses ADR 0001's "no server code". The owner needs to track many Inquiries through their Inquiry status, including ones added by hand from Instagram or Facebook messages. They should do it without another account to log in to, so we build our own dashboard next to the editor page. Netlify Forms still receives each Inquiry and emails the owner. A function triggered by each Inquiry that passes Netlify's spam filter copies it, with its inspiration photos, into Netlify Blobs. The dashboard reads and writes Blobs through functions. These let a request through only if its GitHub login can push to the site's repo, which is the same login the owner uses for the editor.

## Considered Options

- **Trello (or a similar board) in the owner's account**: no code at all, and Gmail could forward each Inquiry to it. Rejected because it is one more account for a non-technical owner to log in to.
- **A Google Sheet**: cheap, but clumsy to edit on a phone, and it would be a table rather than a dashboard.
- **Inquiries as files in the GitHub repo, like Setups**: no new storage, but customers' personal details would stay in Git history for good, and one couldn't truly be deleted.
- **A hosted database such as Supabase**: sturdier, but another account to manage, and more than the site needs at this size.
- **Replacing Netlify Forms with our own form function**: no ~100-a-month cap, but we would have to build our own spam filtering and email sending. Kept as the next step if Inquiries outgrow the cap, which the dashboard doesn't depend on.

## Consequences

- The site now has server code, and the free-tier limits on Netlify Functions and Blobs apply as well as the Netlify Forms cap.
- Customers' details and photos live in Blobs on the developer's Netlify account (ADR 0003). Handing the site over means moving that data too.
- Anyone who can push to the repo can open the dashboard, including the owner's Earned and Profit on events. Today that means the owner and the developer, which the owner accepts.
- The email remains the alert and the dashboard the record. If the dashboard is down, Inquiries still reach the owner's inbox.
