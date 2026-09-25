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

- Element + attach/detach: `src/map/openlayers/MapMarker.OpenLayers.ts:19-70`
  (`_createMarker`, `_createMarkerElement`, `_customIconAnchor`),
  `:72-102` (`_addTo`/`_removeFrom`, `positioning: "bottom-center"` for the
  default pin, `stopEvent: false`).
- Active/inactive + labels: `MapMarker.OpenLayers.ts:104-159`
  (class swaps, `zIndex 1000` when active, `.vco-marker-label` for
  `marker_labels`), styled in `src/scss/map/VCO.MapMarker.scss:36-98`.
- Map CRUD: `Map.OpenLayers.ts:904-915` (`_createMarker`), `:913-915`
  (`_addMarker`), `:935-939` (`_removeMarker`); shared contracts in
  `src/map/Map.ts:459-512` (`marker_number`, `markerAdded` event),
  `:687-697` (init + `active(true)` on current).
- Click chain: marker DOM click → `MapMarker.ts:129-131`
  (`markerclick{marker_number}`) → `Map.ts:584-588` (`_onMarkerClick` →
  full `goTo` path `:183-358`); slider/map fan-out in
  `src/storymap/StoryMap.ts:460-477,649-653,977-1001`.
- Motion: no marker animation library (`morpheus` never touches
  `src/map/**`); views move via `View.animate`
  (`Map.OpenLayers.ts:1353-1417`), lines via `requestAnimationFrame`
  (`:1182-1348`).
- Dateline: `_unwrapLongitudes` + overlay repositioning
  (`Map.OpenLayers.ts:922-933,943-980,1152-1199`).
- Minimap is marker-less by design (`#369`); labels are `#243`
  (`MapMarker.OpenLayers.ts:140-149`).

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
  for `EPSG:4326`, pre-unwrapped longitudes; `data.location` untouched).
- Style parity: default pin (pre-rendered canvas sprite reproducing the
  38×52 `\e600` pin + `vco-icon-<mediatype>` glyph variants), custom
  `Icon({src, anchor: [0.5, 1]})` via `_customIconAnchor`, image-icon
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
  marker e2e green (`506, 434, 405, 243, 349, 381, 176`).

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
