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
harness.html          example harness used by the e2e suite
                      (?example= / ?manifest= / ?slideshow= / ?url= / ?options=)
harness-multi.html    two-viewer harness for the multiple-instances specs
public/               static assets copied to dist/ (plus generated files —
                      `css/fonts/`, `site.css`, `docs/*.html` — written there
                      by `plugins/sitegen.ts`, and `context.json`,
                      `navplace-properties.json`, `thumbs/`, `demo.json`,
                      `football.json`)
  examples/           storymap JSON fixtures (validated in CI)
  examples-iiif/      IIIF Presentation 3 fixtures (`convert:iiif` output plus
                      three hand-authored files: two georeferenced layers and
                      one annotation-driven tour)
  examples-slideshow/ slideshow tour fixtures (raw tours + a static image)
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
  convert-from-slideshow.mjs  slideshow tour (URL or file) -> storymap JSON
  check-locales.mjs      reports which locales are missing which UI strings
  docs-api.mjs           runs TypeDoc into public/docs/api (warns, never fails)
  serve-root.mjs         static repo-root server for the e2e matrix
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
npm run dev                # vite dev server with HMR at :8000; also generates the API docs once (~3.5s)
npm run build              # vite: lib (js/storymap.js + storymap.d.ts + css), demo pages, fonts/docs, API docs
npm run preview            # serve the built dist/ (what e2e tests run against)
npm run clean              # remove dist/
npm run dist               # clean + build + copy storymap.js to storymap-min.js
npm run thumbs             # screenshot curated fixtures to public/thumbs/ (requires a prior build)
npm test                   # vitest unit tests
npm run test:e2e           # playwright (Chromium) over all examples + embed page (builds first)
npm run test:e2e:all       # ... plus Firefox and WebKit (E2E_ALL_BROWSERS=1; non-blocking CI job)
npm run typecheck          # tsc --noEmit
npm run lint               # eslint + stylelint
npm run validate           # validate storymap JSON fixtures (public/examples/*.json) against the schema
npm run validate:iiif      # validate the IIIF manifest fixtures (two georeferenced layers report as not-covered, not failures)
npm run convert:iiif       # storymap JSON -> IIIF manifests (needs node >= 22.6: the CLI imports the TypeScript library source via type stripping; package engines say >= 22)
npm run convert:slideshow  # slideshow tour (URL or file) -> storymap JSON [--settings settings.json] [--out out.json]
npm run check:locales      # report translation gaps between en.json and the rest (exit 0)
npm run check:locales:strict    # fail on any gap beyond .expected-gaps.json
npm run check:locales:baseline  # rewrite .expected-gaps.json after adding strings
npm run docs:api           # typedoc -> public/docs/api (~3.5s); warns instead of failing
npm run format             # prettier --write .
npm run format:check       # prettier --check .
```

`dist/` layout (consumers depend on these paths; `vite build --mode pages`
uses `emptyOutDir: false` so the pages build preserves the lib outputs, and
copies `public/` over them):

```
dist/js/storymap.js        ES module bundle (the only JS entry)
dist/js/storymap.js.map    sourcemap for the bundle
dist/js/storymap.d.ts      bundled type declarations
dist/css/storymap.css      widget styles + the OpenLayers stylesheet
dist/css/fonts/font.*.css  font theme stylesheets + binaries (files/)
dist/css/icons/            icon font binaries
dist/index.html            project landing page
dist/demo.html             minimal single-example page
dist/harness.html          e2e harness (?example= / ?manifest= / ...)
dist/harness-multi.html    two-viewer e2e harness
dist/assets/               hashed demo/harness JS chunks
dist/site.css              landing-page styles (generated by sitegen)
dist/docs/*.html           rendered README + docs (generated by sitegen)
dist/docs/api/             TypeDoc API reference (generated into public/docs/api
                           by `npm run docs:api`, then copied by the build)
dist/examples*/            fixture copies served to the e2e suite
dist/thumbs/               fixture screenshots (via `npm run thumbs`)
dist/embed/index.html      embed page (?url=<published.json>)
```

## API reference

`npm run docs:api` runs TypeDoc over `src/main.ts` into `public/docs/api`, and
warns rather than fails (see `scripts/docs-api.mjs`, which does no warning
counting or classification — it just runs TypeDoc and warns on a start
failure or non-zero exit). Two `typedoc.json` options exist only to keep the
warning list honest:

- **`intentionallyNotExported`** names the engine and data types behind the
  documented API (`StoryMap`'s `declare` fields `_map`, `_menubar`,
  `_storyslider`, the marker class `getMarker()` returns and the
  `StoryMapListener` alias, plus the internal option/data bags such as
  `IconSpec`, `MapMarkerData`, `MediaData`, `TextData`, `SlideNavData` /
  `SlideNavOptions`, `SlideBackgroundChange`, `MessageOptions`, `DragData`
  and `LayersRow` — see `typedoc.json` for the exact list, which is the
  source of truth). They are implementation, not API; documenting them would
  be worse than naming them here.
- **`externalSymbolLinkMappings`** maps `@types/node`'s `__global.module`
  to the current page so that reference does not warn. It does not cover
  OpenLayers' `module:ol/...` links in `ol`'s own `.d.ts` comments — those
  cannot be resolved and are not ours to fix, so an `Ol*` warning naming
  `FrameState`/`State` is upstream; a new warning naming anything else is
  ours. (No warning baseline is recorded in the repo; `validation.invalidLink`
  stays on so our own comments keep being checked.)

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
  `npm run check:locales` reports the expected gaps against `en.json`;
  CI additionally gates `npm run check:locales:strict` (zero unexpected
  gaps vs `.expected-gaps.json` — update the baseline with
  `npm run check:locales:baseline` when adding strings).

## Multiple instances on one page

`new StoryMap(el, data)` is not a singleton: each viewer owns its own map,
slider, slides, media and DOM, and `dispose()` tears its half down without
touching a sibling's. `e2e/multiple-instances.spec.ts` and
`tests/multiple-instances.test.ts` cover it; `harness-multi.html` mounts two
side by side.

A few things are page-wide by nature, because a page has one of each:

- **UI strings.** The labels are a single module-level binding, read
  synchronously while a viewer is constructed. A viewer therefore _claims_ the
  locale it needs (`claimLanguage` in `src/language/Language.ts`) and a second
  viewer asking for a different one **throws** rather than silently repainting
  the first in the wrong language. The claim is refcounted and released in
  `dispose()`, so an SPA that tears down a viewer may change locale.

    A viewer only claims a locale it was actually _asked_ for — the constructor
    option or the document's own `language`. If neither mentions one it adopts
    the page's current locale (`currentLanguageCode()`), so a host that calls
    `setLanguage("de")` and then builds viewers without a `language` option gets
    German throughout. Note the consequence: a viewer with no `language` follows
    a previous viewer's `refreshLanguage()`. Pass an explicit `language` to every
    viewer on a page when they must not.

- **Consent decisions.** One `storymapjs-consent` record, so a visitor answers
  for a service once. Every viewer merges into it and re-reads it on each ask,
  so concurrent decisions cannot clobber each other.
- **The URL hash.** `#slide-N` is a single document fragment. Two viewers will
  fight over it: a navigation in one rewrites the hash, and the other
  applies it. This is not namespaced per instance, so a page with two viewers
  cannot give each an independent deep link.
- **`StoryMap.SCRIPT_PATH`.** A static, so assigning it affects every live
  viewer.
- **External scripts and stylesheets.** `loadJS` / `loadCSS` share one injected
  element per URL, so the YouTube and SoundCloud APIs and the font theme load
  once for the page. This is per bundle copy: two separately bundled copies
  each keep their own map and both inject.

Page-wide _inputs_ are arbitrated through `src/core/viewers.ts`, a small
registry of live viewers. With `keyboard: true` on more than one viewer, an
arrow keypress goes to the viewer that holds focus, or else the one the
visitor interacted with most recently.

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
  the source may still be attaching, which is why the event exists — and
  `e.target` is the viewer that fired it, not the map engine, and
  `storymap.dispose()` tears
  everything down (timers, resize observer, window/document listeners, WAAPI
  animations, slider, OL map). Listener references are stored on the
  instance (`_on_resize`, `_on_keydown_global`, `_on_fullscreen`,
  `_on_hashchange`) precisely so they can be removed again; anything added
  with an inline arrow or a fresh `bind()` cannot be.
- `addTo(container)` / `removeFrom(container)` come from the `DomMixed`
  mixin (`src/core/mixins.ts`), which is where the original `DomMixins`
  behavior now lives; the engine overrides them in
  `Map.OpenLayers.ts` only to re-target/re-measure `ol/Map`, since OpenLayers
  caches the viewport it measured at construction. `show()`/`hide()` on the
  map and marker are deliberately shadowed by deprecated no-ops.
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
  `dist/css/icons/`); the SCSS source uses the absolute public path
  (`/css/icons/...`) so `vite dev` serves the fonts directly, and
  `vite.config.ts` rewrites them to relative `./icons/...` in the built
  `dist/css/storymap.css` so subpath/bundler/Electron consumers resolve them.
- Image maps (`map_as_image: true` with `iiif`) use an `EPSG:4326` view
  with image-pixel coordinates.

## Tests

The Playwright suite covers every fixture in `public/examples/` (rendering,
slide navigation, no uncaught exceptions), the IIIF path (including the
georeferenced-layer fixtures), the slideshow tours, the embed page, and
the known-issue regressions in `e2e/known-issues/` (a `test.fixme()` marks a
target behavior that is not implemented yet). It runs against three servers
(see `playwright.config.ts`): the built preview on :8200, a static repo-root
server on :8300 for the `contrib/` examples, and the dev server on :8500.

Three legacy zoomify fixtures (`courbet`, `jansteen`, `seurat`) are skipped in
the generic sweep because they need the real image-pyramid assets; zoomify
rendering itself is covered by
`e2e/known-issues/issue-zoomify-rendering.spec.ts`. (`zoomify-clamp.json`
also uses `map_type: "zoomify"` but is not in the skip set, so it runs in
the sweep.)

### What the jsdom tests cannot cover

`tests/` runs under jsdom, which has no layout, no renderer and no network. That
leaves three classes of risk with unit coverage only, all of them the result of
replacing Leaflet with OpenLayers and of adding a real teardown path:

- **async source attachment** — `imageready` exists because a real IIIF source
  attaches after `loaded` fires. `e2e/imageready.spec.ts` holds the
  `info.json` response back to make the ordering observable, which a fake
  engine cannot do.
- **layout and the viewport** — `addTo()`/`removeFrom()` re-anchor the OL
  target and re-measure a viewport (`e2e/map-move.spec.ts`), and
  `isImageSpace()` decides whether coordinates are pixels or lat/lon
  (`e2e/image-space.spec.ts`).
- **the render loop and the network** — `e2e/dispose.spec.ts` proves no tile
  requests happen after teardown, and `e2e/consent-multi.spec.ts` proves one
  external script is injected per URL for the whole page.

`e2e/imagery-network.spec.ts` covers the other gap: the fixture sweep only
checks that a container exists and nothing threw, so a map rendering grey
instead of the real basemap used to pass everything. It asserts the expected
tile/imagery requests were made and the source reached `ready`, at the network
level — no screenshot baselines, which are renderer- and font-dependent and
would be noisy against third-party image services.

### Harness affordances

`harness.html` and `harness-multi.html` load every spec, so anything added to
them is opt-in:

- `?record=imageready,loaded` — collect those events into `window.__events`
  as `{ type, viewer, payload }`, with OpenLayers' object graphs reduced so the
  result survives `JSON.stringify`. The harness subscribes _after_ the
  constructor, so a spec cannot see an event fired during construction.
- `window.__tileSourceFactory` — a `tile_source_factory` is a function, so it
  cannot ride in the `?options={json}` param; a spec installs it with
  `page.addInitScript`.

### Browsers

`npm run test:e2e` runs Chromium only, which is what the main CI job does.
`npm run test:e2e:all` sets `E2E_ALL_BROWSERS=1` and adds Firefox and WebKit;
a separate, currently non-blocking CI job runs it.

The matrix earned its keep immediately. Three of its findings were false
positives rather than product bugs, and each is a trap worth knowing about:

- **`.ol-viewport canvas { all: unset }` makes Firefox and WebKit enumerate
  `zoom` as a declared CSSOM property.** `issue-452` used to walk
  `document.styleSheets` for a `zoom` declaration and failed on two engines for
  a declaration that exists nowhere. It now reads the stylesheet's source text.
- **Engines serialize `scrollbar-width` differently.** Chromium computes
  `auto`; Firefox computes `none` for the same declaration on an
  `overflow: hidden auto` box. Compare the declaration, not the computed value.
- **Playwright's `hasTouch` does not report touch uniformly.** It sets
  `ontouchstart`/`maxTouchPoints` in Chromium and Firefox but not WebKit, and
  `Browser.touch` reads exactly those — so the touch branch is legitimately
  absent on WebKit. It does set `pointer: coarse` everywhere, which is what
  `Browser.mobile` reads.
