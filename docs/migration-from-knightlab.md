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

## Changed options and map types

| Old                                           | New                                                                                                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map_type: "zoomify"` (+ `options.zoomify`)   | preferred: `map_type: "iiif"` with `options.iiif = { url, attribution }` (IIIF Image API 2/3); zoomify still works as a legacy image-pyramid basemap (see below) |
| `map_type: "stamen:toner"` etc.               | `"stamen:*"` types are deprecated and remapped: `stamen:watercolor` → `ch-watercolor`, others → `osm:standard`                                                   |
| Stadia Maps paid tiles via `map_access_token` | Recommended: free OpenStreetMap vector styles, e.g. `map_type: "osm:bright"` (OpenFreeMap), or any style JSON URL                                                |
| Bundled `map_access_token`                    | removed — pass `map_access_token` in the options if you use Mapbox/Stadia tiles                                                                                  |
| Bundled Flickr API key                        | removed — pass `api_key_flickr` in the options if you use `flickr.com/photos` API URLs                                                                           |
| `relative_date: true` (moment.js)             | removed — format dates in the story text                                                                                                                         |
| `font_css: "stock:<name>"` (or a path)        | unchanged, plus the font files ship via `@fontsource-utils/scss`; no separate font CSS link needed                                                               |

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
| `vine` media type (service shut down) | vine URLs fall back to the `website` iframe — use another media source for those slides                                                                                                                                      |
| Juxtapose `frame/?uid=` embed URLs    | the `juxtapose.knightlab.com/frame/?uid=` host is dead — use the published format `https://cdn.knightlab.com/libs/juxtapose/latest/embed/index.html?uid=...` (note: this keeps a Knight Lab CDN dependency for those slides) |
| Twitter `@nickname` rendering         | tweets from `x.com` URLs are now parsed too (fixes `@undefined` nicknames); no migration needed                                                                                                                              |

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
  Leaflet map. Port any direct Leaflet calls (e.g. `setView`, `flyTo`) to the
  OpenLayers API (`getView().animate(...)`, ...).
- Markers are DOM overlays (`.vco-mapmarker` / `.vco-mapmarker-active`) like
  before; the mini map is an OpenLayers `OverviewMap` control.
- New basemap options: vector styles via `map_type: "osm:<style>"` (OpenFreeMap)
  or a Mapbox style JSON URL.

## Data and tooling

- Storymap JSON is now validated against a JSON Schema
  (`schema/storymap.schema.json`); invalid documents are reported to the
  console at load time.
- IIIF Presentation 3 manifests are accepted directly as storymap sources.
- The StoryMap IIIF extension context changed to
  `https://christianmahnke.de/iiif/storymap` — manifests produced with the old
  `https://example.org/ns/storymap/v1` context need re-converting
  (`scripts/convert-to-iiif.mjs`).
- The editor, staging/backend infrastructure, AWS/GitHub hosting scripts and the
  Python authoring server are gone — this is a viewer-only library.

## Events (unchanged)

`change` (with `current_slide`), `loaded`, `title`, `dataloaded`,
`fontLoaded`, plus the listener map in the constructor — all work as before.
