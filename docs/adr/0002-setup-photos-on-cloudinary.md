# Photos live on Cloudinary, not in the repo

Photos of Setups and Rentals are uploaded through the editor page straight to Cloudinary, and content files store only each photo's Cloudinary URL. Keeping years of phone photos in Git would bloat the repo, and Cloudinary resizes and converts photos per screen on request, so the site needs no build-time image processing for them. An upload preset shrinks each photo to about 2500px wide on upload, so storage stays small.

## Considered Options

- **Photos in the repo** (the default for a Git-based editor): versioned and backed up for free, but phone photos are 3–8 MB each and the repo would grow past what GitHub handles comfortably.
- **Cloudflare R2 + Image Transformations**: no traffic charges, so it scales more cheaply, but it's several moving parts (bucket, access keys, domain on Cloudflare) for a problem the site may never have.

## Consequences

- The free plan is 25 credits a month (1 credit = 1 GB of storage, 1 GB of traffic, or 1,000 transformations). Traffic is the main cost. Expect roughly 10 credits a month at about 1,000 visitors, and plan to act at around 5,000 visitors a month.
- If the free plan is outgrown, either upgrade, or migrate to Cloudflare R2 with a script that copies each photo and rewrites its URL in the content files.
- Photos are not versioned in Git. The owner keeps the originals.
