# Developer owns code and hosting; the business owns its domain and photos

The site's code lives in a public repo under the developer's GitHub account (EthanBautista), and Netlify hosting is on the developer's account, because the developer maintains both and Netlify connects most simply to a repo its own account can reach. The business (likhaproductions25@gmail.com) owns the Cloudinary account holding its photos and the `likhaevents.ca` domain registration, so it keeps its work and its address even if the developer steps away. The owner gets a GitHub account added as a collaborator on the repo, which is how they log in to the editor page.

## Consequences

Handing the site over means transferring the repo and re-linking Netlify. Inquiries pass through the developer's Netlify account as well as reaching the owner's inbox.

## Why the repo is public

The repo started private. At launch, Netlify's free plan refused to build it: on a private repo it builds commits from one Git contributor only, and every save in the editor is a commit by the owner's own GitHub account. So the repo was made public rather than paying for Netlify Pro (about US$19 a month per member) or building through GitHub Actions. Nothing in it is secret: the Cloudinary API secret and `.env` files never go in, the brand guide with the owner's phone number is kept out, and customers' Inquiries live in Netlify Blobs, not in Git. The content is on the public site anyway. What a visitor to the repo can also see is the code, the specs and tickets under `.scratch/`, `docs/`, and the commit email addresses.
