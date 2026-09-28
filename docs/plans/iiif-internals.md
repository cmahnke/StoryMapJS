# IIIF-native internals: the manifest as the storymap's internal representation

**Runs after `docs/plans/iiif-interop.md` and `docs/plans/iiif-media-tours.md`.**
It depends on their output — the interop plan's standard-form readers, its nine
dropped terms, and media-tours' annotation-driven slides — so this file is
deliberately sequenced last.

Goal: make a IIIF Presentation 3 Manifest the **internal** representation of a
storymap. A `storymap.json` document is translated into a manifest at load, and
everything downstream reads that. The map-specific plumbing then lives entirely
in the translation step, which means **a story with no map constructs no map
engine at all** — no tile layer, no view, no markers, no minimap, no tile
consent question.

Acceptance: a legacy `storymap.json` and the equivalent manifest produce the
same rendered story; the internal data the slider, media and map read is a
manifest projection rather than the legacy object; a document with no map
renders as a text-and-media narrative with no map pane, no map CSS classes and
no tile consent row; and the manifest the viewer builds itself passes
`npm run validate:iiif`.

Explicit non-goals: rewriting `Slide`/`Media`/`Text` to speak IIIF natively
(§4 explains why projection is the right seam), keeping every legacy key
alive as a first-class internal field, and reinterpreting `map_type: ""`
(§2.4 explains why that is a breaking change and gets an explicit opt-in).

Cross-links: `docs/plans/iiif-interop.md` (the standard forms and the nine
dropped terms this plan depends on), `docs/plans/iiif-media-tours.md`
(annotation-driven slides and narration, which arrive as canvases and `Sound`
bodies), `docs/plans/issue-159-vector-markers.md` (the marker layer, which
reads the projection),
`docs/storymap-as-iiif-manifest.md` (the user-facing mapping).

---

## 0. Background: what the legacy shape actually costs us

The audit behind this plan found something that makes the proposal much cheaper
than it looks: **the narrative layer does not use the map's data at all.**

> **Status: still valid, still unstarted — but §0.1 needs a caveat now.** The
> media-tours work added two slide fields after this audit was written:
> `narration` (read by `StoryMap`, not the map) and `marker` (read only by
> `MapMarker`, i.e. the map). The headline claim holds for `location`, but
> `narration` is a third category — audio, not content and not map — and §2.4's
> "an explicit way to say no map" has to keep working with a slide that has
> narration and no map pane. Read §0.1's two new rows before planning P0.

### 0.1 The slide fields the narrative layer reads

Everything outside `src/map/**` reads exactly four slide fields (verified by
exhaustively listing every `slide.data.<field>` access) — **as of the
media-tours work this is now six**, because `narration` and `marker` were
added as slide fields and `StoryMap` reads both without touching the map. The
four original ones:

| Field        | Consumers                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uniqueid`   | `Slide._initLayout` (DOM id, `src/slider/Slide.ts:356`), `StorySlider._createSlides` (generates when falsy, `:234`), `goToId` (`:266`), the `change` payload (`:819`) |
| `text`       | `Slide._initLayout` (`:405-434`), `StorySlider.getNavInfo` (`:445`), `media/types/Text.ts`                                                                            |
| `media`      | `Slide._initLayout` (`:402-426`), `StoryMap._startConsentAsk` (`:1304`), all of `src/media/**`                                                                        |
| `background` | `Slide.setActive` (`:204`), `Slide._initLayout` (`:380-399`)                                                                                                          |

The two new ones are the interesting ones for this plan:

| Field       | Consumers                                                                       | IIIF expressible as                                      |
| ----------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `narration` | `StoryMap._playNarration()` — one reused audio element, not a slide media frame | a `Sound` body / external audio, i.e. `media` (arguably) |
| `marker`    | `MapMarker._presentation()` only — no reader outside `src/map/**`               | `navPlace` Feature properties                            |

`narration` is the one that complicates the clean split below, because it is
neither content nor map: it is audio the guide listens to, distinct from the
slide's own media. Whether it survives into a native model is a real P0/P1
question, and it is now the first thing that plan has to answer.

And this is still the finding that decides the whole plan: **`slide.location`
is never read outside `src/map/**`.** It is seeded as `null` at `Slide.ts:136` and
nothing else touches it. `slide.type` is map-only too, and `slide.date` and
`slide.group` are read by _nothing at all_ — `group` is declared in
`src/types.ts:65` and the schema and never read, `date` is written by the
converter (`src/storymap/iiif.ts:369`) and never read.

So the slide splits cleanly into a **content half** (`uniqueid`, `text`,
`media`, `background` — all of which IIIF expresses natively) and a **map half**
(`location`, `type` — both of which IIIF also expresses, as `navPlace` and an
extension term). There is no third category forcing a bespoke format.

### 0.2 The map is unconditional, and its absence is not tolerated

`this._map` is declared non-null and initialised to a **stub object**, not
`null` (`src/storymap/StoryMap.ts:239`: `this._map = {} as OpenLayersMap`),
while `this.map` (the raw `ol/Map`) is properly `null` until built (`:241`).
That inconsistency is load-bearing today: the nine accessor guards read
`!this._disposed && this._map ? … : neutral`, and because `{}` is truthy they
would **pass on the stub and then call a method on it**. Making the map
optional therefore means making `_map` genuinely `null`, not merely unused.

Fourteen unguarded call sites assume a map: construction (`:992-1003`),
`goTo` (`:668`), the `change` subscription (`:1049`), six calls inside
`_updateDisplay` (`:1147, 1178, 1207, 1236, 1239, 1247`), the overlay setters
(`:738, 747`), `createMiniMap` (`:938`), `setExtraAttributions` (`:947`),
`markerOverview` (`:1474`) and `getRouteDistance` (`:1538`).

Three consequences are already latent bugs rather than future work:

- **`loaded` is gated on the map.** `_onLoaded` (`:1543`) requires
  `this._loaded.storyslider && this._loaded.map`, so with no map the public
  `loaded` event never fires — and neither do `_applyHashSlide`,
  `_syncHash`, `_updateProgress` or `_updateDistance` (`:1549-1555`).
- **Tile consent is requested unconditionally.** `_startConsentAsk` pushes
  `tileService()` (`:1300`) for every story, so a text-only story would still
  ask the visitor about map tiles.
- **The layout presumes a map pane.** `_el.map` is created unconditionally
  (`:981-982`) and then sized, offset and animated in six places; `map_area`
  emits a `vco-map-area-left` class on the _root_ container (`:1233`) and
  `map_as_image` changes the menubar's overview label
  (`src/ui/MenuBar.ts:128, 294`).

### 0.3 The map half of the options is dead in several places

Audited across the whole repo, these options have **no reader anywhere**:
`less_bounce`, `map_subdomains`, `map_popup`, `zoom_distance`, `dragging`,
`path_gfx`, and the root `title` and `uniqueid` keys the converter writes. They
are schema-documented, accepted, and inert — the same category
`docs/plans/iiif-interop.md` found in the IIIF vocabulary. A canonical internal
form is the moment to delete them rather than carry them into the manifest.

`map_type` defaults to `""`, not `"osm:standard"` (`:288`), and `""` falls
through `_createDefaultTileLayer` to OSM. The schema requires only `slides`
(`schema/storymap.schema.json:11`), so `map_type` is already optional — but
`null` in hand-written JSON throws out of the constructor at `:506`
(`.startsWith`), which is a latent crash today.

### 0.4 The legacy → IIIF direction already exists, in the wrong place

`scripts/convert-to-iiif.mjs` (413 lines) is the **only** producer of manifests
in the repo, and the library has no such function — it only reads
(`manifestToStorymapData`, `src/storymap/iiif.ts:382`). The script already
emits `navPlace` on canvases (`buildNavPlace`, `:361-384`), but it emits
**none** of the things interop's plan requires: no `structures`/`Range`, no
`navDate`, `requiredStatement` as a single object rather than an array
(`:119`), no `accessibilitySummary`, and no georeferencing annotations. The
function this plan needs is therefore this script _promoted into the library
and brought up to the post-interop standard forms_ — not a new invention.

Making it a library function also removes a real duplication: today the CLI
writes manifests and the viewer reads a different subset of what it wrote, and
`e2e/manifest-parity.spec.ts` proves parity for only **four** terms
(`map_area`, `overview_extent`, `keyboard`, `overlays`) out of 29.

### 0.5 What pins the legacy shape in tests

Budget for these; they are the migration's real work:

- `tests/data-immutable.test.ts` — the load-bearing one. Its header states
  "`StoryMap.data` is the very object the host passed in", and it deep-compares
  `structuredClone(storymap.data)` before and after. **Deciding to keep
  `.data` pointing at the host's object (§4) keeps this test green; exposing
  the manifest instead would break it.**
- `tests/iiif.test.ts` — the de-facto contract for `manifestToStorymapData`,
  pinning every per-slide field and all 24 mapconfig terms. Under this plan it
  is _replaced_ by a manifest-projection contract. It has since grown a
  sibling rather than being replaced: `tests/iiif-annotations.test.ts` (28
  tests) now pins the annotation-stop conversion and the body record, and
  `tests/media-tours.test.ts` pins the marker config. Any native model has to
  satisfy all three, and the annotation one is the newest contract, so a plan
  that only reads `tests/iiif.test.ts` will under-count its work.
- `tests/image-region.test.ts` (reaches into `_storyslider._slides[1].data`),
  `tests/multiple-instances.test.ts` (pins that the caller's slides never gain a
  generated `uniqueid`), `tests/marker-reindex.test.ts`, `tests/ol-accessors.test.ts`,
  `tests/issue-368-null-safety.test.ts`, `tests/validate.test.ts`.
- Eleven e2e specs read internals: `e2e/manifest-parity.spec.ts` (the
  legacy ≡ IIIF parity assertion), plus `__sm.options` reads in
  `georeference.spec.ts`, `map-area.spec.ts`,
  `issue-418-iiif-overview-fit.spec.ts`, `issue-349-minimap.spec.ts`,
  `line-style.spec.ts`, `line-history.spec.ts`, `line-retract.spec.ts`, and
  `__sm._map` internals in three more.

---

## 1. The design

Three kinds of data, three destinations. This split is the whole idea:

| Kind                     | Examples                                                                                                                                    | Home                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Content**              | slides, text, media, backgrounds, dates, groups, attribution, alt text, locations, georeferenced rasters                                    | the **manifest** — canonical, internal                                             |
| **Map configuration**    | `map_type`, `map_as_image`, `map_bbox`, `map_area`, `overlays`, `overview_extent`, TileJSON terms, attribution                              | read **at translation time** into a `MapConfig`; if there is none, there is no map |
| **Viewer configuration** | `duration`, `autoplay`, `layout`, `show_overview`, `keyboard`, `consent_required`, `text_align`, `font_css`, `skinny_size`, `map_height`, … | **unchanged** — stays in `StorymapOptions`, never enters the manifest              |

The consequence worth stating plainly: **the manifest can only carry content,
so every viewer-only option has to stay where it is.** That is not a
limitation to work around — it is what makes the emitted manifest pass the
official IIIF validator, which is a hard gate here.

Two further decisions, both taken:

- **One reader, not two.** IIIF input is used as-is (after normalization);
  legacy JSON is translated into the same manifest shape. `manifestToStorymapData`
  and `storymapToManifest` are not a round trip inside the runtime — the
  translation runs once, at load, and everything after it reads the manifest.
- **Projection at the seam, not IIIF-native internals.** `Slide`, `Media` and
  `Text` keep reading the `StorymapSlide` shape. A Canvas is projected into that
  shape at exactly one place, so the manifest is canonical without dragging
  25 media types and the whole slider through a rewrite. Rewriting those to
  speak IIIF is a separate, much larger project and is explicitly a non-goal.

---

## 2. P0 — make the map genuinely optional — shipped

Effort M. **Independently shippable and valuable on its own**: it delivers the
mapless storymap as a product feature, and everything after it lands on a
viewer that already tolerates no map. It needs nothing from the IIIF work.

**What landed:** `_map` is genuinely `null` (the `{}` stub is gone, so the
accessor guards mean what they say) and `_el.map` is `HTMLElement | null`;
`map_type: "none"` builds no engine, no pane and no overview control; `loaded`
no longer waits for a map; tile consent is only asked for when there is a map;
a `vco-layout-no-map` branch lays the slider out full-width in both orientations;
`map_type: null` is normalised instead of crashing; and the six inert option
keys of §2.6 are deleted from the schema, the types and the defaults. Covered
by `tests/no-map.test.ts` (12) and `e2e/no-map.spec.ts` (7), and the sentinel
round-trips through a manifest as the basemap keyword.

**Two §0.3 claims that were wrong**, found by grepping for a real reader before
deleting anything:

- **Root `uniqueid` is live.** `formatContentState()` reads it for the
  `iiif-content` `partOf` Target Body, so it stays.
- **Root `title` was never in the schema or the types** — it is written by
  `manifestToStorymapData` and read by nobody, so §0.3 had nothing to delete
  here. (`SlideNav` reading `title` is its own local field, fed from
  `slide.text.headline`, not this key.)

### 2.1 `_map` becomes `OpenLayersMap | null`, initialised to `null`

Replaces the `{} as OpenLayersMap` stub (`:239`). Every
`!this._disposed && this._map ? … : neutral` guard then means what it says
instead of passing on a truthy stub. The nine accessors, `setMapOption`,
`setMapOptions`, `setOverlayVisible`, `setOverlayOpacity`, `createMiniMap` and
`setExtraAttributions` keep their neutral returns; the fourteen unguarded sites
listed in §0.2 get explicit guards.

### 2.2 `loaded` stops being gated on the map

`_onLoaded` (`:1543`) currently requires `_loaded.map`. A mapless story must
still fire `loaded`, apply a `#slide-N` hash, and update progress. The
condition becomes "the slider is ready **and** the map is ready **if there is
one**".

### 2.3 Consent follows the map

`_startConsentAsk` pushes `tileService()` unconditionally (`:1300`). Only push
it when a map exists; media consent is unaffected. Test: a story with no map
and `consent_required: true` asks about its media services only, and the
consent row list contains no tile entry.

### 2.4 An explicit way to say "no map"

`map_type: ""` currently means OSM, so absence cannot be reinterpreted without
breaking every existing document. Add an explicit sentinel — `map_type: "none"`
— rather than treating `""` or an absent key as "no map". While there, make
`map_type: null` not throw at `:506`, since the schema already permits the key
to be absent and a null crashing the constructor is a latent bug.

### 2.5 Layout without a map pane

The largest sub-item. `_el.map` is created unconditionally (`:981-982`) and
sized/offset/animated in six places; `map_size_sticky`, `map_height` and
`skinny_size` all presume it. A mapless story needs a layout of its own — a text
and media panel with the slider beneath, which is the TimelineJS shape the
interop research (§1.6 there) describes. Scope: a new `vco-story--no-map`
layout branch plus the `vco-map-area-left` / overview-label / distance
consequences from §0.2. `show_distance` needs no special-casing beyond not
rendering, because its value comes from `this._map.getRouteDistance()`.

### 2.6 Dead option keys are deleted, not carried

§0.3's list — `less_bounce`, `map_subdomains`, `map_popup`, `zoom_distance`,
`dragging`, `path_gfx`, root `title`/`uniqueid` — removed from the defaults, the
schema and the types, with a CHANGELOG entry. They are inert, so this is a
schema change with no behaviour change, and it is the moment to stop carrying
them into a canonical form.

**Gates:** unit tests for a mapless story (no `ol/Map` constructed, `map` is
`null`, every accessor neutral, `loaded` fires, consent omits tiles); the
existing suite green except the tests §0.5 lists as intentional changes; new
`e2e/no-map.spec.ts`; `validate`, `validate:iiif`, `typecheck`, `lint`,
`format:check`, `build`. The format gate moves to a reviewed diff (schema,
converter, fixtures) because the schema and fixtures change.

---

## 3. P1 — `storymapToManifest()` in the library — shipped (except the parity sweep)

Effort M. Port `scripts/convert-to-iiif.mjs` into
`src/storymap/to-iiif.ts` (or beside the reader in `src/storymap/iiif.ts`) and
update it to the standard forms interop's plan establishes, so the function
emits what the interop reader reads:

- `navDate` instead of the `storymap:date` term, `requiredStatement` as an
  **array**, `accessibilitySummary` instead of `mediaAlt`, caption from
  `body.label` and credit from `body.requiredStatement`/`provider`,
  `structures`/`Range` for `slide.group`, and georeferencing annotations for
  placed rasters.
- `navPlace` on canvases, as today, with the properties bag described by the
  local context interop §3 adds.
- Everything from §1's "viewer configuration" row must **not** appear.

Then make the CLI delegate to it, so one function both writes and reads the
format. Extend `e2e/manifest-parity.spec.ts` from its current four terms to the
full mapconfig term list, which closes the verification gap §0.4 describes.

**What landed:** `src/storymap/to-iiif.ts` is the pure writer, exported from
`src/main.ts`; the CLI is 71 lines of `node:fs` I/O that delegates to it via
Node's own type stripping (`node --experimental-strip-types`), so there is no
new dependency and no build step for a user who has only run `npm install`.
Output is byte-identical across all 49 source fixtures — the round-trip test is
the oracle. §0.4's "bring it up to the post-interop standard forms" turned out
to be already done: the interop work had moved the writer forward, so the port
was a move, not a rewrite. **Still open:** the parity sweep, and the eight
inert-but-read terms interop has not retired (`mapSubdomains`, `callToAction`,
`callToActionText`, `startAtSlide`, `language`, `calculateZoom`, `lessBounce`,
`keyboard`) that the mapconfig service still carries against §1's
"viewer configuration" row — a P2/P3 job, since the round-trip test depends on
them.

**Gate that matters most:** the emitted manifests must pass
`npm run validate:iiif`. That is a hard constraint on the design, and it is
free — the converter script already emits validator-clean manifests.

---

## 4. P2 — internals read the manifest

Effort L. The biggest phase, and the one that must not grow.

1. **One projection point.** A Canvas plus its annotations project into the
   existing `StorymapSlide` shape (`uniqueid`, `text`, `media`, `background`,
   and `location`/`type` for the map's benefit). `Slide`, `StorySlider`,
   `Media` and `Text` are untouched, because they consume the projection rather
   than the manifest. `MapMarker.OpenLayers.ts` likewise keeps reading
   `location`, so `docs/plans/issue-159-vector-markers.md` is unaffected.
2. **`data` stays the host's object.** `StoryMap.data` continues to point at
   the caller's legacy document — never mutated, as
   `tests/data-immutable.test.ts` requires — and a new `getManifest()` exposes
   the canonical form. The cost is that two shapes coexist at the boundary; the
   benefit is that no host breaks and the mutability contract is preserved. The
   legacy view is _derived_ and never written, and a test asserts the
   projection round-trips rather than drifting.
3. **`manifestToStorymapData` is retired** once the projection covers it, and
   `tests/iiif.test.ts` is replaced by a projection contract test.
4. **`updateData` narrows.** It currently copies any schema key that exists in
   the options object (`src/core/Util.ts:71-78`), which is how 29 viewer
   options leak out of a manifest. With the split in §1, content keys come from
   the manifest and viewer keys from the options object, and the two sets are
   asserted disjoint by a test.

**Gates:** the rewritten `tests/iiif.test.ts` plus a new
`tests/manifest-projection.test.ts`; the full unit suite with §0.5's list
reconciled; `e2e/manifest.spec.ts` and `e2e/examples.spec.ts` across all
fixtures; `validate:iiif`.

---

## 5. P3 — the map is built from `MapConfig`, not from `data`/`options`

Effort M. Today the engine is constructed as
`new OpenLayersMap(this._el.map, this.data, this.options)` (`:992`) and reads
map keys off both objects. With the split, the translation step yields a
`MapConfig` (basemap keyword or TileJSON `tiles`, `map_as_image`, `map_bbox`,
`map_area`, overlays, georeferenced layers, attribution, `overview_extent`,
`marker_labels`, the line style block) and the engine is constructed from that
alone.

The payoff is the one the user asked for: **all the map plumbing is confined to
the translation and construction steps**, and a manifest with no map
configuration produces a `MapConfig` of `null` and no engine. Line styling is
included because it is map config with no standard home — under the interop
term policy those extension terms stay in the mapconfig service, which is
correctly a _service_ rather than manifest properties (the official validator's
Manifest schema is `additionalProperties: false`).

---

## 6. Order, verification, commits

Order: **interop → media-tours → P0 → P1 → P2 → P3.** P0 is deliberately before
the IIIF work: it is independently valuable, and it means the manifest work
lands on a viewer that can already run without a map.

**Status: P0 and P1 shipped. P2 and P3 not started.** P2 is the one the risk
section says must not grow, and P3 builds on the `MapConfig` P2 introduces, so
they want a green checkpoint each rather than arriving as one large diff. The
load-bearing decisions for P2 are already made and written down in §4: one
projection point, `data` stays the host's object with a new `getManifest()`,
`manifestToStorymapData` retires, `updateData` narrows. The remaining question
P2 must answer, added by the P0 work: `map_type: "none"` is now a first-class
internal state, so the projection has to produce it rather than leave a
manifest with no map configuration as an accident.

Identity and deep-linking is again one cross-cutting workstream — `uniqueid`,
the `#slide-N` hash and the `change` payload are touched by interop §2.3 and
§5.1 and then, once more, by this plan's projection. Sequence it once, do not
scatter it.

Per phase: `npm run typecheck`, `lint`, `format:check`, `validate`, `test`,
`build`, then the new plus adjacent e2e, and `validate:iiif` throughout. P0, P1
and P2 all legitimately edit `schema/`, the converter and the fixtures, so the
format gate is a _reviewed_ diff for those commits and holds the empty-diff
line only for P3 and for documentation.

Commits, one per phase step rather than one per phase: `map is optional`,
`no-map layout`, `drop the inert option keys`, `storymapToManifest in the
library`, `CLI delegates to the library`, `internals read the manifest`,
`projection contract`, `build the map from MapConfig`.

---

## 7. Risks

- **Two shapes coexisting at the boundary** is the main design cost, and the
  mitigation is structural rather than a convention: the legacy view is
  derived, never written, and a round-trip test fails on drift.
- **`_map` becoming `null` is a type-level change** touching every accessor's
  return type from `OlLayer` to `OlLayer | null`. Most already return `| null`;
  the audit should expect a handful of signature widenings and the
  `tests/ol-accessors.test.ts` updates that follow.
- **The no-map layout is the least specified part of this plan** and the most
  likely to grow. It is the piece to timebox first, and to ship even if P1-P3
  slip.
- **`map_type: "none"` is a new public value**, so it needs a schema enum
  update, a CHANGELOG entry and a migration-guide note — a small, deliberate
  API addition rather than a reinterpretation.
- **Manifest validity constrains the design** and should be checked early, not
  at the end: run the emitted output through the official validator in P1
  before P2 builds on it.
- **`e2e/manifest-parity.spec.ts` proves four terms out of 29** today. Extending
  it to all of them (P1) may surface latent mapping bugs, which is the point,
  but it should land in its own commit so the fallout is attributable.
