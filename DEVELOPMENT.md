# Developing StoryMapJS

StoryMapJS is a viewer-only JavaScript library. It renders published StoryMap
JSON into a web page, consumed either as an ES module, a CommonJS module, or
a script tag exposing the global `KLStoryMap`.

## Stack

- **TypeScript** (strict mode, target ES2022)
- **Vite** — dev server, library build (ESM + UMD) and preview
- **OpenLayers** (`ol`) — maps, markers, and IIIF Image API imagery
- **SASS** (`sass`) with themes in `src/scss/fonts/*`
- **Fonts** — bundled from npm (`@fontsource/*`), no runtime CDN font requests
- **Vitest** — unit tests (jsdom)
- **Playwright** — browser e2e tests over all example fixtures
- **ESLint + Stylelint** — linting

## Layout

```
index.html            dev/demo entry (football example)
arya.html             demo page loading a remote published storymap
harness.html          example harness used by the e2e suite (?example=<name>)
public/               static assets copied verbatim to dist/
  examples/           storymap JSON fixtures (validated in CI)
  embed/              the embed page
  css/icons/          icon font binaries
src/
  main.ts             library entry (exports + KLStoryMap global)
  storymap/           StoryMap class, data validation
  map/                Map base + OpenLayers implementation
  media/              media types (image, video, wikipedia, ...)
  slider/             StorySlider, Slide, navigation
  ui/ core/ dom/ animation/ language/ library/
  scss/               styles (entry: VCO.StoryMap.scss, theme per font.*.scss)
schema/
  storymap.schema.json  JSON Schema for storymap data
scripts/
  validate-storymap.mjs  CLI validator (also runs on load in the browser)
e2e/                  Playwright specs
tests/                Vitest unit specs
tasks/
  build-fonts.mjs     compiles font themes to dist/css/fonts
```

## Commands

```
npm install                # hydrate dependencies (node >= 22)
npm run dev                # vite dev server with HMR at :8000
npm run build              # lib (js/storymap.js + storymap.es.js + css), demo pages, fonts
npm run preview            # serve the built dist/ (what e2e tests run against)
npm test                   # vitest unit tests
npm run test:e2e           # playwright over all examples + embed page (builds first)
npm run typecheck          # tsc --noEmit
npm run lint               # eslint + stylelint
npm run validate           # validate storymap JSON fixtures against the schema
```

`dist/` layout (consumers depend on these paths):

```
dist/js/storymap.js        UMD bundle defining the global KLStoryMap
dist/js/storymap.es.js     ES module bundle
dist/css/storymap.css      full stylesheet (all themes)
dist/css/fonts/font.*.css  font theme stylesheets + binaries (files/)
dist/css/icons/            icon font binaries
dist/embed/index.html      embed page (?url=<published.json>)
```

## Data validation

StoryMap JSON is validated against `schema/storymap.schema.json`:

- in the browser on load — all errors are reported via `console.error`
- in CI / CLI — `npm run validate` (all `public/examples/*.json`)

## OpenLayers notes

- `src/map/openlayers/Map.OpenLayers.ts` implements the Map contract
  (tile layers by `map_type`, markers as HTML overlays, path lines,
  overview fitting, mini map via `ol/control/OverviewMap`).
- `map_type: "iiif"` with `options.iiif.url` (an `info.json` URL) renders
  IIIF Image API imagery via `ol/source/IIIF`. `map_type: "zoomify"` has
  been removed.
- Image maps (`map_as_image: true` with `iiif`) use an `EPSG:4326` view
  with image-pixel coordinates.

## Tests

The Playwright suite covers every fixture in `public/examples/` (rendering,
slide navigation, no uncaught exceptions), the IIIF path, and the embed page
via the `KLStoryMap` global. Four legacy zoomify fixtures are skipped since
zoomify support was replaced by IIIF.
