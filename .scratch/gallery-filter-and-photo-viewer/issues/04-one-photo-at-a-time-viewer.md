# 04: One photo at a time in the Photo viewer

**What to build:** The Photo viewer becomes a full-screen view in the direction chosen in 02, showing one whole photo at a time. On a phone the visitor swipes between photos, with the photo following their finger as in their phone's own photo app. On desktop they use arrow buttons, the arrow keys or a row of thumbnails. A "3 / 8" counter always shows where they are. Everything visitors rely on today (back gesture, Escape, Close, focus going back to the card) keeps working. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Photo viewer).

**Blocked by:** 02 (Critique and prototype directions)

**Status:** done

- [x] The photos are a horizontal scroll-snap track, one photo per screen, so swiping is the browser's own scrolling. Without JavaScript the track still swipes or scrolls
- [x] It opens on the cover photo, and a "N / total" counter updates as the track settles on a photo. Each photo's alternative text keeps "photo N of total", and the counter's change is announced politely
- [x] On desktop (wide screen, fine pointer): previous/next buttons beside the photo, the left/right arrow keys, and a thumbnail row that jumps to a photo and marks the current one
- [x] The previous button is disabled on the first photo and next on the last, with no wrap-around
- [x] On a phone: no thumbnails and no arrow buttons, only the counter
- [x] Photos show whole and uncropped (portrait and landscape), with slightly rounded corners, fitting below the caption and counter. Pinch-zoom is left to the browser
- [x] Photos after the cover load lazily, and each photo's space is reserved, so nothing jumps as it loads
- [x] Styled to the direction chosen in 02. The caption and Close sit quietly at the top
- [x] With reduced motion on, changing photos doesn't animate
- [x] The Setup viewer spec is updated: opens on the cover with "1 / N"; buttons and arrow keys move one photo and update the counter; a thumbnail jumps; the ends are disabled; at phone size there are no thumbnails or arrows, and scrolling the track changes the counter
- [x] The existing close/back/Escape/focus/history tests, the reduced-motion spec and the axe check still pass
- [x] DESIGN.md records the viewer's new look

## Comments

### Built (2026-10-21)

Direction B, as chosen in 02, with the caption and Close at the top. Choices worth knowing:
- The Event type sits above the caption, as in prototype B's label.
- The counter, buttons and thumbnails appear only once the script runs. Without it the track still swipes, but a counter would never change.
- The arrow keys work at any screen size; only the buttons and thumbnails are desktop-only.
- Every viewer photo, the cover included, loads lazily. The closed viewers are in the gallery page, so an eager cover would download for every Setup on page load. The cover still loads as soon as its viewer opens.
- Photos have no stored dimensions, so each photo's slot is a whole screen of the track, and the paper mat is hidden until the photo arrives.
- New tokens: `--color-wall`, `--color-on-wall-muted`, `--color-on-wall-line`, `--color-on-wall-hover`.
