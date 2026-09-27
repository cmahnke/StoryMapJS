# Issue #159 — Marker Clustering via a Vector Marker Layer

Upstream: [NUKnightLab/StoryMapJS#159](https://github.com/NUKnightLab/StoryMapJS/issues/159)
("Find solution to marker clustering"). Status in `docs/KNOWN_ISSUES.md`:
`not implemented`, target behavior documented by
`e2e/known-issues/issue-159-marker-clustering.spec.ts` (`test.fixme`).

Acceptance: tightly grouped markers cluster at low zoom — the spec renders
the 150-marker `issue-425-many-slides` fixture and asserts the distinct
cluster bubbles are fewer than the markers.

## 0. Background: why overlays can't cluster

Markers are HTML `ol/Overlay`s, not vector features:

- Element + attach/detach: `_createMarker`, `_createMarkerElement`,
  `_addTo`/`_removeFrom` (with `positioning: "bottom-center"` for the
  default pin and `stopEvent: false`) and `_customIconAnchor`, all in
  `src/map/openlayers/MapMarker.OpenLayers.ts`. The public
  position accessor is `latLon()` (`:84`) — the vector path should read that
  rather than re-deriving from `data.location`.
- Active/inactive + labels: `_active`, class swaps, `zIndex 1000` when
  active, and the `.vco-marker-label` element for `marker_labels` in
  `MapMarker.OpenLayers.ts` (labels in `_createMarkerElement`), styled in
  `src/scss/map/VCO.MapMarker.scss` (tap target `:38`, labels `:81`).
- Map CRUD: `_createMarker`, `_addMarker`, `_removeMarker` in
  `src/map/openlayers/Map.OpenLayers.ts:1277,1286,1312`; shared contracts in
  `src/map/Map.ts` — removal plus `marker_number` re-indexing and
  `fire("markerRemoved")` at `:468-480`, `fire("markerAdded")` at `:564`,
  and `_initData` (init + `active(true)` on the current slide) at
  `:768-776`.
- **Ownership**: every marker has a `dispose()` that releases its overlay,
  its click listener, and — since the media-tours work landed — any open
  popup plus that card's `keydown` listener; the engine's `dispose()` walks
  the collection. A vector renderer must release its feature, and must
  release a popup the same way.
- **Renumbering**: `marker_number` is the marker's index into
  `Map._markers` and is re-assigned for every marker after a removal
  (`Map.ts:474-479`) because `_onMarkerClick` hands it straight to
  `goTo()`. A feature keyed by `marker_number` therefore needs an explicit
  re-key path, not just a splice.
- Click chain: marker DOM click → `fire("markerclick", {marker_number})`
  (`src/map/MapMarker.ts:154`) → `_onMarkerClick` (`src/map/Map.ts:560`) →
  the full `goTo` path (`src/map/Map.ts:197-328`); slider/map fan-out in
  `StoryMap.goTo` (`src/storymap/StoryMap.ts:594-630`).
- Motion: no marker animation library; views move via `View.animate`
  (`Map.OpenLayers.ts:1755`), lines via a `requestAnimationFrame` ladder
  with `_cancelLineAnimation` (`:1701-1707`) over a layer built by
  `_createLine` (`:1527`).
- Dateline: `_unwrapLongitudes` (`Map.OpenLayers.ts:1339`) and its overlay
  repositioning call sites (`:1306,1330,1596`).
- Minimap is marker-less by design (`#369` — its collection only ever
  receives the mini tile layer); labels are `#243`
  (`_createMarkerElement`).
- Cross-plan: `docs/plans/iiif-media-tours.md` §2 **has now landed** the
  marker popup, the audio badge and per-slide `marker.*` config, all
  positioned through `latLon()` precisely so they survive this work. Three
  consequences for the vector renderer, sharper than when this was written:
    1. `marker.popup` and `marker.audioBadge` are two more **DOM children of
       the marker element**, not just a card. A vector mode that draws into a
       canvas has to draw both, or the parity claim in step 3 is wrong.
    2. The card is `position: absolute` inside the marker element, so the
       existing "do not create the DOM marker in vector mode" rule now also
       means "the popup and the badge are silently unavailable" — not a
       rendering nicety.
    3. The popup's Escape handling is a per-marker `keydown` listener, added
       only while a card is open, and removed in `dispose()`. The vector path
       must not leave one attached per feature.

OpenLayers' `Cluster` source only wraps vector sources, so clustering
requires handling the marker layer in OpenLayers first.

## 1. Phase 1 — vector renderer behind an option (default unchanged)

- New `marker_renderer: "overlay" | "vector"` in `src/types.ts`
  (default `"overlay"`), plumbed through `src/storymap/StoryMap.ts`
  defaults.
- New vector path in `Map.OpenLayers`: one `VectorSource` +
  `VectorLayer` (`updateWhileAnimating: true`, above tile z), one
  `Feature(Point)` per `real_marker` slide only (overview / missing
  lat-lon → no feature; `marker_number` index alignment kept).
  Projection mirrors the overlay logic (`fromLonLat`, raw `[lon,lat]`
  for `EPSG:4326`, pre-unwrapped longitudes; `data.location` untouched) —
  read the position from `latLon()` so both
  renderers share one interpretation.
- Bookkeeping: the feature↔marker map is rebuilt (or re-keyed) in
  `_removeMarker`, because `marker_number` shifts on every removal
  (`src/map/Map.ts:474-479`), and the feature is deleted in the marker's
  `dispose()` so `StoryMap.dispose()`
  releases it with everything else.
- Style parity: default pin (pre-rendered canvas sprite reproducing the
  38×52 `\e600` pin + `vco-icon-<mediatype>` glyph variants), custom
  `Icon({src, anchor: [0.5, 1]})` via the existing `_customIconAnchor`
  (`_marker_icon()`), image-icon
  circle (48px, gray/inactive vs theme/active ring), active
  `zIndex 1000`, `Text`-style labels only when `marker_labels &&
active && headline` (nowrap, no hit).
- Interaction parity: `map.on("click")` +
  `getFeaturesAtPixel({hitTolerance})` → existing
  `markerclick{marker_number}` → `Map._onMarkerClick/goTo`;
  `stopEvent: false` pan semantics, `cursor: pointer` on hover,
  tap→click parity. Keep `markerAdded/Removed`,
  `_resetMarkersActive/active(true)`, `_calculateMarkerZooms`, and
  `renderSync` on the `_refreshMap/_setViewInstant` path. Lines,
  minimap, `map_area`/`map_bbox` untouched.
- Gates: `npm run lint`, `npm run typecheck`, `npm test`, existing
  marker e2e green (`506, 434, 405, 243, 349, 381, 176`), plus the
  ownership tests listed in "Layer ownership and the host-facing contract".

### Layer ownership and the host-facing contract

The marker layer is the first _viewer-owned_ layer a host might reasonably
want to touch, and `storymap.map` is the raw `ol/Map`, so both the accidental
removal and the "list my basemaps" cases are real. Decide them here rather
than leaving each host to guess.

- **Accessors.** `getMarkerLayer(): OlLayer | null`, and
  `getMarkerSource()` — the `Cluster` source when clustering is on (it
  wraps the vector source), so the features stay reachable and survive a
  layer swap. Plus `getMapLayers(): OlLayer[]` returning
  `[base, ...overlays]`, skipping the base layer while tile consent defers
  it. Engine methods plus `StoryMap` delegations in the existing
  `!this._disposed && this._map ? … : null` shape
  (`StoryMap.getBaseLayer`, `src/storymap/StoryMap.ts:736`).
  `getMapLayers()` is the answer to "give me the layers for a basemap
  selector or a visibility switch", and it also retires the `line` /
  `line_active` entries that `map.getLayers()` already pollutes with today.
- **zIndex bands are a contract, not an accident.** 0 base,
  `1 + i` per `overlays[]` entry (`_buildOverlays`,
  `src/map/openlayers/Map.OpenLayers.ts:405`), 10 `line`, 11 `line_active`,
  12 marker layer. `getMapLayers()` is the preferred route; `getZIndex() < 10`
  is the documented fallback for code that must walk `map.getLayers()`.
  Note that "markers paint above the route lines" survives the move to
  canvas, because the DOM overlay container is pinned above every layer
  canvas today and in vector mode nothing is put in it.
- **Repair.** `_ensureMarkerLayer()` called from `_createMap()` and
  `_refreshMap()`: `if (!map.hasLayer(markerLayer)) map.addLayer(markerLayer)`.
  `_refreshMap` already calls `updateSize()` and runs on every navigation,
  so this is a few lines in the path that is guaranteed to execute. A host
  that clears the layer collection, or rebuilds its own basemap stack,
  self-heals instead of silently losing navigation — the alternative is a
  map with no markers, no error, and `getMarkers()` still returning markers
  whose position objects point at a detached layer.
- **Explicit opt-out** — `setMarkerLayerRepair(enabled: boolean)`, engine
  and `StoryMap`, a setter only (no storymap option, so the schema and the
  format gate are untouched). Layer _membership_ is presentation state the
  viewer does not model, so opting out cannot desynchronise anything:
  navigation, `getMarkers()`, the zoom ladder and `dispose()` keep working
  and markers simply stop rendering. Semantics to document: it gates only
  the `addLayer` step and nothing else reads the flag; re-enabling
  re-attaches on the **next** `_refreshMap()` rather than immediately, so it
  cannot surprise a host mid-frame; the viewer still owns the layer and
  disposes it in `dispose()` even when detached; and it covers the main map
  only — the minimap's own collection is `clear()`ed and re-populated on
  refresh (`_refreshMiniMapLayer`,
  `src/map/openlayers/Map.OpenLayers.ts:2185`), so anything a host adds to
  the overview map is wiped there regardless. Motivation: the host renders
  its own markers and wants the viewer's gone for good.
- **Visibility semantics, stated once**, because "hide this layer" currently
  means three different things: an overlay's visibility is host-settable and
  persists (`setOverlayVisible`, `:574`); a line's is host-settable but
  re-asserted by the viewer on every navigation and option change
  (`_addToLine`, `_viewTo`, `applyOptions`), so a toggle visibly reverts; the
  marker layer is not meant to be toggled at all — use `marker.active()` or
  CSS on `.vco-mapmarker`.
- **Do not create the DOM marker in vector mode.** `_createMarker` builds the
  element (`_createMarkerElement`) and `_addTo` wraps it in an `ol/Overlay`;
  the vector path has to skip both or every marker renders twice. The
  consequence, now concrete: the popup's click target moves from DOM to
  feature, while its `latLon()` anchoring keeps the card in the same place —
  and the badge, which is also a DOM child, has no feature to attach to, so
  step 3 needs a canvas draw for it rather than only a hit test.

**Not in this phase:** `setMarkerLayer(layer)` — letting a host hand the
viewer a replacement marker layer. It desynchronises for concrete reasons:
the viewer owns the feature↔marker mapping and re-keys it on removal, so a
host-supplied `VectorSource` would have two writers; a host-added feature
has no `marker_number` for the `getFeaturesAtPixel` → `markerclick` path;
with clustering on, swapping the source swaps the cluster configuration; and
disposal ownership is ambiguous. If it ever lands it belongs inside
`marker_renderer` as a full renderer extension point, at which point the
repair is moot — there is no single viewer-owned layer to re-attach.

Tests for this subsection: with repair off, `removeLayer()` is not undone by
a navigation and nothing throws, while `getMarkers()` is unchanged; with
repair on, a removed layer is re-attached; `dispose()` still disposes a
detached viewer-owned layer; `getMapLayers()` contains the base layer and the
overlays and excludes the lines, the marker layer and the minimap.

## 2. Phase 2 — clustering

- OL `Cluster` source wrapping the vector source + `marker_clustering:
{ distance }` option (off by default); cluster style = count bubble;
  cluster click = `view.animate` zoom-in centered (clusters never map
  to slides — display-only by design).
- Un-`fixme` `e2e/known-issues/issue-159-marker-clustering.spec.ts`;
  it must pass against the 150-marker fixture.
- Gates: new spec green in both renderer modes where applicable +
  Phase-1 matrix re-run.

## 3. Phase 3 — flip + register

- Switch the default to `"vector"` only with the full matrix green
  (incl. `472`/keyboard slider specs as sanity).
- Audit `#159` → `fixed` with the spec ref; summary recount (must
  stay 109).

## 4. Risks (must verify, not assume)

- `#506` pixel-sync: anchor math (icon anchor vs glyph bottom pixel),
  HiDPI `scale`, `declutter` stays OFF (it displaces pins),
  `updateWhileAnimating: false` would freeze pins during
  `View.animate`; re-run `issue-506` + add a tip-vs-line-end assertion.
- `#434` tap targets: default vector hit = icon bounds only (the
  40×48 custom icon in `issue-405-custom-icon.json` fails 44px without
  an extra hit polygon/tolerance); keep both `issue-434` specs green +
  add a small-custom-icon case.
- Renumbering (#159 is an _enhancement_, but this is a correctness
  trap): a feature left keyed to a stale `marker_number` navigates to the
  wrong slide after any removal. Test the removal path explicitly, not
  just the happy matrix.
- `dispose()` symmetry: after `StoryMap.dispose()` the vector source must
  be empty, same as the overlay collection is. `tests/dispose.test.ts` is
  the place to assert it.
- Layer removal, clustered: with `Cluster` on, one `removeLayer` drops
  _every_ marker at once, so the accidental-removal case is sharper than in
  overlay mode. This is the case the repair exists for; assert it with the
  repair both on and off.
- The repair only covers the main map. A host that adds anything to the
  minimap's collection loses it on the next `_refreshMiniMapLayer()`
  regardless of the repair flag — say so in the docs rather than letting a
  host discover it.
- `#243` labels: `Text` `overflow`/`maxWidth` truncation,
  `declutter` hiding labels, stale style cache on
  `active(false)`/toggle; keep both `issue-243` specs + test
  deactivate-removes + long-headline nowrap.

## 5. Commits

1. `feat: vector marker renderer behind marker_renderer option`
   (Phase 1, default `overlay`).
2. `feat: marker clustering on the vector layer` (Phase 2; un-`fixme`
   the `#159` spec here).
3. `docs: register #159 fixed in KNOWN_ISSUES` (+ recount).
   The default flip to `vector` lands separately once the matrix is
   green.
