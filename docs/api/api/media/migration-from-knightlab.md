# Migrating from the Knight Lab StoryMapJS

This guide helps you move from the original Knight Lab StoryMapJS viewer
(distributed as a webpack UMD bundle with a `KLStoryMap` global) to this
rewritten TypeScript/OpenLayers viewer (ESM only).

The markup (`vco-*` classes), storymap JSON format and the
`new StoryMap(elem, data, options, listeners)` constructor signature are
preserved, so most stories render the same. What changed is the delivery
(ESM instead of UMD), the map engine (Leaflet → OpenLayers, so some
rendering details differ) and a few removed legacy paths.

## Bundle and loading

| Knight Lab version (master)                                                                                                    | This version                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<script src="https://cdn.knightlab.com/libs/storymapjs/latest/js/storymap.js">` + `new KLStoryMap.StoryMap(...)` (UMD global) | `npm install` + ESM import: `import { StoryMap } from "storymapjs"`                                                                                       |
| `<link rel="stylesheet" href=".../css/storymap.css">` loaded manually                                                          | Import the CSS once (`import "storymapjs/css/storymap.css"` or the stylesheet from `dist/css/`); font themes load automatically via the `font_css` option |
| `main.js`/`main-min.js`, `compiled/`                                                                                           | single ESM bundle `dist/js/storymap.js`                                                                                                                   |

There is **no UMD/IIFE bundle and no `KLStoryMap`/`VCO` global** anymore. For
script-tag embedding use the ES module:

```html
<script type="module">
    import { StoryMap } from "https://example.com/storymap/js/storymap.js";
    const storymap = new StoryMap("storymap-embed", "https://example.com/my-storymap.json");
</script>
```

## Constructor

The signature is the same:

```ts
new StoryMap(elem, data, options?, listeners?)
```

- `elem` — container element or DOM id (unchanged).
- `data` — a storymap document (`{ storymap: ... }`), an **IIIF Presentation 3
  manifest**, or a **URL of the source file**, which is fetched and validated
  automatically (unchanged).
- `options` — see below for removed/changed options.
- `listeners` — event listeners keyed by name (unchanged); `storymap.on(...)`
  still works.

New capabilities:

- **Resize handling**: the viewer re-layouts automatically when its container
  resizes (disable with `trackResize: false`).
- **Fullscreen**: a menubar fullscreen toggle driven by the standard HTML5
  fullscreen API (`fullscreen: false` hides the button).
- **Raw OpenLayers options**: pass `map_options: { controls, interactions, view,
element, ... }` to configure the underlying OpenLayers map; `element`
  (HTMLElement or DOM id) replaces the auto-created map container.
- **Runtime options**: `storymap.setMapOption(name, value)` /
  `storymap.setMapOptions({...})` — e.g. switch `map_type` (main + minimap tile
  layers are rebuilt together) or line styling live. Relative tile templates
  such as `./tiles/{z}/{x}/{y}.png` are accepted, not just absolute `https://`
  URLs.
- **Left-area map layout**: `map_area: "left"` limits the map to the left,
  visible half in landscape with an opaque slide panel (no gradient over the
  map) — the view needs no offset, so fits, `map_bbox` constraints and the
  minimap align with the visible area directly. Default: `"full"` (the map
  spans the whole width with the slide panel fading in over it).
- **Map bounding box**: `map_bbox: [west, south, east, north]` (lon/lat; raw
  image pixels for image-space maps) constrains the view center to the box.
- **Scroll hint**: when a slide's content overflows, a bouncing downward
  arrow appears at the bottom center of the slide (all devices) — tapping it
  scrolls one step down; it hides after the first scroll. Touch scrollbars
  are rendered wider with a visible track for contrast.

## Changed options and map types

| Old                                           | New                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map_type: "zoomify"` (+ `options.zoomify`)   | preferred: `map_type: "iiif"` with `options.iiif = { url, attribution }` (IIIF Image API 2/3); zoomify still works as a legacy image-pyramid basemap (see below)                                                                                                                                                                                                                                                                            |
| `map_type: "stamen:toner"` etc.               | `"stamen:*"` types are deprecated and remapped: `stamen:watercolor` → `ch-watercolor`, others → `osm:standard`                                                                                                                                                                                                                                                                                                                              |
| Stadia Maps paid tiles via `map_access_token` | Recommended: free OpenStreetMap vector styles, e.g. `map_type: "osm:bright"` (OpenFreeMap), or any style JSON URL                                                                                                                                                                                                                                                                                                                           |
| Bundled `map_access_token`                    | removed — pass `map_access_token` in the options if you use Mapbox/Stadia tiles                                                                                                                                                                                                                                                                                                                                                             |
| Bundled Flickr API key                        | removed — pass `api_key_flickr` in the options if you use `flickr.com/photos` API URLs                                                                                                                                                                                                                                                                                                                                                      |
| `relative_date: true` (moment.js)             | removed — format dates in the story text                                                                                                                                                                                                                                                                                                                                                                                                    |
| `font_css: "stock:<name>"` (or a path)        | paths now resolve against the page URL (not the library location), plus the font files ship via `@fontsource-utils/scss`; no separate font CSS link needed                                                                                                                                                                                                                                                                                  |
| `font_css: false` (bundler consumers)         | `stock:<name>` resolves via `import.meta.url`, which only survives when this package is _not_ processed by a bundler — bundling inlines `dist/js/storymap.js` into a chunk and the theme URL breaks. Instead `import "@projektemacher/storymapjs/css/fonts/font.default.css"` (fingerprinted, `files/` rebased by the bundler) and pass `font_css: false` for no injected `<link>`. `"none"` works too for JSON. A failing theme only warns |

## A story with no map

`map_type: "none"` runs the storymap as text and media only. Nothing is
constructed: no `ol/Map`, no tile layer, no tile consent row, and the overview
control is hidden. The slider panel takes the full width, because there is no
map behind it to fade over.

This is the shape a photo essay or a transcript-led story wants, and it is the
one the map engine's unconditional construction used to make impossible. Note
that `map_type: ""` and an absent `map_type` both still mean OpenStreetMap, and
`map_type: null` now falls back to that default instead of throwing out of the
constructor — absence is not reinterpreted, so no existing document changes
meaning. Map-derived accessors (`getBaseLayer()`, `getMarkers()`, …) return
their neutral values, and the map setters are no-ops.

| Old                                        | New                                   |
| ------------------------------------------ | ------------------------------------- |
| a text-only story with a dummy `map_type`  | `map_type: "none"`                    |
| `map_type: null` (crashed the constructor) | normalised to the default, `""` → OSM |

## Removed globals and exports

| Removed                           | Replacement                                           |
| --------------------------------- | ----------------------------------------------------- |
| `KLStoryMap` / `VCO` global (UMD) | ESM import of the named exports                       |
| `window.trace`                    | `console.log`                                         |
| `getJSON(url, onload)`            | `fetch` / the StoryMap constructor's URL loading      |
| `StamenTileLayer` export          | `map_type: "osm:bright"` or another OpenFreeMap style |
| `ZoomifyTileLayer` export         | `map_type: "iiif"`                                    |
| Knight Lab usage tracking (gtag)  | none — nothing is sent                                |

## Removed media types and services

| Removed                               | Replacement                                                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vine` media type (service shut down) | vine URLs fall back to the `website` iframe — or paste the provider's `<iframe>` snippet into the slide text (sanitized, https-only); use another media source for those slides                                              |
| Juxtapose `frame/?uid=` embed URLs    | the `juxtapose.knightlab.com/frame/?uid=` host is dead — use the published format `https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html?uid=...` (note: this keeps a Knight Lab CDN dependency for those slides) |
| Twitter `@nickname` rendering         | tweets from `x.com` URLs are now parsed too (fixes `@undefined` nicknames); no migration needed                                                                                                                              |
| Ricoh360/theta360 embeds (#391)       | service no longer available (won't fix) — paste the provider's `<iframe>` snippet into the slide text if the service returns                                                                                                 |

Extra media per slide (#358, partial): a slide takes `media_extra` (a list of
further media items, rendered after the primary one) plus `media_layout`
(`stack`, the default, or `row` for two side-by-side items). An `<iframe>`
embed snippet pasted into the slide `text` field still renders sanitized
(scripts, event handlers and non-https sources dropped) — keep that as the
migration path for removed media types:

```html
<p>Extra footage:</p>
<iframe
    src="https://example.com/embed/123"
    width="560"
    height="315"
    frameborder="0"
    allowfullscreen
></iframe>
```

`map_type: "zoomify"` is supported again (legacy): the image pyramid renders
via the storymap data's `zoomify` options (`path`, `width`, `height`), using a
JS warning instead of the previous removal error. Cropped edge/remainder tiles
are padded onto a full tile canvas before rendering (the original renderer's
per-tile clamp), and the minimap fits the whole image on the pyramid ladder.
Using zoomify in a IIIF
Presentation manifest is ignored — legacy zoomify options only work with
storymap JSON sources.

## Map engine: Leaflet → OpenLayers

- `storymap.map` now exposes the **OpenLayers `Map`** instance instead of a
  Leaflet map. Port any direct Leaflet calls to the OpenLayers API (table
  below). It is `null` until the map has been built.
- Markers are DOM overlays (`.vco-mapmarker` / `.vco-mapmarker-active`) like
  before; the mini map is an OpenLayers `OverviewMap` control.
- New basemap options: vector styles via `map_type: "osm:<style>"` (OpenFreeMap)
  or a Mapbox style JSON URL.
- The `Ol*` aliases re-exported from `src/main.ts` (`OlMap`, `OlView`,
  `OlLayer`, `OlTileLayer`, `OlVectorLayer`, `OlSource`, `OlProjection`) let
  a consumer type the map and layers without depending on `ol` directly;
  anything beyond those (features, geometries, coordinates) still needs `ol`.

### Direct Leaflet calls → OpenLayers

Both maps are reachable from the same place (`storymap.map`), so only the
call syntax changes:

| Leaflet                                    | OpenLayers                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| `map.getCenter()`                          | `map.getView().getCenter()` — panel-shifted, see below                    |
| `map.getZoom()`                            | `map.getView().getZoom()`                                                 |
| `map.setView(c, z)` / `map.fitBounds(b)`   | `map.getView().fit(extent, { size: map.getSize() })`                      |
| `map.panTo(c)` / `map.flyTo(c, z)`         | `map.getView().animate({ center: c, duration: 300 })`                     |
| `map.setZoom(z)`                           | `map.getView().setZoom(z)` (or `.animate({ zoom: z })`)                   |
| `map.getSize()` / `map.getBounds()`        | `map.getSize()` / `map.getView().calculateExtent(map.getSize())`          |
| `map.on("moveend", fn)`                    | `map.on("moveend", fn)` (same event names; `movestart`/`move` also exist) |
| `L.tileLayer(url, opts).addTo(map)`        | `new TileLayer({ source: new XYZ({ url, attributions }) }).setMap(map)`   |
| `L.control.attribution` / `L.control.zoom` | OL `Attribution` / `Zoom` controls (pass them via `map_options.controls`) |
| `map.getPane("overlayPane")`               | `map.getOverlayContainer()` (markers are DOM siblings, not OL features)   |
| `map.invalidateSize()`                     | `map.updateSize()`                                                        |
| `map.remove()`                             | `map.setTarget(undefined); map.dispose();` (or `storymap.dispose()`)      |

The exposed center is deliberately panel-shifted: in landscape the view is
offset so the visible map sits left of the slide panel, which means
`getView().getCenter()` does **not** equal the current slide's location.
That is a display concern, not a data one — read the location from the
slide, not from the view. There is intentionally no offset-aware getter;
an earlier `_getMapCenter(offset)` parameter promised that correction and
never applied it, so it was removed rather than left to mislead.
| `map.options.crs` / `map.getPixelOrigin()` | `map.getView().getProjection()` / `map.getPixelFromCoordinate(coord)` |

Marker positions are still DOM elements, so `marker.getLatLng()` has no
equivalent — read the slide data (`storymap.data.stlides[n].location`) or use
`storymap._map.getMarker(n).latLon()`.

### Map and marker methods

The map/marker methods of the original viewer are still there with the same
names and behaviour (`storymap._map.<method>()`, `marker.<method>()`); the OL
engine implements them as thin wrappers over `storymap.map`. Two methods are
deprecated no-ops and one is gone:

| Original method                                                                                           | Status                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `updateDisplay`, `goTo`, `panTo`, `zoomTo`, `viewTo`                                                      | unchanged                                                                                                                                                                                                                                                         |
| `getBoundsZoom`, `markerOverview`, `calculateMarkerZooms`                                                 | unchanged (`getBoundsZoom()` now returns `number \| undefined` instead of a falsy value)                                                                                                                                                                          |
| `createMiniMap`, `createMarkers`, `createMarker`                                                          | unchanged                                                                                                                                                                                                                                                         |
| `setMapOffset`, `calculateMinMaxZoom`, `updateMinMaxZoom`, `initialMapLocation`                           | unchanged                                                                                                                                                                                                                                                         |
| `show()` / `hide()` (map and marker)                                                                      | **deprecated no-ops** — they were already empty in the original viewer. Style `.vco-mapmarker` or use `marker.active(false)`                                                                                                                                      |
| `map.addTo(container)` / `map.removeFrom(container)`                                                      | unchanged — inherited from the `DomMixed` mixin: append/remove the map container and fire `added`/`removed`. The engine override re-targets and re-measures the OpenLayers viewport, so a move into a differently sized parent works                              |
| `marker.createPopup()`                                                                                    | **deprecated no-op** — it never did anything upstream either (empty base body, commented-out Leaflet body), so the `map_popup` option that called it had no effect. Still accepted, still inert. Use `marker.openPopup()` / `storymap.openMarkerPopup(n)` instead |
| `marker.addTo()`, `marker.removeFrom()`, `marker.updateDisplay()`, `marker.active()`, `marker.location()` | unchanged                                                                                                                                                                                                                                                         |
| `marker.openPopup()` / `closePopup()` / `togglePopup()` / `isPopupEnabled()` / `popupOpen`                | **new** — programmatic control of the popup card (`marker: { popup: true }`); `openPopup()` returns false when disabled or not a real marker, `popupOpen` reports the state                                                                                       |
| `storymap.openMarkerPopup(n)` / `closeMarkerPopup(n?)` / `isPopupOpen(n)`                                 | **new** — open/close/query a stop's card from the viewer; `openMarkerPopup` navigates to `n` first and returns false (changing nothing) when disabled, out of range, disposed or mapless                                                                          |

Marker helpers that Leaflet provided on the marker object (`getLatLng`,
`setIcon`, `bindPopup`) are gone; use `marker.latLon()`, the
`.vco-mapmarker` element and your own DOM/CSS.

## Reaching the map, layers and markers

`storymap.map` is the raw `ol/Map` (typed as `OlMap | null` — it is set during
construction, so check it before first use in an async setup). Everything the
viewer keeps internally is available through accessors on `storymap` (and on
`storymap._map` for the engine methods):

| Accessor                                                     | Returns                                                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `getBaseLayer()`                                             | the base tile/vector layer                                                                                                        |
| `getOverlayLayers()` / `getOverlayLayer(i)`                  | overlay layers / one by index (`null` if out of range)                                                                            |
| `getOverlayCount()`                                          | number of overlays                                                                                                                |
| `setOverlayVisible(i, on)` / `setOverlayOpacity(i, opacity)` | show/hide and fade one overlay                                                                                                    |
| `getMinimap()`                                               | the inner overview `ol/Map` (`OlMap \| null`), not the `OverviewMap` control itself — there is no accessor for the control object |
| `getLine()` / `getLineActive()`                              | the full and the travelled route `VectorLayer`                                                                                    |
| `getMarker(n)` / `getMarkers()`                              | one marker or all of them, in slide order                                                                                         |
| `setExtraAttributions(html)`                                 | extra attribution HTML, listed after the source credits                                                                           |
| `isImageSpace()`                                             | whether the map is a IIIF image in image space (see below)                                                                        |

`tile_source_factory` may return a full `ol/layer/Layer` (not just a source)
anywhere a layer is built, so custom layers can carry their own opacity,
z-index and events. A custom layer without a source (Allmaps'
`WarpedMapLayer`) passes through untouched; source reads go through a
capability check, so it simply skips the tile-grid fits.

The viewer reserves three z-index ranges and custom layers should stay out
of them: **0** for the base tiles, **1..n** for the stacked `overlays[]`
entries in order, and **10/11** for the full and travelled route lines. A
custom layer with no explicit z-index lands wherever OpenLayers puts it,
which is above the lines — set one explicitly if the layer must sit inside
the stack.

### Layer switcher

`show_layers_control: true` adds a disclosure button to the menubar with
basemap radios and overlay checkboxes. Basemap candidates come from
`basemaps[]` (entry 0 is the initial basemap unless `map_type` says
otherwise; omit for an overlays-only control); overlay rows come from the
built `overlays[]` entries, so a malformed entry never gets a row and row
_i_ is always layer _i_. `label` may be a function for host i18n (re-invoked
on `refreshLabels()`), `locked: true` renders a row checked and disabled,
`control: false` hides a row without removing the overlay — but function
labels survive only in constructor options, because `mergeData()` lets
storymap JSON overwrite same-named option keys. A runtime basemap swap
rebuilds layers but never the view, so candidates needing another
projection are refused with a warning; switching fires `basemapchange` /
`overlaychange`, and the visitor's choice is never persisted.

### Image space vs. georeferenced

`map_type: "iiif"` is a mercator map by default. With `map_as_image: true` the
image _is_ the map: the view projection becomes `EPSG:4326`, the view is
fitted to the image extent and marker locations are pixel offsets into the
image rather than lat/lon. Ask `storymap.isImageSpace()` instead of testing
`map_type` — georeferenced IIIF (a manifest with `navPlace` regions) is an
ordinary mercator map, and `map_bbox` with a georeferenced layer is one too.

### Knowing when the imagery is there

Tile and image sources attach asynchronously, so `loaded` can fire before the
imagery exists. Listen for `imageready`, which fires once a source is ready and
carries `{ source, kind, layer }` (`kind` is `"iiif"`, `"zoomify"` or
`"tiles"`); it is re-fired on the `storymap` as well:

```js
storymap.on("imageready", ({ kind, source }) => {
    console.log("imagery ready", kind, source);
});
```

### Tearing a storymap down

Call `storymap.dispose()` when the embedding view goes away (SPA route change,
dialog close). It clears the timers and the resize observer, removes the
`window`/`document` listeners, cancels running slide animations, disposes the
slider and the OpenLayers map, and sets `storymap.map` to `null`. Calling it
twice is safe; the instance is unusable afterwards.

## Custom map providers

Any slippy-map tile URL works as `map_type` — pass the template verbatim
(including `{z}/{x}/{y}`), relative or absolute:

```js
new StoryMap("embed", data, {
    map_type: "https://tiles.example.org/base/{z}/{x}/{y}.png",
});
```

Mapbox style JSON URLs render as vector tile layers; OpenLayers
`Map`/`View` pass-through stays available via `options.map_options`
(`controls` replaces the defaults, `interactions` are added to the
viewer's own pan/zoom set, `view` merges over the computed default).

For source classes the templates cannot express (WMS, authenticated or
gridded sources), use the `tile_source_factory` option. It is consulted
for every base, overlay and minimap layer before the built-in
`map_type` handling — return any `ol/layer/Layer` (used as-is) or a bare
`Source` (which is wrapped in a `TileLayer`), or `null`/`undefined` to fall
through:

```js
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

new StoryMap("embed", data, {
    map_type: "wms:flood",
    tile_source_factory: (map_type, { options, createDefault }) =>
        map_type.startsWith("wms:")
            ? new TileLayer({
                  source: new TileWMS({
                      url: "https://geoserver.example.org/wms",
                      params: { LAYERS: map_type.slice(4) },
                      crossOrigin: "anonymous",
                  }),
              })
            : createDefault(),
});
```

The second factory argument also carries the resolved `options`
(`{ options, createDefault }`). A factory may return any `ol/layer/Layer`
(used as-is — including sourceless layers such as Allmaps'
`WarpedMapLayer`), a bare `Source` (wrapped in a `TileLayer`), or
`null`/`undefined` to fall through to the default `map_type` handling.

Custom sources must carry their own attributions (via the returned
source or the `attribution` option) — only the built-in `osm*` types
are credited automatically. `tile_source_factory` is constructor- and
runtime-only (functions cannot ride storymap JSON) and also applies to
`overlays[]` entries, whose `map_type` values go through the same
factory.

## Data and tooling

- Storymap JSON is now validated against a JSON Schema
  (`schema/storymap.schema.json`); invalid documents are reported to the
  console at load time.
- IIIF Presentation 3 manifests are accepted directly as storymap sources.
  The map settings map onto `storymap:` terms of a map configuration service
  (IIIF has no basemap or tile-layer vocabulary of its own), and the
  geospatial parts use the native extensions where they exist: `navPlace`
  Points for slide locations, a `navPlace` Polygon for the story extent
  (`map_bbox`), an IIIF Image API Selector for `location.region`, and the
  Georeference Extension for placed rasters. A georeferenced layer is
  manifest-only (the legacy format cannot express ground control points); see
  [docs/storymap-as-iiif-manifest.md](storymap-as-iiif-manifest.md#geo-referenced-layers).
- The editor, staging/backend infrastructure, AWS/GitHub hosting scripts and the
  Python authoring server are gone — this is a viewer-only library.
- **Slideshow tours** are a third input format: W3C `AnnotationCollection`
  documents (the format of slideshow-style guided image tours) load
  directly by object, file or URL, auto-detected after the IIIF branch
  (`slideshow: false` opts out). A pure translator converts them to
  storymap data — per-slide image regions, rotation, filter grading,
  spotlight masks, per-slide basemaps, narration with playback flags and
  player chrome — which renders only for slideshow tours (the internal
  `slideshow_source` marker; other documents are unaffected). Convert
  offline with `npm run convert:slideshow`; the full mapping is in
  [docs/slideshow.md](slideshow.md).

## Events (unchanged, plus new ones)

The canonical reference is [docs/events.md](events.md) — one table per
emitter, with payloads. What changed in migration terms: `change` gains
`current_id`, `loaded`, `title`, `dataloaded`, `fontLoaded`,
`transitionstart`/`transitionend`, `error` and the constructor listener map
all work as before; `markerAdded`/`markerRemoved` still fire on the map
object; `imageready`, `markerclick` and `popupopen`/`popupclose` are new
(see above).

Two additions for IIIF tours: `await storymap.loadAnnotations()` fetches a
manifest's externally referenced annotation pages and appends them as stops,
then fires `annotationsloaded` with `{ stops, searchService, failed }`. A
slide's stable identity is available as `storymap.getSlideId(index)`, which
is what the `#slide-N` hash and the `iiif-content` deep link resolve
through.
