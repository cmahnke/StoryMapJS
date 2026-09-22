# StoryMapJS Renovation Plan — Linting, JS/SCSS Modernization, Vendored-Lib Replacement, IIIF Support

Complete plan for the second renovation wave, executed on top of the
restructure (see `RESTRUCTURE_PLAN.md`: backend removal, webpack → Vite,
JavaScript → TypeScript, Leaflet → OpenLayers, Zoomify → IIIF Image API).

This wave tightens all quality gates to their strictest configuration,
completes the type system, modernizes the language and styling pipeline,
replaces vendored libraries with npm dependencies where possible, and adds
IIIF Presentation API 3.0 as an exchange format.

Working branch: `refactor/vite-typescript` — one commit per phase, all gates
green at every commit.

---

## 1. Goals

| #   | Goal                                    | Final outcome                                                                                                                                                                                                                                                    |
| --- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Formatting discipline                   | **Prettier** enforced repo-wide (`format`/`format:check` scripts; CI gate). 4-space indent, width 100, fixtures (`public/`) excluded.                                                                                                                            |
| 2   | Stylelint at full strictness            | Bare `stylelint-config-standard-scss` — **zero disabled rules**, zero `@import`, zero vendor prefixes, zero sass deprecation warnings. `postcss-scss` not used (sass toolchain only).                                                                            |
| 3   | ESLint at full strictness on TypeScript | **All rules enabled** including `@typescript-eslint/no-explicit-any` and `noImplicitAny` — zero `any` in the codebase, every function parameter/return annotated. Only `no-console` stays off (runtime validation reporting is a feature).                       |
| 4   | Modern JavaScript                       | Language level **ES2022** (`target`/`lib`); idiomatic use of `fetch`, `structuredClone`, `Date.now()`, `.at()`, `.includes()`, `.startsWith()`, `replaceAll()`, optional chaining; no pre-2022 fallbacks, no polyfills for natively supported APIs.              |
| 5   | SCSS modernization                      | `@use` only (star namespaces, hoisted), shared partial converted to a mixin, fonts via the official **`@fontsource-utils/scss`** `faces()` mixin with `pkg:` imports.                                                                                            |
| 6   | Vendored libraries replaced by npm deps | `morpheus` → npm package (typed via `morpheus.d.ts`); minEmoji sprite polyfill → deleted (unpublished on npm + a pre-2022 workaround); rgrove/lazyload → kept vendored (not published on npm; npm `lazyload` is an unrelated image-lazyloader), now fully typed. |
| 7   | Deprecated code removed                 | `window.trace`, `window.VCO` transitional globals, broken `moment.js` loading (`relative_date`), `zoomify` option remnants, Knight Lab tracking (gtag + a `ga()` call that referenced an undefined global).                                                      |
| 8   | No external UI assets                   | All fonts/icons/images ship from the repo (`public/css/icons/`, npm font packages). Remaining external URLs are runtime data APIs (tile servers, media endpoints) and attribution links — not assets.                                                            |
| 9   | Bug audit                               | High-confidence fixes only, each verified against the e2e suite; intentional legacy behavior left untouched and documented.                                                                                                                                      |
| 10  | IIIF Presentation 3.0 exchange format   | A written proposal (`docs/storymap-as-iiif-manifest.md`), all 23 example fixtures converted, **validated against the official IIIF validator**, and **StoryMap reads both formats** (legacy JSON + Presentation 3 manifests, auto-detected).                     |

---

## 2. Phase 1 — Prettier (format first, so later diffs are meaningful)

1. DevDep `prettier`; `.prettierrc.json`:
   `{ "tabWidth": 4, "useTabs": false, "semi": true, "singleQuote": false, "printWidth": 100, "endOfLine": "lf", "proseWrap": "preserve" }`.
2. `.prettierignore`: `dist/`, `node_modules/`, `public/` (fixtures are data,
   never reformatted), `test-results/`, `playwright-report/`, `blob-report/`,
   `package-lock.json`, `CHANGELOG`.
3. Scripts: `format` = `prettier --write .`, `format:check` = `prettier --check .`.
4. One repo-wide `prettier --write` run; eslint/stylelint/tsc/tests re-verified.

**Commit:** `chore: add prettier and format codebase`

---

## 3. Phase 2 — Stylelint: zero disabled rules

1. `stylelint.config.mjs` reduced to `{ extends: ["stylelint-config-standard-scss"] }`
   — no `customSyntax`, no rule overrides. (`postcss-scss` remains only as a
   transitive dependency of that config; the build/lint toolchain itself uses
   `sass` only.)
2. `stylelint --fix` clears the mechanical classes (colon/indent/comment
   spacing, color function notation, empty-line placement).
3. Hand-fixes for the rest:
    - **`scss/no-global-function-names`** — `lighten`/`darken` →
      `color.adjust($c, $lightness: ±n%)`, `adjust-hue` → `color.adjust($c, $hue: n)`,
      `floor` → `math.div`-era `math.floor`; unit-less lightness values get `%`.
    - **Division**: `($opacity / 100)` → `math.div($opacity, 100)` (never `calc()`
      — sass rejects variable substitution there for unit-less numbers).
    - **`block-no-empty`**: empty rule blocks (mostly leftovers of the earlier
      vendor-prefix removal) deleted with a small balanced-brace-aware script;
      brace balance verified per file; CSS output unaffected (empty rules emit
      nothing).
    - **Deprecated/unknown values**: `word-break: break-word` →
      `overflow-wrap: anywhere`; `min-device-pixel-ratio` → `resolution`;
      keyframe names → kebab-case (animation references updated).
    - **`declaration-block-no-shorthand-property-overrides`**: shorthand
      `background` split into longhand properties after a `background-color`.
    - Files that became entirely empty (legacy Flickr/YouTube partials that
      never had rules) deleted together with their imports.
4. Full verification: stylelint exit 0, vite builds, e2e unchanged.

**Commit:** `style: enable all stylelint rules and fix violations`

---

## 4. Phase 3 — ESLint: all rules on TypeScript, zero `any`

### 4.1 Rule state (final)

Enabled on `src/**/*.ts` (+ tests/e2e): everything from
`@eslint/js` recommended and `typescript-eslint` recommended, plus explicit
`eqeqeq: ["error", "smart"]`, `no-var`, `prefer-const`, `no-cond-assign`,
`no-useless-escape`, `no-useless-assignment`, `no-unused-expressions`,
`@typescript-eslint/no-this-alias`, `@typescript-eslint/no-explicit-any`,
`@typescript-eslint/no-unused-vars` (`args: "none"`, `^_` prefix ignored).
Only `no-console` stays off — runtime validation/deprecation reporting is a
feature of this library.

### 4.2 Mechanical fixes (codemod-assisted, position-based from eslint JSON)

- `no-useless-escape` — remove the flagged backslashes.
- `eqeqeq` — `==`/`!=` → `===`/`!==` at the flagged positions (smart mode
  keeps `== null`); spot-checked against git history: all comparisons are
  same-type, none coercion-sensitive.
- `prefer-const`/`no-var` — single declarators converted; multi-declarator
  chains split into separate statements (const-able ones become `const`,
  reassigned ones `let`); `.at()` only applied where the type really has it
  (HTMLCollection does not).

### 4.3 `no-this-alias` (27 sites)

`const self = this` + `function(){ … self … }` callbacks converted to arrow
functions (lexical `this`); alias removed. `.bind(this)` where a bound
reference is genuinely required.

### 4.4 `no-explicit-any` (≈300 sites) — full typing

- `src/types.ts` holds the shared domain types: `StorymapOptions`,
  `StorymapData`, `StorymapSlide`, `StorymapSlideText`,
  `StorymapSlideMedia`, `StorymapSlideLocation`, `StorymapSlideBackground`,
  `StorymapDataWrapper`, `MediaTypeMatch`, `AnimateOptions`,
  `AnimationHandle`, `LatLngLiteral`, `MapMarkerData`, `IconSpec`,
  `MediaState`, `LanguageStrings`.
- `declare "x": any` legacy field statements → precise structural types per
  class: element maps as `Record<string, HTMLElement>`/interfaces, options as
  `StorymapOptions`-derived interfaces (with index signatures where
  `mergeData` injects fields), data as the domain types above.
- Media consumers type YouTube/SoundCloud/Google-APIs via minimal local
  structural interfaces (`YTPlayer`, `SoundCloudWidget`, `YTGlobal`),
  narrowing the ambient globals at each usage site.
- Genuine dynamic interop uses `unknown` + narrowing (never `any`,
  no `@ts-ignore`, no eslint-disable).
- `noImplicitAny: true` enabled in `tsconfig.json` (strictNullChecks stays a
  documented stepping stone); every remaining implicit-any parameter annotated.

**Commits:** `style: enable strict eslint rules, …`, `feat: shared type definitions`,
`refactor: eliminate explicit any from the codebase`

---

## 5. Phase 4 — classMixin → TypeScript handbook mixins

Runtime prototype copying (`classMixin(X, Events)` /
`classMixin(X, Events, DomMixins)`) replaced with the official mixin pattern
(https://www.typescriptlang.org/docs/handbook/mixins.html):

1. `src/core/mixins.ts` defines `Constructor<T>` plus the mixin functions
   `Evented(Base)` (on/off/fire/hasEventListeners — semantics identical to the
   former `Events.ts`: listener store `{action, context: context || this}`,
   first-match removal, payload `{type, target, ...data}`) and `DomMixed(Base)`
   (addTo/removeFrom/show/hide/onLoaded/onAdd/onRemove/setPosition).
2. Class declarations become the composed form:
    - `class X extends Evented(XBase)` — Swipable, Draggable, StorySlider,
      MapMarker, Media (+ `Text` as a subclass of Media), StoryMap
    - `class X extends DomMixed(Evented(XBase))` — Message, MenuBar, SlideNav,
      Slide, Map
    - plain inheritance flows events through: `OpenLayers extends Map`,
      `OpenLayersMapMarker extends MapMarker`
    - each final class forwards its constructor:
      `constructor(...args: ConstructorParameters<typeof XBase>) { super(...args); }`
3. `classMixin` and the old `Events.ts`/`DomMixins.ts` deleted (zero remaining
   references); local `declare fire: …`/`Evented` interface shims cleaned up.

**Commit:** `refactor: eliminate this-aliasing and fix all mechanical eslint violations`,
`refactor: replace runtime classMixin with typescript handbook mixins`

---

## 6. Phase 5 — SCSS modernization (`@use` only, fontsource-utils)

1. **No `@import` remains** — every import converted to
   `@use "<module>" as *;` (star namespace = unqualified access, minimal
   churn), all `@use` lines hoisted to file top; entry files
   (`VCO.StoryMap.scss`, `VCO.StoryMap.Dark.scss`) keep the original component
   order so the compiled stylesheet is byte-identical to the pre-conversion
   baseline (verified).
2. **`_font.base.scss` → mixin**: the old partial relied on `@import`'s
   parent-scope variable sharing. It now exposes
   `@mixin font-base($theme: ())` — `$theme` is a map of the 18 font variables
   (`font-main`, `font-secondary`, `font-navigation`, `font-marker`,
   `font-headline-date`, `base-font-size`, `base-font-weight`, `font-blockquote*`,
   `font-size-headings`, `font-headings-*`, `font-size-headline-title`,
   `font-navigation-text-transform`, `font-marker-text-transform`) resolved
   with `map.get` + defaults from Variables; each of the 20 themes ends with
   `@use "font.base" as base;` + `@include base.font-base((…));` passing its
   own values.
3. **Fonts via `@fontsource-utils/scss`**: theme files start with
    ```scss
    @use "pkg:@fontsource-utils/scss" as fontsource;
    @use "pkg:@fontsource-variable/<family>/scss" as <family>;
    @include fontsource.faces(
        $metadata: <family>.$metadata,
        $weights: all,
        $styles: all,
        $subsets: (
            latin,
            latin-ext,
        ),
        $formats: woff2
    );
    ```
    `tasks/build-fonts.mjs` gained dart-sass `NodePackageImporter` for `pkg:`
    resolution, emits `dist/css/fonts/font.*.css` + binaries under
    `dist/css/fonts/files/` (woff2-only, latin subsets → ~4.8 MB).
4. **Zero sass deprecation warnings** (no `@import` warnings, no slash-div, no
   legacy color functions, no unit-less lightness args).
5. `postcss-scss` removed from our devDependencies (it only survives as a
   transitive dep of the stylelint config).

**Commits:** `style: complete sass use migration, zero deprecation warnings`,
`style: fix sass math divisions`, `chore: font pipeline via fontsource-utils/scss`

---

## 7. Phase 6 — JavaScript 2022 + deprecated code removal

1. **`getJSON` (transitional `window.VCO` API helper)**: `XMLHttpRequest` →
   `fetch` with the same callback signature and error behavior.
2. `structuredClone()` replaces `JSON.parse(JSON.stringify(...))` (locale
   cloning).
3. `Date.now()` replaces `new Date().getTime()` (momentum timing).
4. `.substr()` (deprecated) → `.slice()` (Mapbox style parsing, Flickr media
   id); random char via `charAt(rand(chars.length))`.
5. `.includes()` replaces `indexOf(x) !== -1`; `.startsWith()` replaces
   `indexOf(x) === 0`; `.at(-1)` replaces last-index access on real arrays
   (not on HTMLCollection).
6. `replaceAll()` for literal global replaces (schema `$ref` handling).
7. **Deprecated code removed**:
    - `window.trace` and `window.VCO` transitional globals (`main.ts` now only
      exports the ES API; the `KLStoryMap` UMD global remains the script-tag
      surface).
    - `relative_date`/`moment.js` branch — it fetched a file that no longer
      exists (`dist/library/moment.js`), so the feature was dead; removed.
    - `zoomify` option-block remnants in `StorymapOptions`/defaults.
    - Knight Lab tracking in the embed page (gtag script + a `ga()` call that
      referenced an undefined global — an actual bug on IIIF embeds).
8. **Vendor-specific CSS manipulation removed from `src/dom/Dom.ts`** — the
   `-webkit-perspective`/`-webkit-backface-visibility` writes, transform
   probing statics and `setPosition`/`getTranslateString` (zero callers) —
   the class keeps `get`/`create`/`createText`/`getPosition`.
9. **Browser detection pruned** (`src/core/Browser.ts`): only what is still
   used survives — `touch` (`ontouchstart`/`maxTouchPoints`), `mobile`
   (redefined as the modern `matchMedia("(pointer: coarse)")` check),
   `orientation()` (viewport aspect). Removed: engine sniffing (`webkit`,
   `chrome`, `firefox`, `android`, `ie`, `webkit3d`, `gecko3d`, `any3d`,
   `retina`, …) and the Firefox-only media sizing workarounds (obsolete).
10. **External asset audit**: fonts/icons/images in TS + SCSS all resolve to
    repo-bundled assets; the only remaining external URLs are runtime data
    endpoints (tile servers, media/APIs) and attribution links.

**Commits:** `refactor: use function declarations …, drop vendored minEmoji`,
`chore: remove deprecated window globals …`,
`refactor: drop vendor-specific css manipulation and obsolete browser detection`

---

## 8. Phase 7 — Bug audit (fix only high-confidence bugs)

Each fix verified against the fixture-level e2e suite:

1. **Null-offset crash** — `map_center_offset.top` read when the offset is
   null (default); condition parenthesized correctly in
   `Map.OpenLayers._calculateMarkerZooms`/`_markerOverview`; `setMapOffset`
   lazily creates the object.
2. **Deferred `updateDisplay` crash on zero-slide storymaps** —
   `_refreshMap` now guards `_markers[current_marker]` (proven by a probe on
   the `empty` fixture).
3. **IIIF source race** — `getSource()` is null until the async `info.json`
   fetch resolves; guarded in both the tilesload-end wiring and the overview
   fit; the `once("change")` listener replaced with a direct ready-check
   fallback (ol sources default to `ready`).
4. **Unique-id regression** — `chars.at(rand(32))` on a 26-char alphabet
   produced `undefined` inside ids; fixed to `charAt(rand(chars.length))`.
5. **Swipe direction check** — `Math.abs(y) > Math.abs(y)` (always false) →
   the intended x comparison.
6. **`convertUnixTime` null dereference** — unparseable timestamps now return
   the input instead of throwing.
7. `Math.min(x)` no-op momentum calls rewritten as direct assignments
   (behavior-identical), clamping left to the existing explicit clamps.

Documented as intentional (unchanged): legacy momentum bounds/swipe
thresholds, `goTo` firing `change` immediately instead of post-animation,
`skinny_size` default quirk.

**Commit:** `fix: null-safety in offset handling, IIIF source races, unique id generation and swipe direction check`

---

## 9. Phase 8 — IIIF Presentation API 3.0 exchange format

### 9.1 Proposal (`docs/storymap-as-iiif-manifest.md`)

- **Manifest** ↔ storymap: `@context` array
  `[presentation-3 context, navPlace context, storymap: context]`, `id`,
  `type: "Manifest"`, `label` (kept as `storymap:title` on conversion),
  `requiredStatement` (attribution), `behavior: ["paged"]`.
- **Manifest-level settings** travel in an extension `service` entry
  (`type: "Service"`, mapconfig profile) — the Presentation 3 Manifest class
  has `additionalProperties: false`, so plain extension properties are only
  valid on Canvas level. Terms: `storymap:mapType`, `storymap:mapAsImage`,
  `storymap:mapAccessToken`, `storymap:mapBackgroundColor`,
  `storymap:mapCenterOffset`, `storymap:mapSubdomains`, `storymap:fontCss`,
  `storymap:callToAction(Text)`, `storymap:startAtSlide`,
  `storymap:calculateZoom`, `storymap:lessBounce`, `storymap:line*`,
  `storymap:showLines`, `storymap:showHistoryLine`, `storymap:useCustomMarkers`,
  `storymap:iiifUrl`, `storymap:originalZoomify`.
- **Canvas** ↔ slide (order = slide order; nominal 1080×1080 for non-image
  canvases, real dimensions for IIIF image canvases). Canvas-level
  `storymap:` terms: `type` ("overview"), `group`, `date`, `background`
  {url, color, opacity}, `mediaCaption`, `mediaCredit`.
- **Locations** via the official **navPlace** extension: canvas-level
  `navPlace` FeatureCollection; Point coordinates `[lon, lat]`; marker data
  (zoom/line/icon/iconSize/image/useCustomMarkers) as Feature properties.
- **Slide media** → painting Annotation (`Image`/`Video`/`Sound`/`TextualBody`
  html) with `target` = canvas; IIIF image-map slides paint an Image body
  referencing the ImageService3.
- Language maps (`{"none": ["…"]}`) used for all label/summary values.

### 9.2 Conversion + validation

- `scripts/convert-to-iiif.mjs`: converts all 23 `public/examples/*.json` →
  `public/examples-iiif/<name>.json` (deterministic absolute URIs;
  zoomify fixtures map to `mapType: "iiif"` with the IIIF reference image and
  keep the original definition in `storymap:originalZoomify`).
- `scripts/validate-iiif.mjs` (`npm run validate:iiif`): POSTs each manifest
  to the **official** validator
  (`https://presentation-validator.iiif.io/validate?version=3.0&format=json`)
  and fails the run on any `okay: 0`. **23/23 pass**; CI includes the
  `IIIF/presentation-validator@main` action as the canonical gate.

### 9.3 Runtime reader (both formats work)

- `src/storymap/iiif.ts`: `isPresentation3Manifest()` (context URI or
  `type === "Manifest"`) + `manifestToStorymapData()` — a defensive converter
  (labels/summaries via `flattenLanguageMap()`, navPlace → locations,
  painting annotations → media, mapconfig service → options; malformed input
  never throws, degrades to `{ slides: [] }`).
- `StoryMap._initData` auto-detects the format for both the object and the
  URL form and normalizes manifests into the legacy pipeline — the legacy
  format path is untouched.
- Tests: 10 Vitest conversion/discrimination/degradation specs; e2e
  `manifest.spec.ts` loads `harness.html?manifest=katrina` through the real
  viewer (8 slides, navigation, no errors) — while the original 21 e2e specs
  (legacy format) keep passing unchanged.

**Commits:** `feat: iiif presentation 3 manifest proposal with converted examples`,
`feat: read iiif presentation 3 manifests as storymap input`

---

## 10. Final verification gate

```
npm install                     # node >= 22
npm run lint                    # eslint 0 errors (all rules incl. no-explicit-any)
                                # stylelint 0 errors (zero disabled rules)
npm run format:check            # prettier clean
npm run typecheck               # tsc --noEmit: 0 errors (strict + noImplicitAny)
npm run validate                # 23/23 legacy fixtures valid
npm run validate:iiif           # 23/23 manifests pass the official IIIF validator
npm test                        # vitest: 32/32
npm run build                   # vite lib + demo passes + font themes, 0 deprecation warnings
npm run test:e2e                # playwright: 22 passed, 4 skipped (legacy zoomify fixtures)
```

---

## 11. Breaking changes / notes

- `window.trace` / `window.VCO` transitional globals removed (use the ES
  exports or the `KLStoryMap` UMD global).
- `relative_date` option no longer does anything (moment loading was broken).
- Knight Lab analytics removed from the embed page.
- `morpheus` is now an npm dependency; its typings live in
  `src/animation/morpheus.d.ts`.
- Font themes emit woff2-only, latin/latin-ext subsets via
  `@fontsource-utils/scss`; add subsets back via the `$subsets` argument.
- `no-explicit-any` and `noImplicitAny` are enforced: new code must be fully
  typed.
- TypeScript is pinned to `^5.9` (TS 7 conflicts with typescript-eslint
  peers — revisit on upgrade).
