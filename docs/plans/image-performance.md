# Image Performance (backwards-compatible)

Constraint: no existing storymap may change behavior. Guarantees, all
verified before implementation:

- The schema has no `additionalProperties` lockdown and invalid docs
  only warn (`validateStorymapAndReport`), so additive fields cannot
  break old stories.
- No screenshot tests exist (no pixel-diff risk).
- The preload spec (`e2e/preload.spec.ts`) asserts the `src`
  *attribute*, which lazy-loading keeps setting.
- Old browsers ignore `loading`/`decoding` → today's behavior exactly.

## Commit 1 — `perf: lazy-load and async-decode offscreen slide images`

- `src/media/types/Image.ts:41` keeps assigning `src`; add
  `loading="lazy"` + `decoding="async"` **only for offscreen slides**
  — the active slide stays `eager` (no first-paint/LCP regression).
- No-blank-navigation rule: on slide activation (arrival via `goTo`),
  flip the image to `eager` if not yet complete, so navigation never
  waits on a deferred fetch.
- Compat proof: new unit test asserting legacy fixtures build
  byte-identical `src` URLs (golden URLs unchanged) with `eager` on
  the active slide / `lazy` elsewhere; existing `e2e/preload.spec.ts`
  + media specs stay green untouched.
- Gates: `lint`, `typecheck`, `npm test`, `e2e/preload.spec.ts` +
  media specs, prettier.

## Commit 2 — `perf: responsive image sizes (IIIF + optional srcset)`

- IIIF first: request container-matched widths **only** when the media
  URL is a recognizable IIIF Image API base; every other URL renders
  byte-identically to today.
- Plain images: optional author `srcset`/`sizes` fields (schema
  addition, optional → absent = current single-`src` behavior;
  validator updated in the same commit).
- Compat proof: golden-URL unit test extended (no new fields →
  identical output); fixture exercising sized variants + e2e
  asserting the served width matches the container.
- Gates: same as commit 1 + `npm run validate` (schema change) +
  `npm pack --dry-run` unaffected.

Each commit lands separately with its spec; either reverts
independently on legacy-fixture regressions.
