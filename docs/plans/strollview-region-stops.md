# StrollView-style region stops (implemented)

Parity target: [StrollView](https://strollview.net/player/index.html) — a
cross-institutional IIIF storytelling player (editor + player + GitHub
storage service). The core player mechanic is a guided tour over IIIF
images where each stop flies to a region of the canvas.

## Status

- **Region stops — implemented.** Slides carry an optional
  `location.region` ([x, y, w, h] in image pixels, the IIIF xywh
  convention); in image mode (`map_type: "iiif"` +
  `map_as_image`) navigation fits that region
  (`Map.OpenLayers._viewTo` → `_fitRegion`). Encoded in IIIF manifests
  as the `storymap:imageRegion` term (declared in
  `public/context.json`, emitted by `scripts/convert-to-iiif.mjs`,
  parsed back in `src/storymap/iiif.ts` — invalid regions ignored).
  Schema, fixtures and specs: `public/examples/issue-image-region.json`,
  `tests/image-region.test.ts`,
  `e2e/known-issues/issue-image-region.spec.ts`.
- **Manifests as stories — already present.** IIIF Presentation 3
  manifests load directly as storymaps (also deep-zoom via the IIIF
  image mode); StoryMap JSON converts to IIIF
  (`docs/storymap-as-iiif-manifest.md`).
- **Embeddable player — already present** (`public/embed/index.html`,
  ESM library).
- **Accessibility, autoplay, hash deep links, reduced motion — present**
  (accessibility wave, `#380`/`#146`).

## Explicitly out of scope

- Combining canvases from **multiple manifests/institutions** into one
  story (StrollView's cross-institutional collection feature).
- **IIIF 2.x manifest support** (Presentation 3 only, matching this
  viewer's scope).
- A **Web Component wrapper** and a WordPress plugin.
- An **editor** and the GitHub storage service.
