# 01: The owner manages Event types, with guardrails

**What to build:** The owner adds, renames and removes Event types himself from the editor, and every Setup picks its Event type from that list. The site never breaks because of it: a Setup whose type was removed shows under Other, and the editor stops a Setup from being saved without an Event type long before the build would reject it. The contact form offers every Event type the owner has added. First, prefactor so one module owns "what are the Event types" for the whole site and the gallery, contact form and editor read only from it. See the spec: `.scratch/gallery-filter-and-photo-viewer/spec.md` (Event types become content, Guardrails).

**Blocked by:** None (can start immediately)

**Status:** done

- [ ] Prefactor first, with no visible change: one Event types module gives the list for forms, a Setup's effective Event type, the gallery's Event types and each type's `?type=` slug. The gallery, contact form and editor read only from it, and the existing tests pass unchanged
- [ ] Event types are one content entry the owner edits in the editor, seeded with Anniversary, Baby shower, Birthday, Gender reveal, Proposal and Wedding. Other is not stored: the site always adds it, so it can't be removed or renamed
- [ ] A Setup's Event type is picked from that list plus Other. It is required, a new Setup starts with none chosen, and saving without one shows a message next to the field
- [ ] The editor refuses a blank or spaces-only name on the list, and refuses "Other" in any capitals with a message saying Other is always there
- [ ] Names that differ only in capitals or surrounding spaces count as one Event type (first spelling wins): one dropdown option, one slug
- [ ] A Setup whose Event type isn't on the list builds and is treated as Other everywhere
- [ ] The build still fails for a Setup with a missing, empty or spaces-only Event type: one invalid-content case each
- [ ] The contact form's Event type dropdown lists every Event type alphabetically, with Other last
- [ ] The editor config test proves the new list field and the Setup's Event type field match what the build and the Event types module accept
- [ ] A fixture site covers an unlisted Event type (shown as Other, build succeeds) and a duplicate name in the list (one contact form option)
- [ ] The owner guide explains adding, renaming and removing Event types, that renaming changes a filtered gallery link, and when to give a kind of event its own type (about 2–3 Setups of it under Other)
- [ ] The sample Setups keep their Event types, and existing gallery and contact tests pass
