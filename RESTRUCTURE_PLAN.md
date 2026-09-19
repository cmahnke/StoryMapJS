# StoryMapJS Restructure & Renovation Plan

Complete plan (and execution record) for restructuring the repository from a
Knight Lab editor application with a Flask backend into a **viewer-only
TypeScript library** built with **Vite**, styled with **SASS**, mapping with
**OpenLayers**, reading imagery through the **IIIF Image API**, and guarded by
a full quality-gate toolchain (ESLint, Stylelint, tsc, Vitest, Playwright,
JSON Schema validation, GitHub Actions).

Working branch: `refactor/vite-typescript` — one commit per phase, tree green
at every commit.

---

## 1. Goals

| #   | Goal                                                     | Decision / Result                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Remove the backend infrastructure                        | Delete the Flask editor (`storymap/`), Docker/LocalStack/Postgres/nginx, deploy tooling, CDN staging. The repo becomes a **viewer-only library** (renders published StoryMap JSON; consumed as ESM, CJS or the `KLStoryMap` script-tag global). |
| 2   | Vite as dev server **and** preview, replacing webpack    | `npm run dev` (HMR from source), `npm run build` (library + demo pages + font themes), `npm run preview` (serves built `dist/`).                                                                                                                |
| 3   | Convert to TypeScript                                    | All 47 source files converted, `strict: true`, `target: ES2022` (raised from the initial ES2020 decision), `lib: ["ES2022", "DOM", "DOM.Iterable"]`.                                                                                            |
| 4   | Tests: Playwright or Vitest                              | **Both, split by role:** Vitest (jsdom) for units; Playwright for a browser-level characterization suite covering every example fixture, the IIIF path and the embed page.                                                                      |
| 5   | Build the test suite **first**                           | The Playwright characterization suite was built against the _old_ webpack build before any migration, so the migration is validated against known-good behavior.                                                                                |
| 6   | Default Vite project structure                           | Root `index.html`, `public/`, `src/main.ts` entry, `src/` domain folders, `vite.config.ts` at root.                                                                                                                                             |
| 7   | Less → SASS                                              | All ~45 `.less` files → `.scss` in `src/scss/`, compiled by dart-sass (`sass` npm package).                                                                                                                                                     |
| 8   | Fonts from npm, embedded via SCSS                        | All Google Fonts / TypeNetwork runtime imports replaced by `@fontsource` / `@fontsource-variable` npm packages imported inside each theme; font binaries are emitted into `dist/css/fonts/files/` at build time. No runtime font CDN requests.  |
| 9   | Remove pre-2022 browser code                             | Dropped IE/old-engine fallbacks (`attachEvent`, `currentStyle`, rAF prefixes, `mozRequestAnimationFrame`, WebKit/Gecko polling, `pollGecko`/`pollWebKit`), legacy `Browser` detection, and all obsolete vendor prefixes in CSS.                 |
| 10  | Replace Leaflet with OpenLayers                          | `src/map/leaflet/*` deleted; `src/map/openlayers/*` implements the same `Map`/`MapMarker` contract with `ol` 10.x.                                                                                                                              |
| 11  | Replace Zoomify with the IIIF Image API (via OpenLayers) | `Leaflet.TileLayer.Zoomify` deleted; `map_type: "iiif"` renders via `ol/source/IIIF`. **Breaking change** for published storymaps using `zoomify`.                                                                                              |
| 12  | JSON Schema + validation                                 | `schema/storymap.schema.json`, a dependency-free runtime validator (`src/storymap/validate.ts`) used **on load** (reports _all_ errors to `console.error`), plus a CLI (`npm run validate`) wired into CI.                                      |
| 13  | ESLint + Stylelint                                       | Flat-config ESLint (typescript-eslint) + Stylelint (`stylelint-config-standard-scss`).                                                                                                                                                          |
| 14  | GitHub Actions                                           | `ci.yml` (lint → typecheck → validate → unit → build → e2e on every push/PR) and `package.yml` (on `v*` tag: build → zip `dist/` → GitHub Release — replaces the removed CDN staging).                                                          |
| 15  | Legacy artifacts                                         | `compiled/` (6 MB legacy build output) deleted entirely; its JSON fixtures live on as test data in `public/examples/`.                                                                                                                          |

---

## 2. Phase 0 — Setup

1. Create branch `refactor/vite-typescript` (review any pre-existing local
   `package.json` modifications first — they were pure dependency bumps and
   were folded into the baseline commit).
2. `.nvmrc` → `v22` (Node 24 is used locally; Vite 7+ requires 20.19+/22.12+).
3. `package.json`: `"engines": { "node": ">=22" }`.
   `"type": "module"` is **deferred** to the Vite phase — enabling it early
   breaks the CommonJS webpack configs the characterization phase still needs.
4. Fix the current build on modern Node: webpack-merge v6 dropped
   `merge.smart` and no longer supports default-import in CJS —
   `webpack.{prd,dev}.js` use `const { merge } = require('webpack-merge')`.

**Commit:** `chore: bump node to >=22 and fix webpack-merge v6 usage`

---

## 3. Phase 1 — Characterization test suite (before any migration)

The only existing JS test was a unit test for `EmbedUtil`; the Robot tests
drove the Flask editor (removed with the backend). A new browser-level
baseline was required first.

1. **Extract fixtures.** Copy all 22 `compiled/examples/*.json` storymap
   fixtures into `public/examples/` (test data — not the legacy build output).
   Four of them (`courbet`, `gameofthrones`, `jansteen`, `seurat`) use
   `map_type: "zoomify"`.
2. **Harness page.** `harness.html` loads the bundle and instantiates the
   storymap from `?example=<name>.json`, exposing `window.__smReady` /
   `window.__smErrors` for assertions.
3. **Playwright config.** `playwright.config.ts`, port `8200`,
   `webServer` boots the bundler's dev server, `workers: 1`, 60 s timeout.
4. **Spec** (`e2e/examples.spec.ts`): for _every_ fixture —
    - no uncaught `pageerror` exceptions,
    - no `window.__smErrors`,
    - `#storymap-embed.vco-storymap` exists (note: the class is on the same
      element as the id — descendant selector was the initial bug),
    - slide count > 0 (except `empty`, which legitimately renders zero slides),
    - slide navigation via `.vco-slidenav-next` produces no errors.
5. **Baseline bug fixes** required to get the old build green (all
   "works with updated dependencies" class bugs):
    - `Map.Leaflet._createBackgroundMap` — Leaflet 1.9 wraps tile elements in
      `{ el: … }` objects; the code still read `.src`/`.style` from the raw
      element (Leaflet 0.7 API) → uncaught `TypeError` whenever tiles loaded.
      Fixed with `tiles[x].el || tiles[x]`.
    - `Util.convertUnixTime` — implicit globals (`date`, `months`, …) throw in
      strict-mode ESM bundles → declared as locals.
    - Zero-slide storymaps (`empty.json`) crashed in `Map._initData`
      (`this._markers[0].active(true)` on an empty array), `StorySlider`
      (`this._slides[0].setActive(true)`) and `_onLoaded`
      (`this._slides[0].title`) → guarded with `length > 0` checks.

Result: 18 passed / 4 zoomify skipped — the behavior baseline.

**Commit:** `test: playwright characterization suite over all examples`

---

## 4. Phase 2 — Remove backend, staging and legacy artifacts

Deleted:

- **Flask editor/backend:** `storymap/` (api.py, storage.py, connection.py,
  tasks.py, googleauth.py, templates, static editor assets)
- **Container/local infra:** `Dockerfile`, `Dockerfile.huey`,
  `docker-compose.yml`, `localstack-init/`, `nginx/`, `localhost/`
- **Deploy/staging:** `deploy/`, `fabfile.py`, `tasks/stage.js`,
  `copybuild_to_cdn.sh`, `render.py`, `render_prd.sh`, `stagedev.py`,
  `DEPLOYMENT.md`
- **Python tooling:** `pyproject.toml`, `requirements*.txt`,
  `js-requirements.txt`, `scripts/` (S3/admin CLIs), `tests/` (pytest suite),
  `robot_tests/`
- **Legacy build relics:** `compiled/` (entirely), `config.json`,
  `config.codekit`, `codekit-config.json`, `libs/` (json2 polyfill),
  `website/`, root `static/`, `s3analysis/`, `tasks/compile_less.js`
- **Backend docs/env:** `dotenv.example`, `env.sh.example`,
  `DEBUGGING_INTERMITTENT_SAVES.md`, `TESTING_STORAGE_ERRORS.md`, `zoomify/`

Kept: end-user documentation (`AWS_Hosting/`, `GITHUB_HOSTING/`,
`BEST_PRACTICES/`, `contrib/`), `src/embed/index.html` (moved to
`public/embed/`), the JS unit test (relocated `tests/js/embed_util.test.mjs`
→ `tests/embed_util.test.mjs`).

`.gitignore` rewritten: dropped LocalStack/Postgres/huey entries, added
`test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`;
`package-lock.json` is now committed.

**Commit:** `chore: remove backend, staging and legacy build artifacts`

---

## 5. Phase 3 — Vite with a default project layout

### 5.1 Layout

```
├── index.html              # dev entry at root (football demo)
├── arya.html               # demo: remote published storymap
├── harness.html            # e2e harness (?example=<name>)
├── public/                 # copied verbatim into dist/
│   ├── examples/           # storymap JSON fixtures
│   ├── embed/index.html    # embed page (refs ../js/storymap.js)
│   ├── football.json       # demo data
│   └── css/icons/          # icon font binaries (absolute /css/icons/ urls)
├── src/
│   ├── main.ts             # library entry: exports + KLStoryMap/VCO globals
│   ├── core/ map/ media/ slider/ storymap/ ui/ dom/ animation/ language/ library/
│   ├── globals.d.ts        # window.VCO / KLStoryMap / trace declarations
│   └── less/ …             # (renamed src/scss in Phase 6)
├── e2e/  tests/  tasks/  scripts/  schema/
├── vite.config.ts  vite.demo.config.ts  playwright.config.ts  tsconfig.json
```

- `src/js/**` moved to `src/**`; `index.js` → `main.ts`.
- Old `src/template/*` became root-level pages (Vite MPA convention).

### 5.2 Vite configuration

**`vite.config.ts`** (library build):

- `build.lib`: entry `src/main.ts`, `name: "KLStoryMap"`,
  `formats: ["es", "umd"]`, `fileName` → `js/storymap.js` (UMD) /
  `js/storymap.es.js` (ESM), `cssFileName: "css/storymap"`.
- `assetFileNames`: function — CSS → `css/storymap.css`, everything else →
  `css/icons/[name][extname]` (preserves the historical dist layout).
- `assetsInlineLimit: 0`.

**`vite.demo.config.ts`** (second pass, `emptyOutDir: false`): builds
`index.html`, `arya.html`, `harness.html` so `vite preview` serves the built
library _and_ the demo pages together.

### 5.3 Source changes required by Vite/Rolldown

- `require('../less/VCO.StoryMap.less')` → `import './scss/VCO.StoryMap.scss'`
  (post-rename path).
- `Language.js`: the webpack dynamic `require(\`./locale/${code}.json\`)`replaced with`import.meta.glob('./locale/*.json', { eager: true })`.
- The bogus `import { LeafletModule } from "leaflet"` (a non-existent named
  export whose only effect was evaluating Leaflet's UMD to populate
  `window.L`) replaced with real `import * as L from "leaflet"` in all five
  Leaflet-dependent files.
- Dead `import Media from "../media/Media"` (no default export) removed from
  `Slide.ts` — Rolldown hard-errors on missing exports where webpack warned.
- Live `VCO.*` global references in `DomMixins.ts`, `Draggable.ts`,
  `MenuBar.ts` replaced with direct imports (`Animate`, `Ease`, `Dom`,
  `DomEvent`, `Browser`) — these were latent runtime errors under the webpack
  bundle.
- `Draggable.ts`: the `mousedrag`/`touchdrag` event maps (commented out since
  the Leaflet migration, referenced as `this.mousedrag`) restored as class
  fields; `classMixin(Events)` (no-op) fixed to `classMixin(Draggable, Events)`.
- `DomEvent.ts`: `Draggable.START` (non-existent) → `'mousedown'`, breaking
  the DomEvent↔Draggable import cycle.
- Icon binaries moved `src/less/icons/icons/` + `src/css/icons/` →
  `public/css/icons/`, referenced with absolute `/css/icons/…` URLs (Vite did
  not rewrite the nested-relative `url()`s through the LESS import chain;
  absolute public paths work identically in dev, build and for consumers).
- `src/embed/index.html` → `public/embed/index.html`.
- npm scripts: `dev`, `build` (two vite passes), `preview`, `clean`, `dist`.

**Commit:** `build: replace webpack with vite, adopt default vite project layout`

---

## 6. Phase 4 — TypeScript conversion (strict, ES2022 target)

### 6.1 tsconfig.json

```jsonc
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "types": ["vite/client"],
        "strict": true,
        "noImplicitAny": false, // documented stepping stone
        "strictNullChecks": false, // documented stepping stone
        "noEmit": true,
        "isolatedModules": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
    },
    "include": [
        "src",
        "tests",
        "e2e",
        "vite.config.ts",
        "vite.demo.config.ts",
        "playwright.config.ts",
    ],
}
```

All 47 `.js` files renamed `.ts`; `.js` import specifiers dropped;
`src/globals.d.ts` declares the transitional globals (`KLStoryMap`, `VCO`,
`trace`, `L_NO_TOUCH`) and the externally-loaded script globals (`YT`, `SC`,
`moment`).

### 6.2 Mechanical strategy

2841 initial errors, dominated by implicit-`any` cascades from
`{}`-literal-initialized legacy fields (`this._el = { container: {}, … }`).
A one-shot codemod injected `declare <prop>: any;` after each class's opening
brace from the tsc output (iterate to closure), followed by targeted fixes:

- `Ease.ts`: `KeySpline` made a real constructible helper exposed as
  `static KeySpline`; static easing wrappers (`Ease.easeOutStrong`,
  `Ease.easeInOutQuint`, `Ease.easeInSpline`) added — call sites used them
  statically while they were instance methods (they silently fell back to the
  native easing at runtime); typo'd `easings.*` references fixed to `this.*`.
- `Dom.ts`: `TRANSFORM`/`TRANSLATE_OPEN`/`TRANSLATE_CLOSE` were only assigned
  in a commented-out `extend` block — `setPosition` wrote `el.style[undefined]`.
  Rebuilt as class static initializers.
- `Util.ts`: `extend()` typed as `(dest, ...sources)`; `stamp()` fixed to
  Leaflet semantics (stamp-and-return-id) — DomEvent's listener dedup was
  calling the factory form and keying every listener identically.
- `Map.Leaflet.ts`: Leaflet lowercase factories are not constructible —
  `new L.map(...)` → `L.map(...)`, same for `marker`/`icon`/`layerGroup`/
  `imageOverlay`; `MapMarker._createImage` used an out-of-scope `url`
  (ReferenceError on custom image markers) → `this._custom_image_icon`;
  missing `removeListener` context param; arity errors resolved by making
  trailing params optional (legacy under-calls); `catch (e)` → `catch (e: any)`.
- Zero-slide/`empty` guards carried over from the baseline phase.

### 6.3 Vitest pulled forward

`node:test` cannot load `.ts` modules, so the Vitest migration happened in
this phase to keep the tree green: `vitest` + `jsdom` devDeps,
`vitest.config.ts` (jsdom environment, `environmentOptions.jsdom.url` set to
the storymap origin for relative-URL tests), `tests/embed_util.test.ts`
ported, `npm test` → `vitest run`. Playwright's `e2e/` excluded from Vitest.

**Commit:** `refactor: convert src to typescript (target ES2020)`
_(target raised to ES2022 in Phase 6b)_

---

## 7. Phase 5 — Zoomify → IIIF Image API

**Removed:** `Leaflet.TileLayer.Zoomify.ts`, the `ZoomifyTileLayer` export,
the `zoomify` option blocks (`StoryMap.ts`, `Map.ts`), the `map_type ==
"zoomify"` branches (`_createTileLayer`, `_markerOverview`, `_getZoomifyZoom`,
embed analytics event), the `zoomify/` tutorial.

**JSON API (new):**

```json
{
    "storymap": {
        "map_as_image": true,
        "map_type": "iiif",
        "iiif": { "url": "<info.json URL>", "attribution": "…" },
        "slides": [ … ]
    }
}
```

`width`/`height` are no longer required in the data — they come from
`info.json`. **Breaking change:** `map_type: "zoomify"` storymaps must be
migrated; a `console.error` explains the replacement at load time.

**Commit:** `feat: replace zoomify with iiif image api tile layer`

---

## 8. Phase 6 — Less → SASS + npm fonts

### 8.1 Conversion

- `git mv src/less src/scss`, all `.less` → `.scss`.
- Mechanical converter (`tasks/less2scss.mjs`, removed after use):
    - `@var:` → `$var:`, `@var` refs → `$var` (whitelist of declared names —
      at-rules untouched), `@{x}` → `#{$x}`,
    - `spin(a, b)` → `adjust-hue(a, b)` (LESS color function),
    - LESS property-merge (`transition+:`) → plain property,
    - `e(%("…"))` IE filter expressions dropped,
    - mixin definitions → `@mixin name($p: default, …)`; semicolon-separated
      LESS params → commas; namespaced `#gradient > .horizontal(…)` calls
      flattened to `@include gradient-horizontal(…)`,
    - statement-position mixin calls `.name(args);` → `@include name(args);`
      (only for known mixin names, guarding against selector collisions).
- `core/Mixins.scss` hand-rewritten: standardized properties only (no vendor
  prefixes), modern division, dead IE filters and the `#translucent` /
  `#gradient` namespaces removed.
- `@import` deprecation and slash-div warnings are accepted (documented
  legacy posture); no functional issues.

### 8.2 Fonts from npm

- Runtime `@import url(fonts.googleapis.com…)` and the TypeNetwork
  (`cloud.typenetwork.com`) import replaced by `@fontsource` /
  `@fontsource-variable` package imports inside each theme:
    - Static packages: abril-fatface, amatic-sc, average-sans, bitter,
      clicker-script, fauna-one, gentium-book-plus, lato, megrim,
      old-standard-tt, playfair-display-sc, pt-sans, pt-sans-narrow, pt-serif,
      rufina, ubuntu, unica-one.
    - Variable packages: bitter, dancing-script, eb-garamond, open-sans,
      playfair-display, raleway, roboto-slab, vollkorn (italic variants via
      `wght-italic.css`).
    - Multi-family URLs required _all_ matching packages (first-match-only bug
      in the first pass, fixed).
    - `font.knightlab` (commercial Turnip RE / Salvo Serif Cond / Apres RE)
      substituted with Bitter / Roboto Slab / Open Sans.
- `font.emoji` (a 2560-line PNG-sprite polyfill for pre-2017 Chrome) deleted
  along with its `loadCSS` call in `StoryMap.ts`.
- **Font theme build** (`tasks/build-fonts.mjs`): compiles each
  `font.*.scss` → `dist/css/fonts/font.*.css` via the `sass` JS API with a
  custom importer (resolves `@fontsource/…` through `require.resolve` since
  raw sass cannot consult package.json `main`), then rewrites the font-binary
  `url()`s and copies the `woff/woff2` files to `dist/css/fonts/files/`.
  (A Vite multi-entry CSS-only pass was attempted first but crashes in
  Vite 8's css-post plugin — hence the dedicated script.)
- `georgia-helvetica` theme remains system-font only (no package needed).

**Commit:** `style: convert less to sass, embed fonts from npm fontsource packages`

---

## 9. Phase 6b — ES2022 target + remove pre-2022 browser code

- `tsconfig.json`: `target`/`lib` raised to **ES2022**.
- `Browser.ts` rewritten: legacy vendor sniffing (`ie`, `phantomjs`,
  `android23`, `msPointer`, `opera`, `ie3d`/`opera3d` dead flags) removed;
  modern detection only (`maxTouchPoints`, `WebKitCSSMatrix`,
  `matchMedia` for retina).
- `Animate.ts`: `requestAnimationFrame` prefix fallbacks, `performance.now`
  vendor prefixes, `currentStyle`/`el.filters` IE branch and the
  `setTimeout` frame fallback removed — `frame` is now a bound
  `requestAnimationFrame`; `transform` property probing replaced with the
  standard name.
- `DomEvent.ts`: rewritten — `addEventListener`/`removeEventListener` only
  (no `attachEvent`, no `mousewheel`/`DOMMouseScroll`, no mouseenter/leave
  shims, no double-tap listener machinery, no IE `_getEvent` magic).
- `Load.ts`: `getEnv` UA sniffing, the sequential-load branch, IE
  `onreadystatechange`, and the WebKit/Gecko stylesheet polling
  (`pollGecko`/`pollWebKit`) removed — parallel load with
  `onload`/`onerror` only.
- CSS: script-stripped all `-webkit-/-moz-/-ms-/-o-/-khtml-` prefixes for
  standardized properties (border-radius, box-shadow, transform, transition,
  user-select, hyphens, appearance, animations, flex, …), converted old
  `-webkit-linear-gradient(top, …)` syntax to `linear-gradient(to top, …)`,
  kept genuinely webkit-only properties (`-webkit-tap-highlight-color`,
  `-webkit-font-smoothing`, `::-webkit-search-decoration`, …), deduped
  resulting duplicate declarations, and removed dead IE hacks
  (`*zoom`, star hacks — already required by the CSS minifier).

**Commit:** `chore: target ES2022 and remove pre-2022 browser code and vendor prefixes`

---

## 10. Phase 7 — E2E against the built bundle

- `playwright.config.ts` webServer switched to
  `npm run build && vite preview --port 8200 --strictPort` — every suite run
  validates the **built artifacts** (UMD + ESM + CSS), not just source.
- New `e2e/embed.spec.ts`: loads `dist/embed/index.html?url=…` and asserts
  slides render through the **`KLStoryMap` global** (the script-tag
  consumption path).
- `e2e/iiif.spec.ts`: asserts the IIIF source reaches `state === "ready"` and
  a non-empty canvas renders (OpenLayers renders tiles to canvas — the
  Leaflet-era `img.leaflet-tile` selector no longer applies).

**Commit:** `test: point e2e suite at vite preview build, add embed page umd spec`

---

## 11. Phase 8 — Leaflet → OpenLayers

### 11.1 Replacement files

```
src/map/leaflet/*                          →  deleted
src/map/tile/TileLayer.Stamen.ts           →  deleted (stamen→stadia/osm fallback kept)
src/map/openlayers/Map.OpenLayers.ts       →  new (was Map.Leaflet.ts)
src/map/openlayers/MapMarker.OpenLayers.ts →  new (was MapMarker.Leaflet.ts)
src/scss/map/openlayers/VCO.Map.OpenLayers.scss → new (was map/leaflet/*.scss)
```

`ol` 10.10.0 replaces `leaflet` + `@types/leaflet` (the only runtime
dependency of the library).

### 11.2 Design

- **Map wrapper** implements the existing `Map` base contract unchanged:
  `_createMap`, `_createTileLayer(map_type)`, `_createMarker`,
  `_addToLine`/`_replaceLines`, `_panTo`/`_zoomTo`/`_viewTo`,
  `_getMapLocation`/`_getMapZoom`/`_getMapCenter`/`_getMapCenterOffset`,
  `_getBoundsZoom`, `_getAllMarkersBounds`, `_markerOverview`,
  `_calculateMarkerZooms`, `_createMiniMap`, `_updateMapDisplay`/`_refreshMap`.
- **Tile layers by `map_type`**: `osm` → `ol/source/OSM`; `http(s)://…` →
  `ol/source/XYZ`; `mapbox:*` → XYZ with access token; `stadia:*` → XYZ
  (tiles.stadiamaps.com); `ch-watercolor` → XYZ; `iiif` → `ol/source/IIIF`.
- **Markers** are HTML `ol/Overlay`s so the existing `.vco-mapmarker` /
  `.vco-mapmarker-active` / `.vco-mapmarker-icon` styles and the icon font
  keep working unchanged; custom icons and location images render as `<img>`
  inside the overlay. Active state swaps classes + z-index; click fires
  `markerclick` → the `change` event chain is unchanged.
- **Path lines** are two `ol/layer/Vector` layers (inactive full path at
  `line_opacity`, active history line), built from `LineString` features in
  view coordinates.
- **Projections**: normal maps use `EPSG:3857` with `fromLonLat`/
  `toLonLat` conversion at the wrapper boundary; IIIF image maps
  (`map_as_image` + `iiif`) use an `EPSG:4326` view with **image-pixel**
  coordinates for markers/lines, matching the IIIF source's tile grid.
- **Async IIIF init**: `ol/source/IIIF` requires `size: [w, h]` up front, so
  the layer fetches `info.json` first, then sets the source; once the source
  is `ready`, the overview is (re)fitted (`view.fit(tileGrid extent)`).
- **Mini map**: `ol/control/OverviewMap` replaces the vendored
  Leaflet-MiniMap plugin (also removes its invalid-bounds crash).
- `ol/ol.css` is imported in `Map.OpenLayers.ts` so the built CSS carries the
  OpenLayers chrome; attribution is rendered by the wrapper.

**Commit:** `feat: replace leaflet with openlayers, iiif via ol source`

---

## 12. Phase 9 — JSON Schema + validation

- **`schema/storymap.schema.json`** (draft-07): requires `storymap.slides`;
  documents `map_type` values (with the zoomify→iiif note), `iiif.url`,
  line styling, slides (`type`, `location` with lat/lon/zoom/icon/iconSize/
  image, `media`, `text`, `background`), and accepts `null` string fields
  (real-world data is loose).
- **`src/storymap/validate.ts`**: dependency-free recursive validator
  (subset: `$ref`/`$defs`, `type` incl. unions, `enum`, `required`,
  `properties`, `items`, `min/max*`, `pattern`) — shared by the browser and
  the CLI. `validateStorymapAndReport(data, source)` logs **every** error
  (`path: message`) via `console.error` and never throws.
- **Runtime**: `StoryMap._initData` validates both object and URL forms
  before rendering; `map_type: "zoomify"` additionally reports its removal.
- **CLI**: `scripts/validate-storymap.mjs` (`npm run validate`) validates
  `public/examples/*.json` (or explicit paths), exits non-zero on failure.
- **Fixtures cleaned**: `president.json` (42 string lat/lon → numbers),
  4 instagram fixtures (`use_custom_markers: "true"` → `true`).
- **Unit tests** (`tests/validate.test.ts`): valid data, missing wrapper,
  missing slides, multi-error reporting, null-tolerance.

**Commit:** `feat: storymap json schema with runtime and cli validation`

---

## 13. Phase 10 — ESLint, Stylelint, GitHub Actions

- **ESLint** (flat config, `eslint.config.js`): `@eslint/js` recommended +
  `typescript-eslint` recommended. Relaxed for the legacy codebase:
  `no-explicit-any`, `no-this-alias`, `no-unused-expressions`, `eqeqeq`,
  `no-useless-escape`, `no-useless-assignment`, `no-cond-assign`,
  `prefer-const`, `no-var` off; kept: `no-unused-vars` (args ignored,
  `^_` prefix allowed). A codemod renamed genuinely unused locals to `_`
  prefixed / removed unused imports; a real `no-dupe-else-if` (duplicated
  rtl branch) was fixed.
- **Stylelint** (`stylelint.config.mjs`): extends
  `stylelint-config-standard-scss` with formatting rules disabled (the
  legacy style code is not reformatted in this pass).
- **npm scripts**: `lint` = `eslint . && stylelint 'src/scss/**/*.scss'`.
- **`.github/workflows/ci.yml`**: node 22 + `npm ci` → lint → typecheck →
  `validate` → `vitest` → `build` → Playwright (`chromium --with-deps`) → e2e.
- **`.github/workflows/package.yml`**: on `v*` tags — build, `zip dist/`,
  attach `storymapjs-<tag>.zip` to the GitHub Release
  (replaces the removed CDN staging; `permissions: contents: write`).

**Commit:** `ci: add eslint, stylelint and github actions for linting and packaging`

---

## 14. Phase 11 — Dependencies and docs

### 14.1 Dependency changes

| Removed                                                                      | Added                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| webpack, webpack-cli, webpack-dev-server, webpack-merge                      | vite                                                                     |
| css/style/file/json-loader, mini-css-extract, clean/copy/html/terser plugins | typescript (pinned `^5.9` — TS 7 conflicts with typescript-eslint peers) |
| less, less-loader                                                            | sass                                                                     |
| leaflet, @types/leaflet                                                      | ol                                                                       |
| jsdom (node:test)                                                            | vitest, jsdom (vitest env)                                               |
| trash, trash-cli, uglify-js, prompt, simple-git, adm-zip (staging)           | @playwright/test                                                         |
| npm-run-all, run-all, run-s, fs-extra, glob, jstrace                         | @eslint/js, eslint, typescript-eslint, globals                           |
| —                                                                            | stylelint, stylelint-config-standard(-scss), postcss-scss                |
| —                                                                            | @types/node                                                              |
| —                                                                            | 25 × @fontsource(-variable) packages                                     |

Runtime dependency: **`ol`** only. `package-lock.json` committed.

### 14.2 Final `dist/` layout (consumer-visible, unchanged paths)

```
dist/js/storymap.js        UMD bundle defining the global KLStoryMap
dist/js/storymap.es.js     ES module bundle
dist/css/storymap.css      full stylesheet
dist/css/fonts/font.*.css  font themes + binaries under dist/css/fonts/files/
dist/css/icons/            icon font binaries
dist/embed/index.html      embed page (?url=<published.json>)
```

### 14.3 Docs

- `DEVELOPMENT.md` rewritten (stack, layout, commands, dist layout,
  validation, OpenLayers notes, test strategy).
- `AGENTS.md` rewritten to match the new structure and quality gates.
- `README.md` dev/deployment sections updated (viewer-only, schema link,
  locale path fix).
- `CHANGELOG.md` entry documenting all breaking changes.

**Commit:** `chore: prune and update dependencies`, `docs: rewrite development docs …`

---

## 15. Verification gates

Run in sequence from a clean checkout (`rm -rf dist` first):

```
npm install            # node >= 22
npm run lint           # 0 errors (eslint + stylelint)
npm run typecheck      # 0 errors (tsc --noEmit, strict)
npm run validate       # 23/23 example fixtures valid
npm test               # 22/22 vitest unit tests
npm run build          # 2 vite passes + font theme compilation
npm run test:e2e       # 21 passed, 4 skipped (legacy zoomify fixtures)
```

The e2e suite runs against `vite preview` (fresh build each run) and covers:
every example fixture (rendering, slide counts, navigation, no uncaught
errors), the IIIF source/canvas path, and the embed page via the
`KLStoryMap` UMD global.

---

## 16. Breaking changes and known notes

1. **Viewer-only**: the editor (Flask + editor UI) is removed. Embedding
   published storymaps still works exactly as before (script tag →
   `KLStoryMap.StoryMap`, or ESM import).
2. **Zoomify removed** in favor of IIIF Image API. Storymaps with
   `map_type: "zoomify"` must be migrated to `"iiif"` with `options.iiif.url`;
   the four legacy zoomify fixtures are skipped in e2e with a documented
   reason.
3. **Fonts bundled**: themes ship with self-hosted `@fontsource` binaries —
   no more Google Fonts / TypeNetwork runtime requests. The `font.knightlab`
   theme uses open substitutes for its commercial faces.
4. **TypeScript pinned to 5.9.x**: TypeScript 7 (nightly-era) conflicts with
   typescript-eslint's peer range — revisit on upgrade.
5. **Pre-2022 browsers unsupported** by design (no vendor prefixes, no
   legacy engine fallbacks).
6. `"type": "module"` is set in `package.json`; all tooling configs are
   ESM-compatible.

---

## 17. Commit history

```
chore: bump node to >=22 and fix webpack-merge v6 usage
test: playwright characterization suite over all examples
chore: remove backend, staging and legacy build artifacts
build: replace webpack with vite, adopt default vite project layout
refactor: convert src to typescript (target ES2020)
feat: replace zoomify with iiif image api tile layer
style: convert less to sass, embed fonts from npm fontsource packages
chore: target ES2022 and remove pre-2022 browser code and vendor prefixes
test: point e2e suite at vite preview build, add embed page umd spec
feat: replace leaflet with openlayers, iiif via ol source
feat: storymap json schema with runtime and cli validation
ci: add eslint, stylelint and github actions for linting and packaging
chore: prune and update dependencies
docs: rewrite development docs for vite openlayers viewer structure
```
