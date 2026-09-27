# Developing StoryMapJS

StoryMapJS is a viewer-only JavaScript library. It renders published StoryMap
JSON into a web page and ships as an **ES module only** — there is no
CommonJS/UMD bundle and no global (`KLStoryMap`/`VCO`) is defined:

```ts
import { StoryMap } from "@projektemacher/storymapjs";
import "@projektemacher/storymapjs/css/storymap.css";
```

## Stack

- **TypeScript** (strict mode, target ES2022, `strictNullChecks` included)
- **Vite** — all builds (library ESM + `.d.ts` via `unplugin-dts`, demo pages,
  site assets) plus dev server and preview
- **OpenLayers** (`ol`) — maps, markers, and IIIF Image API imagery
- **SASS** (`sass`) with themes in `src/scss/fonts/*`
- **Easing** — `d3-ease` (polynomial/exponential) and `bezier-easing`
  (cubic-bezier sampling), both in `src/animation/easings.ts`, which is the
  single source of the viewer's animation curves
- **Fonts** — bundled from npm (`@fontsource/*`), no runtime CDN font requests
- **Vitest** — unit tests (jsdom)
- **Playwright** — browser e2e tests over all example fixtures
- **ESLint + Stylelint** — linting

## Layout

```
index.html            dev/demo entry + the project landing page
demo.html             minimal single-example page
harness.html          example harness used by the e2e suite (?example=<name>)
public/               static assets copied verbatim to dist/
  examples/           storymap JSON fixtures (validated in CI)
  embed/              the embed page
  css/icons/          icon font binaries
src/
  main.ts             library entry (ESM exports, no global)
  storymap/           StoryMap class, data validation
  map/                Map base + OpenLayers implementation
  media/              media types (image, video, wikipedia, ...)
  slider/             StorySlider, Slide, navigation
  ui/ core/ dom/ animation/ language/ site/
  animation/         easing curves and the Web Animations API tween
  scss/               styles (entry: VCO.StoryMap.scss, theme per font.*.scss)
schema/
  storymap.schema.json  JSON Schema for storymap data
scripts/
  validate-storymap.mjs  CLI validator (also runs on load in the browser)
  validate-iiif.mjs      validates public/examples-iiif/ with the official IIIF validator
  convert-to-iiif.mjs    legacy JSON -> Presentation 3 manifest
  check-locales.mjs      reports which locales are missing which UI strings
  serve-root.mjs
e2e/                  Playwright specs
tests/                Vitest unit specs
tasks/
  build-thumbnails.mjs  screenshots of curated fixtures to public/thumbs/ (requires prior build)
plugins/
  sitegen.ts            vite plugin compiling font themes/docs/site chrome to public/
```

## Commands

```
npm install                # hydrate dependencies (node >= 22)
npm run dev                # vite dev server with HMR at :8000
npm run build              # vite: lib (js/storymap.js + storymap.d.ts + css), demo pages, fonts/docs
npm run preview            # serve the built dist/ (what e2e tests run against)
npm test                   # vitest unit tests
npm run test:e2e           # playwright over all examples + embed page (builds first)
npm run typecheck          # tsc --noEmit
npm run lint               # eslint + stylelint
npm run validate           # validate storymap JSON fixtures against the schema
npm run validate:iiif      # validate the IIIF manifest fixtures
npm run check:locales      # report translation gaps between en.json and the rest
npm run docs:api           # typedoc -> public/docs/api (deployed by pages.yml)
npm run format:check       # prettier --check .
```

`dist/` layout (consumers depend on these paths):

```
dist/js/storymap.js        ES module bundle (the only JS entry)
dist/js/storymap.d.ts      bundled type declarations
dist/css/storymap.css      widget styles + the OpenLayers stylesheet
dist/css/fonts/font.*.css  font theme stylesheets + binaries (files/)
dist/css/icons/            icon font binaries
dist/embed/index.html      embed page (?url=<published.json>)
```

## Data validation

StoryMap JSON is validated against `schema/storymap.schema.json`:

- in the browser on load — all errors are reported via `console.error`
- in CI / CLI — `npm run validate` (all `public/examples/*.json`)

## Exchange format

StoryMapJS reads two input formats, both accepted by `StoryMap._initData`
(object or URL):

- **Legacy JSON** — `{ "storymap": { "slides": [...] } }` (schema in
  `schema/storymap.schema.json`)
- **IIIF Presentation 3.0 manifests** — see
  [storymap-as-iiif-manifest.md](storymap-as-iiif-manifest.md);
  detection is automatic (`@context`/`type: "Manifest"`). Converted fixtures
  live in `public/examples-iiif/` (validated against the official IIIF
  validator via `npm run validate:iiif`; legacy fixtures via
  `npm run validate`).

## Styling and fonts

- SASS with `@use` only (no `@import`), no vendor prefixes, no deprecation
  warnings; stylelint runs with zero disabled rules.
- Font themes (`src/scss/fonts/font.*.scss`) declare `@font-face` rules via
  the `@fontsource-utils/scss` `faces()` mixin with `pkg:` imports; binaries
  are emitted to `dist/css/fonts/files/` by `plugins/sitegen.ts` (via `public/`).
- Animation runs on the Web Animations API (`src/animation/tween.ts`), which
  replaced the `morpheus` dependency. The sampled easing functions from
  `src/animation/easings.ts` are passed through as a CSS `linear()` easing so
  the curves are unchanged.
- `src/core/Load.ts` is a small typed loader (script, stylesheet, JSONP) built
  on `document.createElement`. It is not a copy of rgrove/lazyload.
- Locales are imported statically. The viewer resolves its labels while it is
  being constructed, so an async locale would silently render in English.

## OpenLayers notes

- `src/map/openlayers/Map.OpenLayers.ts` implements the Map contract
  (tile layers by `map_type`, markers as HTML overlays, path lines,
  overview fitting, mini map via `ol/control/OverviewMap`).
- **The raw `ol/Map` is public** (`storymap.map`), and the engine's
  internals are handed out through accessors instead of underscore
  fields: `getBaseLayer()`, `getOverlayLayers()` / `getOverlayLayer(i)`,
  `getMinimap()`, `getLine()` / `getLineActive()`, `getMarker(n)` /
  `getMarkers()`, `createMiniMap()`, `setExtraAttributions()`. Layer order
  in `map.getLayers()` is _not_ the `overlays[]` order (creation order is
  `[base, line, line_active, overlay0…]`, zIndex is a separate axis), so
  `getOverlayLayers()` is the only correct index → layer mapping.
  `ol` types (`OlMap`, `OlView`, `OlLayer`, …) are re-exported from
  `src/main.ts` so consumers can type the map without depending on `ol`.
  `storymap.map` is `OlMap | null`: it is assigned during construction, so
  an async setup has to check it.
- **Two lifecycle hooks**: `imageready` (`{ source, kind, layer }`) fires
  once a tile/IIIF/zoomify source is ready — `loaded` fires earlier, while
  the source may still be attaching — and `storymap.dispose()` tears
  everything down (timers, resize observer, window/document listeners, WAAPI
  animations, slider, OL map). Listener references are stored on the
  instance (`_on_resize`, `_on_keydown_global`, `_on_fullscreen`,
  `_on_hashchange`) precisely so they can be removed again; anything added
  with an inline arrow or a fresh `bind()` cannot be.
- `isImageSpace()` is the single source of truth for "IIIF shown as a
  picture of the world" (`map_type: "iiif"` + `map_as_image`), the view being
  `EPSG:4326` image space. Do not re-test `map_type` at a call site: that is
  what made `map_bbox` (georeferenced IIIF, a mercator map) behave like an
  image map.
- The viewer never mutates the caller's document: the computed marker zoom
  lives in `Map._marker_zooms` and is read back through `_markerZoom(i)`,
  not written to `marker.data.location.zoom` (`StoryMap.data` is the host's
  object graph).
- `tile_source_factory` may return any `ol/layer/Layer` (used as-is — this
  is what lets a third-party layer such as an Allmaps `WarpedMapLayer`
  render), a bare `Source` (wrapped in a `TileLayer`), or `null` to fall
  through to the default `map_type` handling. It is consulted for the base
  layer, overlays, the minimap and runtime `map_type` switches.
- `map_type` accepts keyword types (`osm`, `osm:<style>`, `stadia:*`,
  `ch-watercolor`, `iiif`, `zoomify`, `mapbox://styles/<user>/<style>`),
  absolute `https://` tile templates /
  style JSON URLs, and relative templates (`./tiles/{z}/{x}/{y}.png`) for
  same-origin tiles on subpaths/Electron. `setMapOption("map_type", ...)`
  rebuilds main + minimap layers together (see `_refreshMiniMapLayer`).
- `map_type: "iiif"` with `options.iiif.url` (an `info.json` URL) renders
  IIIF Image API imagery via `ol/source/IIIF`. `map_type: "zoomify"` remains
  as a legacy image-pyramid basemap.
- Markers use the `vco-icons` font (`src/scss/icons/Icons.scss`,
  `dist/css/icons/`); keep the `@font-face` URLs relative (`./icons/...`)
  so subpath/bundler/Electron consumers resolve them.
- Image maps (`map_as_image: true` with `iiif`) use an `EPSG:4326` view
  with image-pixel coordinates.

## Tests

The Playwright suite covers every fixture in `public/examples/` (rendering,
slide navigation, no uncaught exceptions), the IIIF path, the embed page, and
the known-issue regressions in `e2e/known-issues/` (a `test.fixme()` marks a
target behavior that is not implemented yet).

Three legacy zoomify fixtures (`courbet`, `jansteen`, `seurat`) are skipped in
the generic sweep because they need the real image-pyramid assets; zoomify
rendering itself is covered by
`e2e/known-issues/issue-zoomify-rendering.spec.ts`.
