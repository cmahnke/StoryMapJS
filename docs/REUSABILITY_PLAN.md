# StoryMapJS Reusability & Upstream Issue Audit Plan

Complete plan for the third wave on top of the restructure
(`RESTRUCTURE_PLAN.md`) and the renovation (`RENOVATION_PLAN.md`):

> **Execution record.** This describes the third wave as planned; it is kept
> for context, not as current state. The authoritative issue-by-issue
> results live in `KNOWN_ISSUES.md` (60 of 109 verified fixed), and the
> current test counts are in section 6 below.

1. **Reusability** — make the viewer embeddable as a library: resize handling,
   a source-file constructor, OpenLayers option passthrough, runtime map
   options, an ESM-only distribution, JSDoc on the public API and a migration
   guide from the original Knight Lab version.
2. **Upstream issue audit** — triage every open issue of the original
   NUKnightLab/StoryMapJS repository against this rewrite, verify each with a
   Playwright reproduction, and register the results in `KNOWN_ISSUES.md`.

Working branch: `refactor/vite-typescript` — one commit per phase, all gates
green at every commit.

---

## 1. Goals

| #   | Goal                           | Final outcome                                                                                                                                                                                                                                                             |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Resize handling                | `ResizeObserver` on the container (covers embeds resized by their layout) plus a `window.resize` fallback, debounced 200 ms → `updateDisplay()`; gated by the now-live `trackResize` option (default on).                                                                 |
| 2   | Source-file constructor        | `new StoryMap(elem \| id, data \| URL, options?, listeners?)` — a URL is fetched, HTTP-error checked, schema-validated and auto-detected (storymap JSON or IIIF Presentation 3 manifest); failures surface via console + an `error` event.                                |
| 3   | OpenLayers options passthrough | `options.map_options` forwarded to the OL `Map` constructor: `controls`/`interactions` replace the defaults, `view` merges over the computed default, everything else passes through; `map_options.element` (HTMLElement or DOM id) is adopted as the real map container. |
| 4   | Runtime map options            | `storymap.setMapOption(name, value)` / `setMapOptions({...})` — `map_type` rebuilds the tile layer, line options restyle instantly, the rest applies on the next navigation; documented which are runtime-changeable.                                                     |
| 5   | ESM-only distribution          | The UMD bundle and the `KLStoryMap` global are removed: one `dist/js/storymap.js` (ESM), an `exports` map in `package.json`, and `import.meta.url`-based `SCRIPT_PATH`/font-theme resolution.                                                                             |
| 6   | JSDoc public API               | Documented class/constructor/methods/exports (`StoryMap`, `goTo`, `updateDisplay`, `setMapOption(s)`, `loadCSS`, `MediaType`, `setLanguage`, `validateStorymap`); README/AGENTS.md aligned.                                                                               |
| 7   | Migration guide                | `docs/migration-from-knightlab.md` — CDN global → ESM, removed exports, map-type changes, Leaflet → OpenLayers, fonts via `font_css`.                                                                                                                                     |
| 8   | Upstream audit                 | All 109 open Knight Lab issues triaged; viewer-relevant ones reproduced in `e2e/known-issues/` and registered in `KNOWN_ISSUES.md`.                                                                                                                                       |

---

## 2. Phase 1 — Reusability (commit `4d829f7`)

### 2.1 Resize handling

1. `StoryMapBase._initResizeHandling()`:
    - `ResizeObserver` on the container when available (jsdom-safe guard),
      otherwise only the window listener.
    - Debounced (200 ms) `updateDisplay()` — which re-splits map/slider heights,
      repositions slides instantly and refreshes the menubar; the map wrapper
      calls `map.updateSize()`.
    - Skipped entirely when `options.trackResize` is false.
2. The embed page's own `window.onresize` shim removed — the library owns
   resizing now.

### 2.2 Constructor with element + source file + options

- The signature already took `elem: string | HTMLElement` and
  `data: string | object`; the URL path was hardened:
  `response.ok` check → descriptive `HTTP <status>` error, `.catch` → console
  error + `fire("error", {...})`.
- `start_at_slide` fix: `current_slide` is now assigned **after** the options
  merge (previously read from defaults, so the option never applied) — exposed
  by the issue-305 audit test.
- `index.html` switched from a manual `fetch` to the source-file form.

### 2.3 OpenLayers options passthrough

1. New `StorymapMapOptions` interface in `src/types.ts`
   (`element`, `view`, `controls`, `interactions`, arbitrary OL options).
2. `StorymapOptions.map_options` added to the defaults (`{}`).
3. `StoryMap._resolveMapElement()`: a passed `map_options.element` is adopted —
   gets the `vco-map` class and is moved into place after the menubar,
   replacing the auto-created placeholder div.
4. `Map.OpenLayers._createMap()`: user `controls`/`interactions` replace the
   empty defaults, `view` merges over the projection/zoom default, other
   options spread through; `element` is consumed by the StoryMap layer.

### 2.4 Runtime map options

- `StoryMap.setMapOption(name, value)` / `setMapOptions(partial)`:
  merges into `StoryMap.options` and the map wrapper's options, then calls
  `Map.OpenLayers.applyOptions(keys)`.
- `applyOptions` handles the immediate-effect set: `map_type` (tile-layer
  rebuild), `show_lines`/`line_*` (stroke restyle + visibility),
  `map_background_color`; everything else (offsets, animation timing,
  `calculate_zoom`) applies on the next navigation. The current view is
  re-fit after layer changes.
- JSDoc lists exactly which options are runtime-changeable.

## 3. Phase 2 — ESM-only distribution (commit `d028dd1`)

1. `vite.config.ts`: `lib.formats: ["es"]`, no `name`/global, single output
   `dist/js/storymap.js`; the lib entry normalized to `src/main.ts`.
2. `public/embed/index.html`: `<script type="module"> import { StoryMap }`
   instead of the UMD script tag + global; the resize shim removed.
3. `package.json`: `exports` map for the bundle, the CSS, the font themes and
   the schema.
4. `SCRIPT_PATH` + stock font paths derived from `import.meta.url` — works for
   the source module (`src/`), the bundle (`js/`) and arbitrary hosting
   subpaths; no script-tag sniffing.
5. `AGENTS.md` build description updated; the historical plan docs keep their
   original wording (records).

## 4. Phase 3 — Docs & migration guide (commit `a062b31`)

1. JSDoc: `StoryMapBase` (class + constructor + `goTo` + `updateDisplay` +
   `setMapOption(s)`), `loadCSS`, `setLanguage`, `MediaType`,
   `validateStorymap*`, `main.ts` package docs.
2. `index.html` demo = one-liner constructor with a listeners map.
3. `docs/migration-from-knightlab.md`:
    - bundle/loading table (CDN UMD + `KLStoryMap` → npm ESM / module script),
    - the unchanged constructor + events,
    - new capabilities (resize, `map_options`, runtime options),
    - removed/changed options and map types (`zoomify` → `iiif`,
      `stamen:*` → `ch-watercolor`/`osm:standard`, `osm:bright` recommended),
    - removed globals (`KLStoryMap`/`VCO`, `window.trace`, `getJSON`,
      `StamenTileLayer`, `ZoomifyTileLayer`, tracking),
    - Leaflet → OpenLayers notes for direct map access.

## 5. Phase 4 — Upstream issue audit (commit `93c328e`)

### 5.1 Data collection

- All open issues fetched via the unauthenticated GitHub REST API
  (`per_page=100`, 2 requests — list responses include bodies, avoiding the
  60 req/h limit); snapshot: 109 issues, all with bodies.

### 5.2 Triage rules

Excluded from testing (`n/a`): authoring tool/editor, hosting/infra, ZIP
import, upload endpoints, legacy media integrations (Twitter oEmbed, Vine,
Google Drive), IE-era browser bugs, device-specific reports that a headless
Chromium cannot reproduce, documentation/meta requests.

### 5.3 Reproduction fixtures

`public/examples/issue-*.json` (schema-validated) + a tiny local audio asset;
the harness (`harness.html`) gained an `&options=<json>` parameter for
option-level reproduction (e.g. `show_lines`, `start_at_slide`, `font_css`).

### 5.4 Test conventions (`e2e/known-issues/`)

| Verdict       | Test form                                                           |
| ------------- | ------------------------------------------------------------------- |
| fixed         | passing regression test (`test()`)                                  |
| still applies | `test.fail()` — documented expected failure, flips green when fixed |
| enhancement   | `test.fixme()` — documents the target behavior, skipped in the run  |
| n/a / other   | registry-only, no test                                              |

One spec file per issue id (`issue-<id>*.spec.ts`), shared helpers in
`helpers.ts`. The pure feature requests each got their own spec as they
landed (#472 keyboard, #380 autoplay, #247 progress indicator, #243
place-name labels); `enhancements.spec.ts` now holds only #412, which is the
one still not implemented.

### 5.5 Results

**Superseded — see `KNOWN_ISSUES.md` for the authoritative table.** The
counts below were the state when this wave was planned. The audit has since
been worked through, and every issue this section listed as "still applying"
is now fixed with a passing regression test:

| Verdict           | Planned | Now |
| ----------------- | ------- | --- |
| fixed             | 28      | 60  |
| still applies     | 6       | 0   |
| partially applies | 10      | 3   |
| not implemented   | 22      | 2   |
| cannot reproduce  | 8       | 8   |
| by design         | 1       | 1   |
| cosmetic          | 1       | 1   |
| n/a               | 33      | 32  |

Items that used to be listed here as still applying, and their regression
specs:

- **#480** YouTube Shorts URL id extraction — `e2e/known-issues/issue-480-youtube-shorts.spec.ts`
- **#451** webp missing from the image matcher — `e2e/known-issues/issue-451-webp.spec.ts`
- **#286** empty `<h3 class="vco-headline-date">` for every slide — `e2e/known-issues/issue-286-empty-date.spec.ts`
- **#381/#144** dateline-crossing marker fit — `e2e/known-issues/issue-381-dateline.spec.ts`
- **#465/#355** image-mode minimap never fitted — `e2e/known-issues/issue-418-iiif-overview-fit.spec.ts`

Audit-driven fixes that landed immediately (official options being ignored):

- `start_at_slide` read before the constructor options merge (#305) — the
  _data_-supplied value was a second instance of the same bug and was fixed
  later; see `e2e/known-issues/issue-305-start-at-slide.spec.ts`.
- `show_lines` ignored at line creation (#134).
- `use_custom_markers` missing from the option defaults (#405) — data-level
  values could never merge.

Note: the `test.fail()` convention this document describes for "still
applies" verdicts is no longer used — with the audit complete there are no
expected failures, only two `test.fixme()` entries for the enhancements that
are genuinely not implemented.

---

## 6. Verification

Refreshed as of the code-audit pass:

| Gate                      | Result                                                   |
| ------------------------- | -------------------------------------------------------- |
| `npm run lint`            | 0 errors (ESLint + Stylelint)                            |
| `npm run typecheck`       | 0 errors (strict, `strictNullChecks` included)           |
| `npm run format:check`    | clean                                                    |
| `npm test` (Vitest/jsdom) | 183 passed across 24 files                               |
| `npm run test:e2e`        | 162 passed / 30 skipped (fixmes + 3 zoomify-era skips)   |
| `npm run validate`        | 48/48 fixtures valid (incl. the `issue-*` ones)          |
| `npm run validate:iiif`   | 49/49 manifests pass the official IIIF validator         |
| `npm run check:locales`   | reports 28 of 29 locales missing 8-10 strings (expected) |
