# IIIF media tours: annotation stops, marker config, narration

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
warping (see `docs/plans/iiif-geo-layers.md` + Allmaps recipe), authoring
UI, accounts/permissions (viewer-only library).

## 0. Background: what already exists

- Canvas → slide mapping (`src/storymap/iiif.ts:230-282`, `canvasToSlide`):
  label→headline, summary→text, painting body→media, navPlace→location,
  `storymap:imageRegion`→`location.region` (`:263-267`), extension terms
  (type, date, background, mediaCaption/Credit/Alt). One canvas = one
  slide; non-painting annotations are ignored (`readPaintingBodyUrl`,
  `:140-156`).
- Region stops end-to-end: `region` field (`src/types.ts:18-22`),
  `_fitRegion`/`_viewTo` (`src/map/openlayers/Map.OpenLayers.ts:1391-1461`),
  region exclusion from route lines (`src/map/Map.ts:479-484`).
- Marker presentation today is split: storymap JSON
  `location.{icon,iconSize,image,use_custom_marker}` + global
  `use_custom_markers` (`MapMarker.OpenLayers.ts:22-29`), manifests via
  navPlace properties (`LOCATION_PROPERTIES`, `iiif.ts:20-28`).
- Media: `Audio`/`Video` types with `_stopMedia` pause (`Audio.ts:59-63`,
  `Media.ts:262,402`); fixed-timer autoplay (`StoryMap.ts:865-896`,
  reduced-motion aware); slide text sanitized (`sanitizeSlideText`).
- Language maps: `flattenLanguageMap` (`iiif.ts:74-90`).

## 1. P1 — Annotation-driven stops + IIIF authoring guide

- Converter (`src/storymap/iiif.ts`): add `readCommentingAnnotations(canvas)`
  — annotations with `motivation` in (`commenting`, `tagging`,
  `classifying`, `describing`) and an `xywh=` fragment target become
  slides: fragment → `location.region`, TextualBody `value`
  (`text/plain`→paragraphs, `text/html`→`sanitizeSlideText`, via
  `flattenLanguageMap`) → slide text, `Sound` bodies → `media.url`
  (native player when the extension matches the `MediaType.ts`
  audio/video matchers, else website-iframe fallback — document this),
  `PointSelector` → centered square region (5% of canvas, clamped).
  Page order = slide order; canvases without annotations keep today's
  one-slide behavior; externally-referenced pages followed one level max.
  Overview slide: manifest `label`/`summary`/`requiredStatement` →
  headline/text/credit (verify current mapping in
  `manifestToStorymapData`, `iiif.ts:289-405`, during implementation).
- Authoring guide: new `docs/iiif-authoring.md` — encoding reference with
  copy-paste JSON snippets for each feature: canvas
  (`label`/`summary`/`navPlace`/`storymap:imageRegion`/media extension
  terms), annotation page (commenting annotation + `xywh` target +
  TextualBody plain/html + `Sound` body + point selector), manifest title
  slide fields, mapconfig service (`iiifUrl`, `iiifBounds`), marker terms
  (see §2), and a Storiiies-compat note (Storiiies Editor export URL
  usable directly as a storymap source). Wire into `plugins/sitegen.ts`
  `DOCS` + nav so it publishes to the site; the new fixture
  `public/examples-iiif/annotated-image.json` doubles as a living,
  validated example referenced from the guide.
- Tests: `tests/iiif-annotations.test.ts` (inline manifest:
  xywh/text/audio/point/ordering); `e2e/annotations.spec.ts` (slide
  count, region values, image-mode pans to region). Effort: S-M
  (region plumbing already exists).

## 2. P3 — Marker config + popups + narration + media-aware autoplay

- **Marker config**: new optional per-slide `marker` object consolidating
  presentation —
  `marker?: { icon?, iconSize?, image?, label?, popup?: boolean,
audioBadge?: boolean }` — with `location.*` kept as legacy aliases
  (`marker.*` wins when present, else fall back to `location.*`;
  location stays geographic + region, marker is presentation).
  `MapMarker.OpenLayers.ts:22-29` reads the merged view. Manifest /
  annotation authoring: navPlace props keep working; P1 annotation slides
  additionally accept `storymap:markerIcon` (+`markerLabel`) terms on the
  annotation, falling back to canvas navPlace props. Schema + types +
  validate. `audioBadge` renders a small indicator on markers whose slide
  has narration/audio media (Micrio-like affordance).
- **P3a popup** (S-M): `marker.popup` (default off) binds the popup card
  to the marker — active-marker click toggles it (headline, sanitized
  excerpt, thumb, audio play); inactive-marker click still navigates
  (unchanged). Render as OL overlay anchored at the marker; close on
  navigate/`Esc`; keep #288 touch-action and #434 tap-target behavior.
- **P3d subtitles** (S): `media.subtitles` (VTT URL) → `<track
kind="subtitles">` on `Audio`/`Video` elements; a11y win for #385.
  Schema + types only, no resolver change.
- **P3b narration** (M): optional slide-level `narration: {url}`; on
  `change`, stop previous narration and play the new one through a
  dedicated audio element in the slider (mirroring `Media._stopMedia`).
  Browser policy: unmuted audio requires a prior user gesture —
  narration starts only post-gesture; document this. Schema + types +
  validate.
- **P3c media-aware autoplay** (M): new `autoplay_media` boolean (default
  false). When true and the slide has playable audio/video, the scheduler
  waits for media `ended` instead of the fixed `autoplay` ms (timer
  remains as fallback). Needs an `onMediaEnded`-style hook on the `Media`
  base with `ended` listeners wired in `Audio`/`Video` (same pattern as
  `canplay` at `Audio.ts:29-31`). E2E needs a tiny audio asset — commit
  one under `public/examples/`.
- Tests: unit where jsdom-able (alias precedence, converter) +
  `e2e/marker-popup.spec.ts`, narration/autoplay-media specs, subtitle
  track assertion. Effort overall: M.

## 3. Order, verification, rollout

Order: **P1 (converter + authoring guide + fixture) → marker config +
popup → subtitles → narration → media-aware autoplay** (each
independently shippable; P1 unlocks the most IIIF value first). Per item:
`npm run typecheck`, `lint`, `validate`, `npm test`, `npm run build`,
then new + adjacent e2e (iiif/manifest/autoplay/marker specs). Docs per
item in `migration-from-knightlab.md` + `storymap-as-iiif-manifest.md`
(+ the new authoring guide for P1).
