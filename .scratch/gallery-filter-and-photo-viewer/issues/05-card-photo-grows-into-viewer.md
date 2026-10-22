# 05: The card's photo grows into the Photo viewer

**What to build:** Tapping a Setup's card makes its photo grow smoothly into the full-screen Photo viewer, and closing the viewer shrinks it back into the card. The visitor sees where they came from and where they return to. With reduced motion, or in a browser without View Transitions, the viewer just fades or appears. This is kept separate from 04 because a View Transition between an arch-cropped card photo and a top-layer modal dialog is fiddly enough to need its own room. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Photo viewer).

**Blocked by:** 04 (One photo at a time in the Photo viewer)

**Status:** done

- [x] Opening runs a View Transition from the tapped card's photo to the viewer's cover photo, with the arch easing into the viewer's rounded rectangle
- [x] Closing (Close, Escape or the back gesture) runs it back to the card. If the visitor moved to another photo first, it fades instead
- [x] It works from a filtered gallery, and doesn't clash with the filter's own View Transition
- [x] With reduced motion on, or without View Transitions, the viewer opens and closes with no movement, as the existing reduced-motion rules say
- [x] Only transform and opacity are animated, and it stays smooth on a mid-range phone
- [x] Focus, history and "back leaves the Gallery" behave exactly as before, and their tests still pass
- [x] The reduced-motion spec confirms the viewer shows straight away with no running animations
- [x] DESIGN.md's Motion section describes the transition

## Comments

**Built.** The arch isn't reshaped (that would mean animating a clip, not transform or opacity). Instead the photo keeps its content lined up as it moves and scales, and the arch cross-fades into the paper mat. With 4:5 photos on a phone the card and the viewer show the photo at nearly the same size, so there it mostly travels rather than grows.

- A cover still loading when the card is tapped holds the page for up to 300ms. It's fetched as soon as the pointer or focus reaches the card. If it still hasn't arrived, the viewer opens without growing.
- While the photo moves, the page doesn't take taps (the browser's View Transition behaviour). Back pressed mid-shrink leaves the viewer's entry, which the close was about to do anyway.
- The filter now eases with its own animations rather than a View Transition, so they can't clash. A card tapped mid-glide grows from wherever it is.
- "Smooth on a mid-range phone" isn't covered by a test. Check it by hand on the owner's phone.
