# 05: The card's photo grows into the Photo viewer

**What to build:** Tapping a Setup's card makes its photo grow smoothly into the full-screen Photo viewer, and closing the viewer shrinks it back into the card. The visitor sees where they came from and where they return to. With reduced motion, or in a browser without View Transitions, the viewer just fades or appears. This is kept separate from 04 because a View Transition between an arch-cropped card photo and a top-layer modal dialog is fiddly enough to need its own room. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Photo viewer).

**Blocked by:** 04 (One photo at a time in the Photo viewer)

**Status:** ready-for-agent

- [ ] Opening runs a View Transition from the tapped card's photo to the viewer's cover photo, with the arch easing into the viewer's rounded rectangle
- [ ] Closing (Close, Escape or the back gesture) runs it back to the card. If the visitor moved to another photo first, it fades instead
- [ ] It works from a filtered gallery, and doesn't clash with the filter's own View Transition
- [ ] With reduced motion on, or without View Transitions, the viewer opens and closes with no movement, as the existing reduced-motion rules say
- [ ] Only transform and opacity are animated, and it stays smooth on a mid-range phone
- [ ] Focus, history and "back leaves the Gallery" behave exactly as before, and their tests still pass
- [ ] The reduced-motion spec confirms the viewer shows straight away with no running animations
- [ ] DESIGN.md's Motion section describes the transition
