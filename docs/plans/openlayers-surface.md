# OpenLayers surface: expose the full map API, keep our own thin

Goal: make `storymap.map` a genuinely usable, typed OpenLayers map —
accessors for every internal object we keep private, events for image
readiness, a real teardown path — while our own API stays a thin,
documented layer over it. **The storymap JSON exchange format does not
change** in any phase.

Baseline measured before starting (with the in-flight georeference work in
the tree): `npm run typecheck` clean, `npm run lint` clean, `npm test`
22 files / 135 tests passing, format gate empty.

## 0. Background: what the audit found

`storymap.map` is already the raw `ol/Map` (assigned
`src/storymap/StoryMap.ts:609`), so OL's API is _reachable_. The problems
are around it:

- `src/main.ts:13-51` exports 6 values and 3 types, **no OpenLayers
  types** — consumers cannot even name `storymap.map`'s type.
- Engine internals are the de-facto public API: `_tile_layer`
  (`Map.OpenLayers.ts:54`), `_overlay_layers` (`:61`), `_tile_layer_mini`
  (`:57`), `_mini_map` (`:58`), `_line`/`_line_active` (`:55-56`),
  `_markers` (`:59`). The test suite already reaches through them
  (`tests/overlays.test.ts:8`, `tests/map-layers.test.ts:87`,
  `e2e/line-style.spec.ts:64`, `e2e/map-bbox.spec.ts:25`,
  `e2e/overlays.spec.ts:32`, `e2e/line-history.spec.ts:32`).
- Nine pass-through methods duplicate OL calls reachable via
  `storymap.map.getView()`.
- Five places actively **mislead** an OL consumer (Phase 2).

Overlap note: the in-flight georeference work
(`src/map/georeference.ts`, `e2e/georeference.spec.ts`,
`tests/georeference.test.ts`) does not touch any item below — this plan
is additive with respect to it.

## 1. Phase 1 — types, accessors, layer passthrough (Effort S)

1. **`src/main.ts`** — export OL types (`Map`, `View`, `Layer`,
   `Tile`/`Vector`/`Source`, `Projection`) plus `TileSourceFactory`,
   `StorymapOverlayLayer`, `StorymapMapOptions`, `LatLngLiteral`, so
   consumers can write `const view: View = storymap.map.getView()`.
2. **Accessors** on the engine (`Map.OpenLayers.ts`), re-exposed on
   `StoryMap`: `getBaseLayer(): TileLayer | null`,
   `getOverlayLayers(): TileLayer[]`, `getOverlayLayer(i)`,
   `getMinimap(): OlMap | null` (the `OverviewMap` control's map),
   `getLine()`, `getLineActive()`, `getMarker(n)`, `getMarkers()`.
   Then migrate the existing internal reaches in tests/e2e to them.
   Rationale: the overlay index is **not** `getLayers()` order (creation
   order is `[tile, line, line_active, overlay0…]`, `zIndex` is a separate
   axis 0 / 1..n / 10 / 11 at `:238,288,150,157`) and malformed
   `overlays[]` entries are skipped (`_overlay_entries` note at
   `:62-67`), so consumers cannot derive the layer from the raw map.
3. **Layer passthrough** in `_createTileLayer` (`:482-504`): pass through
   `instanceof Layer` _before_ the `getSource` check, widen
   `_tile_layer`/`_overlay_layers`/`_tile_layer_mini` to `Layer`, guard
   `.getSource()` call sites with `"getSource" in layer`. Unblocks Allmaps
   `WarpedMapLayer` (no `getSource`), i.e. the remaining item from
   `iiif-geo-layers.md` §2.
4. **Alias policy (decided: keep as aliases, no removals)** — JSDoc +
   typedoc "alias of" notes for `setMapOption`, `panTo`, `zoomTo`,
   `viewTo`, `markerOverview`, `calculateMarkerZooms`, `getBoundsZoom`,
   `setOverlayVisible/Opacity`, `getOverlayCount`, pointing at the
   equivalent `storymap.map` call. Only genuinely dead code goes: the
   `Map.show()/hide()` stubs (`src/map/Map.ts:435,437`, shadowed by the
   `DomMixed` mixin) and the mis-typed `getBoundsZoom(): void` (`:372`
   → `number`).

Gates: `typecheck`, `lint`, `npm test`, targeted e2e (overlays,
line-style, line-history, map-bbox, image-mode), `prettier`.

## 2. Phase 2 — conflict fixes (Effort S–M)

| #   | Issue                                                                                                                                                                                                                                                           | Fix                                                                                                     | Why it is safe                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| C1  | `setMapOption("map_bbox")` re-constructs the `View` (`:1939-1956`), keeping only projection/center/zoom/extent — **drops** `resolutions`, `multiWorld`, `constrainOnlyCenter` and every `map_options.view` key, which breaks image maps (center clamped to ±90) | update the existing view in place (`view.setExtent()`)                                                  | view config only; the risky bit, needs the full image-mode matrix                                                             |
| C2  | sources get `attributions: []` (9 sites) and we render our own `.vco-map-attribution` (`:185-209`)                                                                                                                                                              | **both** (decided): put real `attributions` on every source _and_ keep our line as the rendered default | default look unchanged; `ol/control/Attribution` now works for consumers                                                      |
| C3  | `map_options.interactions` documented as "replace" (`src/types.ts:200`, `docs/migration-from-knightlab.md:154`) but OL defaults are appended (`:95` then `:171-172`)                                                                                            | **docs only** (decided): describe the actual append behavior; `controls` does replace, that claim stays | `map_options` is a real storymap key — aligning the code toward "replace" would strip pan/zoom from existing stories          |
| C4  | `calculate_zoom` writes the computed zoom into the author's JSON (`:1230`), and `StoryMap.data` is the same object graph; `Map.ts:400-401` reads `location.zoom`                                                                                                | keep an internal computed-zoom store; `Map.ts:400-401` reads that, `data` stays byte-faithful           | guarded by a new non-mutation unit test; `tests/iiif.test.ts:153,246` derive zooms from the manifest term, so they stay valid |
| C5  | `storymap.map = {} as OlMap` before load (`:159`)                                                                                                                                                                                                               | type it `OlMap \| null`                                                                                 | pre-`dataloaded` access gives `null` instead of a silently broken object                                                      |

Gates: same as Phase 1 **plus** the full image-mode regression matrix
(`418`/region/zoomify/minimap/marker-sync/`506`) since C1 touches view
config.

## 3. Phase 3 — events and lifecycle (Effort M)

- **`imageready`** event `{layer, source, kind: "iiif" | "zoomify"}` fired
  when an image source is actually attached — replaces the 7 silent
  `source.once("change")` sites and fixes `loaded` firing off OL
  `loadend` before the async `setSource`. Forwarded on `StoryMap` like
  `markerAdded`.
- **`dispose()`** — tears down the `OlMap`, layers, `ResizeObserver`, the
  window `resize`/`hashchange`/`keydown`/`fullscreenchange` listeners and
  all timers. Today nothing does this: everything leaks.

Gates: same, plus `npm run build` and `npm pack --dry-run`.

## 4. Phase 4 — space helpers and documentation (Effort S)

- `isImageSpace()` — image maps claim `EPSG:4326` while coordinates are
  pixels (`:97-107`: `multiWorld: true` + `IMAGE_RESOLUTIONS`), so
  `ol/proj` calls silently produce garbage. We keep the projection and
  document the caveat instead of a custom projection code (decided).
- Offset-aware `getCenter()` / `getZoom()` — the exposed
  `getView().getCenter()` is deliberately panel-shifted
  (`:1534-1536` and friends), so it does not equal the slide location.
- Document the reserved z-ranges (base 0, overlays 1..n, lines 10/11).

### Docs to update

| File                                   | Change                                                                                                         | Phase |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| `docs/migration-from-knightlab.md:154` | fix the `interactions` claim (C3)                                                                              | 2     |
| `docs/migration-from-knightlab.md:133` | extend the "OpenLayers `Map`" bullet: accessors, `imageready`, `dispose()`, image-space caveat                 | 3, 4  |
| `docs/DEVELOPMENT.md:106-116`          | OpenLayers notes: `tile_source_factory`, accessors, `imageready`/`dispose`                                     | 1, 3  |
| `src/types.ts:200`                     | `map_options` JSDoc wording (C3)                                                                               | 2     |
| `CHANGELOG` 1.0.0                      | bullet group "OpenLayers surface: typed exports, accessors, `imageready`, `dispose()`, view/attribution fixes" | 4     |
| `README.md:99`                         | one-line pointer that `storymap.map` is a typed OL map (optional)                                              | 4     |

## 5. Format-neutrality gate (before every commit)

1. `git diff --stat schema/storymap.schema.json scripts/convert-to-iiif.mjs
public/context.json public/examples public/examples-iiif` must be
   **empty** — no new/changed/removed storymap properties, no new IIIF
   terms, no fixture churn.
2. `npm run validate` green.
3. `node scripts/convert-to-iiif.mjs` → zero diff in
   `public/examples-iiif/`.
4. `npm run validate:iiif` green.
5. A unit test asserting `storymap.data` is not mutated by navigation
   (guards C4).

## 6. Commits

1. `expose the OpenLayers layer and marker API from the viewer`
   (Phase 1 + DEVELOPMENT notes)
2. `fix view, attribution and data-mutation conflicts with the
OpenLayers surface` (Phase 2 + C3 doc fixes)
3. `add imageready event and dispose() for the exposed map`
   (Phase 3 + migration guide)
4. `add image-space helpers and document the OpenLayers surface`
   (Phase 4 + CHANGELOG / README)

## 7. Open forks

- Readiness event name: `imageready` (default here, avoids colliding with
  the existing `loaded` semantics) vs `imageloaded`.
- Whether the optional `README.md:99` pointer is in scope.
