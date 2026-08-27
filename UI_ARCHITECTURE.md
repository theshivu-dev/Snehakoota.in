# SnehaKoota UI Architecture — Migration Boundary

<!-- STAGE 2E-2 -->

This document records the safe migration boundary for bringing existing and future pages into the shared UI foundation.

## Shared layer

Use the shared layer for genuinely site-wide concerns:

- `theme.css` — visual tokens and generic primitives.
- `navigation.css` — navigation presentation and fixed navigation geometry.
- `navigation.js` — shared navigation interaction when a page adopts the shared controller.
- `account.css` / `account.js` — account widget presentation and behaviour.
- A future shared footer component — when the footer is deliberately introduced.

## Page-owned layer

Keep these with the page until deliberately migrated:

- page content and content structure
- page-specific layout
- page-specific illustrations/SVGs
- page-specific animations and special effects
- page-specific JavaScript
- temporary or experimental widgets

## Migration rule

Pages are migrated **one at a time**.

For each page:

1. Inspect the current page before changing it.
2. Identify which rules are genuinely shared and which are unique.
3. Add the shared assets without deleting working page-specific code prematurely.
4. Migrate one controlled area at a time.
5. Preserve existing content and data connections.
6. Test desktop and mobile behaviour after each controlled change.
7. Only remove duplicated legacy code after the shared replacement has been verified.

## Safety boundaries

- Frontend visibility is not a security boundary. Authorization must remain enforced by the backend/data layer.
- Shared CSS changes are potentially global and must be treated as global visual changes.
- Page-specific CSS changes should remain isolated to that page.
- Do not alter Supabase/authentication behaviour as part of a visual migration unless explicitly planned as a separate task.
- Do not move a special effect into a shared stylesheet merely because it visually resembles something on another page.

## Current migration state

- `index.html` — reference/first migrated page; existing home content and special effects remain preserved.
- `story.html` — not yet migrated.
- `samparka.html` — not yet migrated.
- Future `posts.html` / Baraha experience — will be designed and integrated separately.

## Future fixed UI

The following are intentionally separate decisions and are **not** part of this migration step:

- custom dotted navigation/progress control
- optional bookmark-style navigation hint
- shared footer implementation
- membership switcher
- posts/Baraha UI

These can be introduced later without changing the migration boundary defined here.
