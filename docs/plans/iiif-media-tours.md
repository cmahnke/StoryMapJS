# IIIF: media tours, plus georeferenced layers (shipped)

> **Media tours: delivered.** §1 shipped — `readSelector()`, the shared
> painting-body record, `readCommentingAnnotations()`, the
> `annotated-image.json` fixture, `docs/iiif-authoring.md`, 28 unit + 6 e2e
> tests. §2 shipped — `media.subtitles`, slide `narration` with a
> `media:narration` consent service, `autoplay_media`, and per-slide `marker`
> config with `marker.popup` and `marker.audioBadge`. §4 was already shipped.
>
> **Left open, with the reason:**
>
> - **`seeAlso` / external annotation pages.** §1 said this would come from
>   `iiif-interop.md` §5.2, which is not implemented; making the synchronous
>   converter fetch would be a load-path change, so stops must live on the
>   Canvas for now. The authoring guide says so.
> - **The nine dropped terms.** `iiif-interop.md` §2 is a separate breaking
>   change. Until it lands the extension terms still win over the standard
>   body properties, which are read as fallbacks.
> - **`markerIcon`/`markerLabel` terms** are not added, as decided: marker
>   presentation rides the `navPlace` properties bag, where `popup` and
>   `audioBadge` joined `icon`/`image`/`name`.
> - **`TextQuoteSelector` resolution** and **`SvgSelector` outlines** are
>   accepted and preserved, not resolved or drawn.

> **Status.** Affine georeferencing and the OpenLayers extension API both
> shipped; §4 records what landed and the one item still open. What is
> actually left to build is §1 (annotation-driven stops + authoring guide)
> and §2 (marker config, popups, narration, media-aware autoplay).

Goal: Storiiies/Micrio-style guided tours over IIIF images and geo maps —
annotation-driven slides, per-stop marker presentation with popups, and
narration-aware playback — plus the IIIF authoring guide that documents how
to encode all of it.

Acceptance: a manifest with commenting annotations yields one slide per
annotation (region fit, text, audio); authors can encode every feature from
`docs/iiif-authoring.md` snippets; markers render per-slide config with
popups and audio badges; narration plays per stop and autoplay can wait for
media to finish. New unit + e2e specs guard each item; `npm run
typecheck`, `lint`, `validate`, `test`, `build`, and the existing
iiif/manifest/autoplay/marker specs stay green.

Explicit non-goals: IIIF Content Search (dropped, out of scope), GCP
warping (see §4 + the Allmaps recipe), authoring
UI, accounts/permissions (viewer-only library).

## 0. Background: what already exists

Locations below were re-verified against the current tree; the file/line
references of the previous revision of this plan were stale.

- Canvas → slide mapping (`canvasToSlide`, `src/storymap/iiif.ts:310`):
  label→headline, summary→text, painting body→media (`readPainting`,
  `iiif.ts:173`), navPlace→location. One canvas = one slide; non-painting
  annotations are ignored.
- **What the terms became.** `docs/plans/iiif-interop.md` §2 drops nine terms
  outright where a standard replaces them, so this plan reads the standard
  side: the region comes **only** from the painting annotation's Image API
  Selector (the `storymap:imageRegion` term and the precedence that preferred
  it are gone, and the selector used to be the fallback — this is the one place
  where the earlier version of this file described the opposite of the code);
  caption from `body.label`, credit from `body.requiredStatement`/`provider`,
  alt from `body.accessibilitySummary`; the date from `navDate`; the slide
  background from the canvas background annotation; georeferenced layers from
  `motivation: "georeferencing"` annotations. The two extension terms that
  survive are `mediaSrcset`/`mediaSizes` (P3 has no responsive-image
  vocabulary) and `storymap:type` (a slide role, which P3 has no term for).
- Region stops end-to-end, **but only in image space**: the `region` field
  (`StorymapSlideLocation`, `src/types.ts:23`), `_viewTo`
  (`src/map/openlayers/Map.OpenLayers.ts:1770`, region gate at `:1776-1778`)
  and `_fitRegion` (`:1848`). Geographic maps ignore
  `region` by design; route lines exclude region-only slides
  (`Map._hasRegion`, `src/map/Map.ts:537`). Ask
  `storymap.isImageSpace()` rather than re-testing `map_type` — georeferenced
  IIIF is a mercator map.
- Marker presentation today is split: storymap JSON
  `location.{icon,iconSize,image,use_custom_marker}` + global
  `use_custom_markers` (`_createMarker()`,
  manifests via navPlace properties (`LOCATION_PROPERTIES`,
  `iiif.ts:23-32` — `name`,
  `zoom`, `line`, `icon`, `iconSize`, `image`, `use_custom_marker`; **no**
  `label`, so P1's `markerLabel` term is genuinely new). The marker element
  is attached as an `ol/Overlay` (`_addTo`/`_removeFrom`, `:95-130`),
  exposes its position through `latLon()` (`:84`), owns a `dispose()`
  (`:132`) and renders labels at `:183-191` (`.vco-marker-label`, styled in
  `src/scss/map/VCO.MapMarker.scss:81`).
- Media: `Audio`/`Video` are thin subclasses of `HtmlMediaBase`
  (`src/media/types/HtmlMedia.ts`) — the pause in `_stopMedia` (`:95`) and
  the `canplay` wiring (`:62`) live there, not in `Audio.ts` any more; the
  base no-op is `Media._stopMedia` (`src/media/Media.ts:590`). Type
  resolution is `MediaType()`
  (`src/media/MediaType.ts:43`), which returns a native player class or
  `false`. Fixed-timer autoplay with reduced-motion awareness (`StoryMap`,
  `src/storymap/StoryMap.ts:1203-1215`, `prefersReducedMotion()` in
  `src/core/Util.ts:366`, plus the `_autoplay_stopped` latch). Slide text
  is sanitized by `sanitizeSlideText` (`src/media/EmbedUtil.ts`).
- Consent: media is gated per matched service, not per URL
  (`src/media/Media.ts:193-200` registering `mediaService(type, name)`,
  `src/storymap/Consent.ts:63`; the service list is assembled in `StoryMap`,
  `src/storymap/StoryMap.ts:1186`). Anything that _is_ ordinary slide media
  therefore inherits the GDPR path for free — see §2 for what does not.
- Language maps: `flattenLanguageMap` (`iiif.ts:106`). Manifest-level
  mapping is `manifestToStorymapData` (`iiif.ts:382`): `label` becomes the
  title and `requiredStatement` becomes `iiif.attribution`, so a manifest
  credit lands on the map, not on a slide.

## 1. P1 — Annotation-driven stops + IIIF authoring guide

- **Depends on `docs/plans/iiif-interop.md` landing first** (§2 for the body
  record, §4 for the selector reader, §5.2 for `seeAlso`). Consume, do not
  reimplement — see that plan's §1.10.
- Converter (`src/storymap/iiif.ts`): add `readCommentingAnnotations(canvas)`
  — annotations with `motivation` in (`commenting`, `tagging`,
  `classifying`, `describing`) and a fragment target become slides. The target
  goes through interop's `readSelector()`, so this plan does not parse
  selectors itself: `region` → `location.region`, and the "point → centered
  square, 5% of the canvas, clamped" heuristic is the shared reader's, stated
  once there. TextualBody `value` (`text/plain`→paragraphs,
  `text/html`→`sanitizeSlideText`, via `flattenLanguageMap`) → slide text;
  `Sound` bodies → `media.url`, detected from the body record interop §2.7
  returns (native player when `MediaType()` matches the `MediaType.ts`
  audio/video entries, else website-iframe fallback — document this. Because
  the result is ordinary slide media it also inherits the existing media
  consent path; no new consent work in P1).
  Page order = slide order; canvases without annotations keep today's
  one-slide behavior. Externally-referenced pages come from interop §5.2's
  `seeAlso` fetch rather than a second implementation here.
- Authoring guide: new `docs/iiif-authoring.md` — encoding reference with
  copy-paste JSON snippets for each feature: canvas
  (`label`/`summary`/`navPlace`/`navDate`/`background` annotation, and the
  painting body's `label`/`requiredStatement`/`accessibilitySummary`), the
  annotation page (commenting annotation + a fragment target + TextualBody
  plain/html + a `Sound` body + point selector), manifest title slide fields
  (and the `requiredStatement` → attribution rule), the mapconfig service
  (TileJSON `tiles`/`center`/`zoom` plus `storymap:basemap` for the vendor
  presets, and `motivation: "georeferencing"` annotations for placed rasters —
  the surviving term list is `public/context.json`; there is no `iiifBounds`
  term, that belonged to an option which never shipped), marker presentation
  via the `navPlace` properties bag (see §2), and a Storiiies-compat note (Storiiies Editor export URL usable directly as a
  storymap source). Wire into the `DOCS` entry list in
  `plugins/sitegen.ts:134-141` (alongside README/migration/iiif) plus
  the nav; the new fixture `public/examples-iiif/annotated-image.json`
  doubles as a living, validated example referenced from the guide and is
  covered by `npm run validate:iiif`.
- Tests: `tests/iiif-annotations.test.ts` (inline manifest:
  xywh/text/audio/point/ordering); `e2e/annotations.spec.ts` (slide
  count, region values, image-mode fit to region). Effort: S-M
  (region plumbing already exists).

## 2. P3 — Marker config + popups + narration + media-aware autoplay

- **Marker config**: new optional per-slide `marker` object consolidating
  presentation —
  `marker?: { icon?, iconSize?, image?, label?, popup?: boolean,
audioBadge?: boolean }` — with `location.*` kept as legacy aliases
  (`marker.*` wins when present, else fall back to `location.*`;
  location stays geographic + region, marker is presentation).
  `_createMarker()` reads the merged view. Schema + types +
  validate. `audioBadge` renders a small indicator on markers whose slide
  has narration/audio media (Micrio-like affordance).
- **No new term is added for any of this** (interop §2's term policy). The
  manifest side already has a channel: the `navPlace` Feature `properties` bag
  that `LOCATION_PROPERTIES` (`src/storymap/iiif.ts:23`) copies, where `icon`,
  `iconSize`, `image`, `name`, `line`, `zoom` and `use_custom_marker` already
  live. So `marker.icon` ← `properties.icon`, `marker.label` ←
  `properties.name`, and `popup`/`audioBadge` extend the same bag, described
  by the local linked-data context interop §3 adds. The earlier proposal of
  `storymap:markerIcon`/`markerLabel` terms is withdrawn.
- **Per-stop overrides are impossible by design, not overlooked.** The navPlace
  extension permits `navPlace` on a Collection, Manifest, Range and Canvas and
  states that other types "must not" have it — an Annotation included. Every
  stop on a canvas therefore shares that canvas's `navPlace`, so P1's
  annotation stops cannot carry their own marker presentation. That is right
  for the common case (a region stop on an image is in image space, where a
  latitude means nothing), and the authoring guide must say so plainly instead
  of implying a per-stop override exists.
- **P3a popup** (S-M): `marker.popup` (default off) binds the popup card
  to the marker — active-marker click toggles it (headline, sanitized
  excerpt, thumb, audio play); inactive-marker click still navigates
  (unchanged). Close on navigate/`Esc`; keep the #288 touch-action and
  #434 tap-target behavior.
  Three constraints this plan has to respect:
    1. It is `marker.popup`, **not** `createPopup()`. That name is a
       documented deprecated no-op for pre-0.10 compatibility (the original
       viewer never implemented it either) and must stay one.
    2. Anchor through `marker.latLon()` rather
       than reading `data.location`, so the popup also works if markers ever
       move to the vector renderer of `docs/plans/issue-159-vector-markers.md`.
    3. The popup overlay must be released by the marker's existing
       `dispose()` (`:132`), not left dangling.
- **P3d subtitles** (S): `media.subtitles` (VTT URL) → `<track
kind="subtitles">` on the `HtmlMediaBase` player element
  (`src/media/types/HtmlMedia.ts`); a11y win for #385. Schema + types only,
  no resolver change. **IIIF has no subtitle term**, so `media.subtitles` stays
  a storymap-JSON option; the closest standard expression is a `TextualBody`
  with `format: "text/vtt"` on the body, which we accept opportunistically if
  it is already on the record interop §2.7 returns.
- **P3b narration** (M): optional slide-level `narration: {url}`; on
  `change`, stop previous narration and play the new one through a
  dedicated audio element in the slider (mirroring `HtmlMedia._stopMedia`).
  Browser policy: unmuted audio requires a prior user gesture —
  narration starts only post-gesture; document this. Schema + types +
  validate. **In a manifest, narration is a `Sound` body on the annotation,
  not a term** (interop §2's policy) — the body record of §2.7 supplies the
  `type` needed to recognise it, and `duration`/`start`/`end` from interop §4
  allow a time-anchored narration. `narration: {url}` remains a storymap-JSON
  field, as `autoplay` is.
  **Consent**: this element bypasses the `Media` class, so it would
  otherwise fetch a third-party URL with no GDPR gate — exactly the hole
  the consent rewrite closed. Register a `media:narration` service through
  `mediaService("narration", …)` (`src/storymap/Consent.ts`, `:63`),
  request it
  alongside the other services when `consent_required` is set, and play
  nothing while it is denied. This costs one locale string per language
  (`npm run check:locales`, which already reports 28 gaps) and one row in
  the consent bar.
- **P3c media-aware autoplay** (M): new `autoplay_media` boolean (default
  false). When true and the slide has playable audio/video, the scheduler
  waits for media `ended` instead of the fixed `autoplay` ms (timer
  remains as fallback). Needs an `onMediaEnded`-style hook on `HtmlMedia`
  with `ended` listeners wired next to the existing `canplay`
  (`HtmlMedia.ts:62`). E2E needs no new asset: copy
  `e2e/known-issues/issue-455-audio-video.spec.ts`, which serves
  deterministic bytes for `public/examples/assets/tone.mp3` via
  `page.route` against the `issue-455-audio` fixture.
- Tests: unit where jsdom-able (alias precedence, converter) +
  `e2e/marker-popup.spec.ts`, narration/autoplay-media specs, subtitle
  track assertion. Effort overall: M.

## 3. Order, verification, rollout

Order: **`docs/plans/iiif-interop.md` §2, §4 and §5.2 first, then P1
(converter + authoring guide + fixture) → marker config + popup → subtitles →
narration → media-aware autoplay** (each independently shippable; P1 unlocks
the most IIIF value first). The interop dependency is not optional: P1 consumes
its selector reader, its body record and its `seeAlso` fetch, and the
`annotated-image.json` fixture would otherwise be authored in terms that
interop §2 is about to drop. Per item: `npm run typecheck`, `lint`, `validate`,
`npm run test`, `npm run build`, then new + adjacent e2e
(iiif/manifest/autoplay/marker specs). Docs per item in
`migration-from-knightlab.md` + `storymap-as-iiif-manifest.md` (+ the new
authoring guide for P1).

**The format gate changes shape here.** Adding `annotated-image.json` makes
P1 a _reviewed_ diff over `public/examples-iiif/`, not the empty-diff line the
other plans hold, and it moves `npm run validate:iiif` from 49 manifests to 50.
Interop §2 is the same case and says so.

Cross-plan: the popup has to hold up under both marker renderers, so either
`issue-159-vector-markers.md` lands first, or the popup stays on
`latLon()`/DOM as specified here and the vector renderer grows a popup
seam later.

## 4. Georeferenced IIIF: shipped, and the one thing left

Folded in from the former `docs/plans/iiif-geo-layers.md`, which is deleted.
The design that file proposed (`iiif.bounds`) never shipped; what shipped is
recorded here so the reasoning is not lost.

### What shipped

- `src/map/georeference.ts` — `resolveInfoJsonUrl`,
  `readGroundControlPoints`, `unsupportedTransformation`, `fitAffine`; the
  engine consumes it through `_createGeoreferencedOverlay`.
- Manifest path: `storymap:georeferencedLayers` → `overlays[]` entries
  (`readGeoreferencedLayers`, `src/storymap/iiif.ts:578`, called from
  `:524`), registered in `public/context.json:33` and documented in
  `docs/storymap-as-iiif-manifest.md` ("Geo-referenced layers").
- navPlace Polygon/MultiPolygon → `map_bbox` (`src/storymap/iiif.ts:253-268`,
  applied at `:418-425`), so a manifest can constrain the map to a story
  extent.
- Tests and fixtures: `tests/georeference.test.ts`,
  `e2e/georeference.spec.ts`, `public/examples-iiif/georeferenced-layer.json`
  and `georeferenced-layer-unsupported.json` (rotated/non-affine sheets,
  reported and skipped).
- The extension API surface that made extension layers possible —
  `tile_source_factory` returning any `ol/layer/Layer` (`TileSourceFactory`,
  `src/types.ts:96-99`, passed through by the `instanceof Layer` check in
  the `_createTileLayer` funnel, `Map.OpenLayers.ts:719`), the accessors,
  the `imageready`
  event and the package exports — shipped as planned in
  `docs/plans/openlayers-surface.md`.

### The one thing left: non-affine and rotated sheets

`fitAffine` covers the common case: a ground-control-point set that reduces
to a 3×3 affine matrix. Rotated, curved or otherwise non-affine sheets are
reported by `unsupportedTransformation()` and skipped rather than misplaced
— deliberately, since a wrong affine placement looks like correct data.

- Third-party lab: **Allmaps** ([allmaps.org](https://allmaps.org),
  `@allmaps/openlayers` on npm) — `WarpedMapLayer` (an `ol/Layer` subclass)
  loads IIIF Georeference Annotations and warps IIIF images via WebGL2
  (`addGeoreferenceAnnotationByUrl`, `getBbox` → `view.fit`). **Decision:
  do not bundle it** — still `1.0.0-beta.x`, WebGL2-only, a large
  render-pipeline bundle, against the viewer-only/dependency-light stance.
  Built-in affine placement covers the common case and the extension hooks
  are already shipped, so what is needed is a documented recipe. Reversible
  if Allmaps stabilizes.
- The open task is a docs item, not code: a "IIIF extensions" section in
  `docs/migration-from-knightlab.md` with the `tile_source_factory` →
  `WarpedMapLayer` snippet (the `Layer` passthrough is what unblocks it —
  `WarpedMapLayer` has no `getSource`), `getBbox()` → `view.fit()` driven off
  the `imageready` event, the documented limitation that the minimap keeps
  default tile handling for warped layers, the consent caveats for the
  info.json fetch, and a line stating which sheets the built-in path skips.
  Cross-link it from the manifest doc's "Geo-referenced layers" section.
- Verification: `npm run format:check` (docs only — no `src/`, `schema/`,
  `public/context.json` or fixture changes), then re-run
  `e2e/georeference.spec.ts` and `tests/georeference.test.ts` to confirm the
  documented limitations still match the code. Effort: S.
