# Geo-referenced IIIF layers + IIIF extension APIs

Goal: (1) use IIIF image endpoints carrying geo information as map layers
(affine placement on the geographic map, plus a path to full GCP warping),
and (2) expose all required OpenLayers APIs so viewer consumers can
implement IIIF Image API extensions themselves.

Acceptance: a `map_type: "iiif"` storymap with `iiif.bounds` renders the
image affinely placed on the mercator map with real lat/lon markers/lines;
a consumer can plug a `WarpedMapLayer` (Allmaps) through
`tile_source_factory`, read it back via accessors, and coordinate on an
image-ready event. New `e2e/iiif-geo.spec.ts` + `tests/iiif-geo.test.ts`
guard the behavior; `npm run typecheck`, `lint`, `validate`, `test`,
`build`, and the existing `e2e/iiif.spec.ts` / `e2e/manifest.spec.ts` /
overlay specs stay green.

## 0. Background and third-party check

- Current IIIF support is image-pixel space only: `case "iiif"` in
  `src/map/openlayers/Map.OpenLayers.ts:559-607` hardcodes
  `projection: "EPSG:4326"` with the default pixel extent; image mode uses
  an `EPSG:4326` view with pixels as "lat/lon" (`:85`,
  `MapMarker.OpenLayers.ts:75-79`). There is no georeferencing
  (`rg georeference` finds nothing); `navPlace` keeps only the first Point
  per canvas (`src/storymap/iiif.ts:173-184`).
- `ol/source/IIIF` (ol@10.10) subclasses `TileImage` and accepts
  `projection` + `extent`: passing a geographic extent makes OpenLayers
  reproject/affinely place the whole image on a mercator view. Full GCP
  warping is not possible with OpenLayers alone.
- Third-party lab: **Allmaps** ([allmaps.org](https://allmaps.org),
  `@allmaps/openlayers` on npm) — `WarpedMapLayer` (an `ol/Layer`
  subclass) loads IIIF Georeference Annotations and warps IIIF images via
  WebGL2 (`addGeoreferenceAnnotationByUrl`, `getBbox` → `view.fit`).
  **Decision: do not bundle it** (still `1.0.0-beta.x`, WebGL2-only,
  large render-pipeline bundle, against the viewer-only/dependency-light
  stance). Built-in affine placement covers the common case; extension
  hooks + a documented recipe cover Allmaps. Reversible if Allmaps
  stabilizes.
- Concrete gap for Allmaps today: `WarpedMapLayer` has no `getSource`,
  but the factory funnel (`Map.OpenLayers.ts:495-502`) passes through
  only objects with `getSource` and wraps everything else in
  `new TileLayer({source})` — a factory-returned warped layer would break.
- Public surface today: `storymap.map` exposes the raw OL `Map`
  (`src/storymap/StoryMap.ts:604`); `tile_source_factory`
  (`src/types.ts:77-80`) covers base/overlays/minimap/runtime switches;
  `map_options.view` merges over the default (`Map.OpenLayers.ts:101`).
  Missing: minimap/base-layer accessors, an image-ready event (IIIF
  attaches async at `:588-597`), `isPresentation3Manifest` /
  `manifestToStorymapData` and `TileSourceFactory` / `StorymapMapOptions`
  / `StorymapOverlayLayer` are not exported from `src/main.ts:13-51`.

## 1. `iiif.bounds`: affine geo-referenced IIIF as map layer (no new deps)

- Options + schema: `src/types.ts:213` `iiif: {url, attribution}` gains
  `bounds?: [west, south, east, north]` (lon/lat degrees) and
  `projection?: string` (advanced, default `"EPSG:4326"`; extent units
  must match). Same fields in `schema/storymap.schema.json:79-89` with
  descriptions (`npm run validate` guards fixtures).
- Engine (`src/map/openlayers/Map.OpenLayers.ts`):
    - `case "iiif"` (`:559-607`): when `iiif.bounds` is present, build
      `new IIIF({...parsed, projection: iiif.projection ?? "EPSG:4326",
extent: bounds, size, crossOrigin, attributions})`. Extract the
      option-building into a pure helper (e.g. `buildIIIFSourceOptions(info,
iiifOptions)`) so it is unit-testable without network.
    - `_createMap` (`:62`): `is_image_map = map_type === "iiif" &&
map_as_image && !iiif.bounds` — geo mode keeps the mercator view, so
      real lat/lon markers, route lines, lon/lat `map_bbox` and
      `calculate_zoom` work untouched.
    - Overview: geo mode falls into the default markers-fit branch
      (`:1629 else`) automatically. Small extra: on source-ready in geo
      mode with no markers, fit the view to the transformed bounds.
    - Minimap (`_createMiniMap :735-879`, `_fitMiniMapToImage :881-926`):
      geo variant — mercator overview view,
      `fit(transformExtent(bounds, "EPSG:4326", "EPSG:3857"))` after
      info.json resolves (same async pattern as today).
    - `applyOptions` (`:1754-1835`): add `"iiif"` to the layer-rebuild
      trigger list so `setMapOptions({iiif})` works at runtime. Consent
      gating for the info.json fetch + tiles follows the existing paths
      (verify during implementation).
- Manifest path: `src/storymap/iiif.ts` `readMapConfig` (`:111-122`) /
  `applyMapConfig` (`:309-386`) accept `storymap:iiifBounds` (and
  `storymap:iiifProjection`); check `public/context.json` for term
  registration; document in `docs/storymap-as-iiif-manifest.md`.
  (`navPlace` polygon support stays out of scope.)
- Tests: `tests/iiif-geo.test.ts` for the helper (bounds → geographic
  extent, no bounds → pixel extent, projection default/override);
  fixture `public/examples/iiif-geo.json` (reuse the wellcome endpoint
  with synthetic bounds); `e2e/iiif-geo.spec.ts` (view projection
  `EPSG:3857`, source extent ≈ bounds, markers at real lat/lon, no page
  errors).

## 2. Extension API surface (Layer passthrough, accessors, event, exports)

- **Layer passthrough** (unblocks Allmaps/WarpedMapLayer):
    - `TileSourceFactory` (`src/types.ts:77-80`): return type becomes
      `TileLayer | Source | Layer | null | undefined`.
    - Funnel (`:482-504`): pass through `instanceof Layer` (import from
      `ol/layer/Layer`) before the `getSource` check.
    - Widen `_createTileLayer` return, `_tile_layer` (`:48`),
      `_overlay_layers` (`:55`), `_tile_layer_mini` (`:51`) to `Layer`;
      guard `.getSource()` call sites (e.g. `:1582`) with
      `"getSource" in layer`. Overlay presentation
      (`setZIndex/Opacity/Visible`, `getClassName` hook at `:261-276`) all
      exist on base `Layer` — safe. Minimap keeps default tile handling
      (documented limitation for warped layers).
- **Accessors + event**: `getBaseLayer()` and
  `getMinimap(): OlMap | null` (OverviewMap control instance — verify
  `getOverviewMap()` in the OL types during implementation) on the
  engine, delegated on `StoryMap` with typedoc; raw `storymap.map`
  remains the general escape hatch. New `imageloaded` event
  (`{layer, source, kind: "iiif" | "zoomify"}`) fired when the image
  source is ready/attached, forwarded on `StoryMap` following the
  existing `markerAdded` pattern (`:936`) — the coordination point for
  extension code (also used by the geo no-marker fit).
- **Package exports** (`src/main.ts`): add `isPresentation3Manifest`
  and `manifestToStorymapData` from `./storymap/iiif`, plus types
  `TileSourceFactory`, `StorymapMapOptions`, `StorymapOverlayLayer`.
  Typedoc picks them up automatically.
- **Docs**: `docs/migration-from-knightlab.md` — "Geo-referenced IIIF"
  (`bounds` usage) + "IIIF extensions" recipe (`tile_source_factory`
  returning `WarpedMapLayer`, `getBbox` → `view.fit`, `imageloaded`
  coordination, minimap/consent notes with a code snippet);
  `docs/storymap-as-iiif-manifest.md` geo section.

## 3. Verification and effort

`npm run typecheck`, `lint`, `validate`, `npm test`, `npm run build`,
then new `e2e/iiif-geo.spec.ts` plus existing `e2e/iiif.spec.ts`,
`e2e/manifest.spec.ts` and the overlay specs. Effort: M (2–3 sessions).
Order: Layer passthrough → `iiif.bounds` engine work → accessors/event
→ exports → manifest term → docs → tests.
