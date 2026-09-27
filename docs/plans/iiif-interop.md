# IIIF interop: reuse the standards we already sit next to

Goal: stop inventing vocabulary where IIIF (or a de-facto standard) already
has one, adopt the guided-viewing and deep-linking conventions the ecosystem
has converged on, and design non-linear navigation properly instead of
growing around it ad hoc.

**Term policy (decided): where a standard — or a de-facto standard — replaces
one of our `storymap:` terms, the term is dropped outright. No aliases.** A
term may only disappear in the same commit that lands the reader for its
replacement, so no manifest ever fails to load for a term we removed before
something could read it.

Acceptance: the converter reads the standard property for every case §2 lists,
`public/context.json` declares only terms with no standard equivalent, the 49
manifest fixtures validate unchanged in _meaning_ (each is re-authored to the
standard form), and the viewer keeps every behaviour it has today.

Explicit non-goals: IIIF Content Search UI, IIIF Auth 2.0 flows, IIIF Change
Discovery, and IIIF Presentation 4.0 `Behavior`/`Scene`. See §9.

Cross-links: `docs/plans/iiif-media-tours.md` (annotation-driven stops, marker
config, narration — several of its proposed _terms_ are now disallowed, see
§8.6) and `docs/storymap-as-iiif-manifest.md` (the user-facing mapping, which
embeds the context block this plan changes).

---

## 0. Background: what we read today

> **Re-verified 0.10.8, and three of the four "silently wrong" items are now
> fixed** — §2.1, §2.2 and §2.3. What follows is the state as of that pass.
> Every claim below was re-checked against the tree rather than assumed; the
> drift is listed in §0.2.

Line numbers are hints; the symbol names are the stable handle.

- `readTerm` (`src/storymap/iiif.ts:130`) reads `storymap:<term>` first and
  falls back to the bare key, except for `type`, which is hard-blocked from the
  bare form (`:135`) because a Canvas/Annotation `type` is the IIIF class name.
  The same helper reads both the Canvas and the mapconfig Service.
- All 38 declared terms are read; none is dead. Six also exist as storymap-JSON
  options (`background`, `date`, `keyboard`, `language`, `overlays`, `type`) and
  32 are manifest-only.
- The mapconfig Service is a **local convention**: `readMapConfig`
  (`:154`) matches the first `service[]` whose `profile` contains
  `"mapconfig"` (`:19`, `:160`) and `applyMapConfig` (`:433`) copies 29
  `storymap:` terms onto legacy snake_case root keys.
- `readPainting` walks `canvas.items[].items[]` and now returns the **shared
  body record** (`PaintingBody`): `url`, `region`, `type`, `format`, `label`,
  `accessibilitySummary`, `credit`, `thumbnail`, `duration`, `start`, `end`,
  `subtitles`. Shipped with the media-tours work, which needed `type` for its
  `Sound` bodies; §2.7's remaining work is dropping the terms and inverting
  the precedence, not reading the body.
- The selector reader is **implemented** — `readSelector()` replaced the old
  `readTargetRegion` and reads `FragmentSelector`/`ImageApiSelector` (`xywh=`,
  `xywh=pixel:`), `PointSelector` (synthesizing the 5% square),
  `TextQuoteSelector`, `TimeState` and `SvgSelector`, one level of
  `refinedBy`, and a string target's `#xywh=` fragment. §4's remaining work is
  the resolution and drawing of quote and SVG selectors, not the reading.
- Region precedence is still **inverted** relative to §2.8: the
  `storymap:imageRegion` term still wins over the painting annotation's
  selector it stands in for (`readImageRegion(readTerm(record,
"imageRegion")) ?? painting?.region`).
- `readLocation` (`:218`) takes the **first** Point from a `navPlace`
  FeatureCollection and copies the 7 `LOCATION_PROPERTIES` (`:23-31`) verbatim;
  `readNavPlaceBbox` (`:259`) turns a Polygon into `map_bbox`.
- `flattenLanguageMap` (`:106`) prefers a `"none"` key and otherwise
  **concatenates every language array**, losing which language each string was
  in. There is no per-slide language.
- `isPresentation3Manifest` (`:139`) accepts anything whose `@context` contains
  the P3 context, so a `Collection` passes and its `items[]` (Manifests) are
  fed to `canvasToSlide` as if they were Canvases.
- The converter performs **no network I/O at all** — there is no `fetch` in
  `src/storymap/iiif.ts`, so `seeAlso` targets are invisible by construction.
- `slide.group` is declared (`src/types.ts:65`, `schema/storymap.schema.json:324`)
  and read by **nothing** at runtime.
- `slide.uniqueid` is auto-generated when falsy (`StorySlider._addSlide`,
  `src/slider/StorySlider.ts:234`) and the slider resolves deep links by it
  (`goToId`, `:263`), but `manifestToStorymapData` never sets it, because
  Canvas and Manifest `id`s are not read.

### 0.1 Silently wrong today (the reason this plan exists)

These are correctness bugs, not missing features, and they are all the same
shape: a real-world manifest is mis-read without any error.

1. ~~**`requiredStatement` loses its `label`.**~~ **Fixed (§2.1).** We read only `.value`, so a
   manifest that labels its statement — "Credit", "Rights holder", a
   language-tagged term — loses that half. The property is a **single
   object**, not an array: an earlier draft of this plan claimed otherwise,
   citing the P3 change log, and the official IIIF validator settles it — it
   rejects `requiredStatement: [...]` with "is not of type 'object'" and
   accepts `{"label": …, "value": …}`. Verified with `validate:iiif`, not
   assumed.
2. ~~**A `Collection` is accepted and mangled.**~~ **Fixed (§2.2), by
   rejecting rather than flattening — see §0.3 for why flattening turned out
   to be impossible.** Detection never inspects
   `type` negatively, so each member Manifest becomes a text-only slide: no
   media (a Manifest has no `body.id` to read), no locations, no warning.
3. ~~**Canonical `id`s are discarded**, so a stop cannot be addressed by id even
   though the viewer is already built for it.~~ **Fixed (§2.3).**

### 0.2 Drift since this plan was written

Re-checked rather than assumed. Nothing in §0 above had gone stale except the
line numbers, but the tree around it has moved, and three things a
re-implementer would get wrong:

- **The `uniqueid` generator moved and no longer writes to the caller's data.**
  §0 cites `StorySlider._addSlide` (`:234`); the generation is now in
  `_createSlides`, and it builds a per-slide copy instead of assigning into
  `data.slides[i]` — the same fix that stopped two viewers built from one
  parsed document emitting duplicate element ids. §2.3 therefore assigns
  `slide.uniqueid` on the returned slide, and must not reintroduce the
  write-back.
- **§2.3's write interacts with the multi-instance work.** A duplicate
  `uniqueid` is no longer merely untidy: `goToId` resolves by first match, so a
  collision navigates to the wrong stop. There is a fixture-wide test for it
  (`tests/iiif.test.ts`, "every shipped IIIF fixture") and it should stay
  green through the remaining §2 commits.
- **`StoryMap`'s public methods are now dispose-guarded and terminal**, and
  `_syncHash` / `_applyHashSlide` (which §5.1 changes) run inside that guard.
  The id-based hash and `current_id` work has to keep `dispose()` semantics: a
  disposed viewer no-ops rather than throwing.
- New fixture `public/examples/issue-iiif-geo.json` (a georeferenced IIIF
  _storymap JSON_, not a manifest) took `public/examples/` to 49 files. The
  IIIF fixture count is unchanged at 50, and `validate:iiif` is still 50/50.

Also worth knowing before writing the e2e for §5/§6: the Playwright suite now
runs on Chromium, Firefox and WebKit (`npm run test:e2e:all`), and the harness
pages accept `?record=<events>` to collect events into `window.__events` — the
mechanism a `current_id` or `seeAlso` test will want.

### 0.3 Why a Collection is rejected rather than flattened

§2.2 offered two branches and asked which to take. Neither of the reasons
expected survived contact with the specification, and the finding is worth
keeping:

- **Flattening is impossible for a synchronous converter.** A Presentation 3
  `Collection`'s `items` are `id` _references_ to manifests held in other
  documents. Concatenating their canvases means fetching them, and the
  converter does no I/O — the same constraint that is holding §5.2's
  `seeAlso` reader back.
- **A Collection fixture cannot be authored either.** The official IIIF
  validator rejects both obvious member shapes: an embedded `Manifest` object
  ("not valid under any of the given schemas") _and_ a bare id string (the
  same). So there is no conforming `public/examples-iiif/` fixture that could
  exercise the path, and `validate:iiif` must stay at 50/50.

So the outcome is the branch that removes a defect and promises no feature: a
Collection is detected, reported by name with its members, and contributes no
slides — instead of being accepted and mangled. A host that wants a
multi-manifest tour fetches the members and concatenates their
`manifestToStorymapData()` slides itself, which is documented in the
authoring guide. Multi-manifest tours are a real and wanted capability
(Exhibit, Annona's Multi Storyboard, §1.7), but it is a _host_ composition
here, not a converter one.

---

## 1. Formats and applications compared

### 1.1 IIIF Presentation API 3.0 (current)

We use `label`, `summary`, `items`, `navPlace`, `requiredStatement.value` and
the mapconfig service. We ignore `structures`/`Range`, `seeAlso`, `navDate`,
`metadata`, `rights`, `accessibilitySummary`, `accessibilityFeature`,
`homepage`, `logo`, `provider`/`Agent`, `thumbnail`, `rendering`, `partOf`,
`Collection`/`within`, `start`/`end`/`duration`, every `id`, `format`,
`audience`, `canonical`, `extraFormats`/`extraQualities`/`extraFeatures`, and
every `motivation` except `painting`.

### 1.2 Presentation 4.0 — watch list only

4.0 exists and adds `Behavior` (`hidden`, `paged`, `reset`, `start`/`pause`
/`end`), the `Scene` model, and an `AudioContentSelector`. Nothing here is
actionable now; noted so the vocabulary choices in §3 are not painted into a
corner.

### 1.3 W3C Selectors and States

The full set: `FragmentSelector` (`xywh=`), `SvgSelector`, `PointSelector`,
`TextQuoteSelector` (`exact` + `prefix`/`suffix`), `TextPositionSelector`,
`DataPositionSelector`, `RangeSelector`, `TimeState` (`sourceDate`,
`cachedSource`), and `refinedBy` chains that combine them. We implement one
member of that vocabulary.

### 1.4 IIIF Content State 1.0

A Web Annotation with motivation `contentState` targeting a `SpecificResource`
whose `source` is a Canvas with `partOf` → Manifest, passed to a viewer as a
query parameter. This is the standard form of what our `#slide-N` hash does
ad hoc, and the ecosystem treats it as commodity: _iiif.link_ ("the viewer
will open at the saved zoom and region of interest") and _Whatiiif_ ("shareable
deep links to highlighted regions") are both in the awesome-iiif catalogue.
Verify the 1.0 parameter name and encoding rules against the spec before
implementing — do not trust the 0.1 wording.

### 1.5 Map configuration: there is no IIIF spec

The IIIF Maps TSG charter states its intent as creating "a number of IIIF
Extensions" and leaving the core specifications alone; only `navPlace` and the
Georeference Extension have shipped. So our `profile: "mapconfig"` service is a
local convention. The closest thing to a standard is **TileJSON 2.1**
(`tiles`, `minzoom`, `maxzoom`, `bounds`, `scheme`) plus `center`/`zoom`,
which we read none of. See §2.9.

### 1.6 TimelineJS 3 (same lab, closest sibling format)

Slide fields: `start_date`/`end_date` with `display_text`, `text.headline`,
`text.text`, `media.{url, caption, credit, thumbnail, alt, title, link,
link_target}`, `group`, `display_date`, `background.{url, alt, color}`,
`autolink`, `unique_id`, `tag`, `type`, plus `era` spans and the options
`start_at_slide`, `start_at_end`, `start_zoom_adjust`. Our format already
converges with it on headline/text/caption/credit/alt/background; it has
`group` and `unique_id` where we have an inert `group` and a
slider-generated `uniqueid`. The gaps are the lesson.

### 1.7 Guided-viewing and storytelling applications

From the IIIF awesome-iiif "Exhibition and Guided Viewing Tools" section.
Each line is what it does that we do not.

- **Exhibit** — "a free IIIF storytelling tool that allows for guided
  navigation of one or more IIIF Manifests using annotations". Multi-manifest
  tours, annotation-driven.
- **Annona Range Storyboard** — "guided viewing of segments of a manifest",
  plus a **Multi Storyboard** viewer for "guided comparison of multiple
  manifests". A Range is the storyboard; this is the strongest evidence that
  `structures` is a _tour_ primitive for us, not just grouping.
- **Panel Truck** (Leventhal Map Center) — "slide-like narration over one or
  multiple IIIF sources, as well as static images and **tiled map sources**",
  embeddable as a Web Component. This is StoryMapJS in the wild: slides,
  narration, IIIF sources and tiled maps, but packaged as a custom element
  and multi-source.
- **Adno** — "viewing, editing and sharing narratives **and pathways** on
  IIIF images". Pathways are non-linear; our model is strictly linear.
- **Telar** — "weaves together IIIF images, audio, video, and texts to create
  **layered** visual narratives". Narration is table stakes, and layered means
  a stop can carry more than one narrative thread.
- **Storiiies Editor** (Knight Lab) — "guided tours of a single IIIF manifest
  using annotations". Already referenced by the media-tours plan.
- **Curation Tools / IIIF Curation Viewer** (CODA) — "a general IIIF viewer
  with added focus on curation and ordering of cropped IIIF images", plus a
  Curation Manager and Curation Board. See §7.
- **Moviemaps** — "a video discussion with digital collections objects that
  zoom and pan while synchronized with the video".
- **Micrio** — "high-performance client … with additional storytelling
  elements".

### 1.8 Reusable libraries

The ecosystem ships a spec-complete parser and validator that we reimplement:
**IIIF Commons `iiif-parser`** (P2.1/3.0/4.0 with v2→v3 upgrade),
`manifesto`, `iiif-helpers`, and `vault` (the successor to Hyperion). See §8.
The annotation ecosystem is large and mature (Miiify, SimpleAnnotationServer,
Ocracoke, Whiiif, Annosearch, Recogito, IMMARKUS, Mirador Multi User), as is
CMS/DAM support (19 listed, including Archipelago, Islandora, Omeka S,
CollectiveAccess, ResourceSpace, ContentDM) — which is why §0.1 item 1 matters
in practice: that is how institutional manifests actually ship.

### 1.9 Comparison

| Concern              | Standard / de-facto                                  | Ours today                          | Action |
| -------------------- | ---------------------------------------------------- | ----------------------------------- | ------ |
| Attribution          | `requiredStatement` `{label,value}`                  | `.value` only, the `label` dropped  | §2.1   |
| Slide identity       | `Canvas.id`                                          | `uniqueid` auto-generated           | §2.3   |
| Collections          | `Collection`/`within`                                | silently mangled                    | §2.2   |
| Image map            | body `ImageService3`                                 | `storymap:iiifUrl`                  | §2.4   |
| Date                 | `navDate`                                            | `storymap:date`                     | §2.5   |
| Slide background     | canvas `background` annotation                       | `storymap:background`               | §2.6   |
| Caption              | `body.label`                                         | `storymap:mediaCaption`             | §2.7   |
| Credit               | `body.requiredStatement` / `body.provider`           | `storymap:mediaCredit`              | §2.7   |
| Alt text             | `body.accessibilitySummary` + `accessibilityFeature` | `storymap:mediaAlt`                 | §2.7   |
| Region               | Image API Selector on the target                     | `storymap:imageRegion` (wins today) | §2.8   |
| Georeferencing       | `motivation: "georeferencing"`                       | `storymap:georeferencedLayers`      | §2.10  |
| Basemap              | TileJSON 2.1 `tiles` + preset keyword                | `storymap:mapType`                  | §2.9   |
| Thumbnail            | `thumbnail`                                          | never read                          | §3.2   |
| Grouping / order     | `structures` / `Range`                               | inert `slide.group`                 | §3.4   |
| Labels               | language maps + `@language`                          | all languages concatenated          | §3.3   |
| Non-rect regions     | `SvgSelector`                                        | `xywh=` only                        | §4     |
| Text anchoring       | `TextQuoteSelector`                                  | —                                   | §4     |
| Time anchoring       | `oa:TimeState`, `start`/`end`                        | ignored                             | §4     |
| Deep links           | Content State 1.0                                    | `#slide-N`, digits only             | §5.1   |
| External annotations | `seeAlso`                                            | invisible (no fetch)                | §5.2   |
| Pathways             | `linking` annotations (Adno)                         | strictly linear                     | §6     |

### 1.10 Relationship to the media-tours plan

`docs/plans/iiif-media-tours.md` is a **consumer** of this plan, not a peer.
Three pieces of machinery are implemented here and consumed there:

| Machinery                       | Owned by     | Consumed by media-tours as                                                                                                                                                     |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| the selector reader (§4)        | interop §4   | `readCommentingAnnotations` maps an annotation's target through it; the "point → centered square, 5% of the canvas, clamped" heuristic lives in the shared reader, stated once |
| the painting-body record (§2.7) | interop §2.7 | `Sound` body detection, and narration, which is a `Sound` body and not a term                                                                                                  |
| the `seeAlso` fetch (§5.2)      | interop §5.2 | "externally-referenced pages followed one level max" comes free                                                                                                                |

**Ordering: this plan predicted interop §2 before media-tours P1, and that
did not happen** — media-tours needed the selector reader and the body record
to exist before it could land, so it shipped **with** §4's reader and §2.7's
body record rather than after them. Consequences to keep in mind:

- The nine terms of §2 are **not** dropped. The body record reads the standard
  properties as _fallbacks_ under the extension terms, so what remains is
  additive: §2.7 becomes "delete the terms, invert the precedence", and §2.8
  likewise. No second body change is needed.
- The `seeAlso` reader (§5.2) is still missing, and media-tours was the
  consumer that wanted it. That is now the one real dependency, and it is
  deferred: the converter is synchronous, so following an external page means
  fetching on the load path.
- The fixture count moved 49 → 50 with `annotated-image.json`, which carries a
  **labelled** `requiredStatement` — the exact case §2.1 wants, so that
  term's fixtures diff is already waiting to be reviewed.

The reverse dependency is narrow: media-tours' marker popup and
media-aware autoplay are independent of anything here.

---

## 2. P1 — drop 9 terms, land 9 readers

Effort M overall, as **9 commits, one term each**. Each commit: add the
standard reader, delete the term from `public/context.json` _and_ the reader,
re-author the fixtures that used it, update the embedded context block and
mapping table in `docs/storymap-as-iiif-manifest.md` (which regenerates
`public/docs/iiif.html`), and add or extend a test. Nothing waits: a term never
outlives its replacement.

The 9: `iiifUrl`, `date` (manifest side), `background` (manifest side),
`mediaCaption`, `mediaCredit`, `mediaAlt`, `imageRegion`,
`georeferencedLayers`, `mapType`.

### 2.1 `requiredStatement`: use the `label`, not just the `value`

> **Done (0.10.8).** `readRequiredStatement()` reduces the statement to
> `{label, value}` and `formatAttribution()` prefixes the label when there is
> one, leaving an unlabelled statement as the bare value. The same reader now
> backs body-level credit, so `media.credit` keeps its label too. The shipped
> labelled fixtures (`annotated-image`, `iiif-wellcome`, `issue-image-region`)
> now read `Attribution: …`.

`requiredStatement` is a **single `{label, value}` object** in P3, not an
array — the official validator rejects the array form, so a plan written
against 0..n would have coded a shape no conforming manifest has. Read the
`label` beside the `value` and use both for the attribution text, so a
statement labelled "Credit" does not silently become bare text. Keep the
reader's array-tolerant branch for producers that emit one anyway, but stop
describing that as the conformant form. Fixes §0.1 item 1. Test: a manifest
with `{"label": {"en": ["Credit"]}, "value": {"en": ["Someone"]}}` keeps the
label; the unlabelled form still works.

### 2.2 `Collection` handling

> **Done (0.10.8), as a rejection rather than a flattening** — see §0.3 for
> why flattening is impossible and why no conforming fixture can exist.
> `isPresentation3Manifest()` no longer accepts a `Collection`,
> `isPresentation3Collection()` detects one, and `StoryMap` routes it to the
> converter, which names the collection and its members in a console warning
> and returns its label and `requiredStatement` but no slides.

Either flatten a `Collection` into the story (member Manifests become
sequences of slides, in order) or reject it with an explicit console error.
What we must not do any more is the current silent mangling. Decide by asking:
does our data model survive a manifest-per-canvas? It does if the member
Manifests' canvases are concatenated in order, which is also what
`within`-style round-tripping expects. Test both branches.

### 2.3 Canvas and Manifest `id` → `uniqueid`

> **Done (0.10.8).** `canvasToSlide`'s caller assigns the Canvas `id`, falling
> back to the Manifest `id`, then to `""` so the slider generates one. An
> annotation-driven stop on a canvas gets `<canvasId>#<index>`, so it is
> addressable without colliding with the canvas it annotates. A fixture-wide
> test asserts no duplicate or `"undefined"` ids across all 50 manifests.
> Still open: `StoryMap._applyHashSlide` only matches `#slide-<digits>`, so
> these ids are not yet reachable from a URL — that is §5.1, which was always
> the other half of this workstream.

`canvasToSlide` sets `slide.uniqueid` from the Canvas `id` (falling back to the
Manifest `id`, then letting `StorySlider._addSlide` generate one). The viewer
already resolves deep links by `uniqueid` (`StorySlider.goToId`, `:263`) and
auto-generates when falsy (`:234`), so this is nearly free and it is the
prerequisite for §5.1 and all of §6. Test: `goToId("#/canvas/2")` from a
manifest's `id`.

### 2.4 `iiifUrl` → the body's Image API service

**Done** (commit 4). An image basemap is a painting body carrying an
`ImageService3` in `service[0]` (`id` + `profile`). Read the Image API base
from there (falling back to stripping `/info.json` off `body.id`) into
`data.iiif.url`, and delete `iiifUrl` from the mapconfig terms. Note
`storymap:mapAsImage` is a _separate_ term with no standard equivalent and
stays; an image map becomes "an image service plus `mapAsImage: true`". Test:
a manifest whose canvas body has an Image API service yields the same
`data.iiif.url` as the old term did.

One decision the plan did not spell out: the service is only consulted when
`map_type` is `"iiif"`. Without that gate, any storymap whose _slides_ happen
to be IIIF images — which is most of the fixture set — would pick up a
`data.iiif` that looks like a basemap. `map_type` is already what tells the
map to use the basemap, so the gate is the honest one, and a test covers it.

The hand-authored `annotated-image.json` already carried the `ImageService3` on
its painting body, so the term was simply deleted from it. All eight
`mapType: "iiif"` fixtures carry a service, so no shipped manifest loses its
basemap.

### 2.5 `date` → `navDate`

**Done** (commit 2). Read `navDate` and drop the manifest-side `storymap:date`.
The storymap-JSON `date` field is untouched — this only removes the _manifest_
vocabulary. Test: `navDate` on a canvas produces the same `slide.date` the term
did.

Probing the validator settled the shape, and not in the direction the spec
suggests: `navDate` takes a **plain string**, and a `Date` / `DateRange` object
is rejected with _"is not of type 'string'"_. It also applies **no format rule
at all** — `"Aug 23"`, `"2013"` and `"1790-2010"` all pass. So there is nothing
to normalise and no fixture data to change; the storymap value is carried
verbatim. A language map is rejected, so we never write one, but the reader
still flattens one for leniency, since other producers emit it.

### 2.6 `background` → the canvas background annotation

**Done** (commit 3). P3 expresses a canvas background as an Annotation with
`motivation: "painting"` whose body is the image or colour resource, referenced
from the canvas `background` property. Read it into `slide.background` and drop
the manifest-side term. The storymap-JSON `background` field stays. Test: a
background annotation and the old term yield the same slide background.

Two things the validator could not settle, and one it caught:

- **The validator is no help here.** It accepts the background annotation in
  every shape tried — a bare `Color` body, a body array, `opacity` on the
  annotation, two separate annotations, even an untyped string. So the spec,
  not the validator, decides: one painting annotation, an `Image` body for the
  url and a `Color` body for the colour, both when both are set.
- **`opacity` is dropped, not given a term.** The reader already accepted
  `background.opacity` and never rendered it, and IIIF has no vocabulary for
  it — Presentation 3 has a `Color` body but nothing to fade a background with,
  and 4.0's `backgroundColor` is a plain hex value. A term for a field the
  viewer ignores would be dead vocabulary, which §0's "none is dead" rules out.
  `slide.background` round-tripping without its opacity is the one expected
  difference.
- **The result is always the object form.** The bare-string
  `slide.background` means a _colour_ — that is what the converter has always
  done with it — so returning a url-only background as a bare string would read
  back as a colour on the next trip. A test caught exactly that.

### 2.7 `mediaCaption` / `mediaCredit` / `mediaAlt` → body properties

**Done** (commit 1). Extend `readPainting` and feed `media.caption`,
`media.credit` and `media.alt` from the painting annotation; delete the three
terms. Highest fixture volume in this plan (`mediaCredit` appears 297 times
across the IIIF fixtures) but it is mechanical, since the converter already
visits the body. Test: an annotation with `label` + `requiredStatement` +
`accessibilitySummary` populates all three slide media fields.

Two things came out of doing it against the official validator rather than from
the spec text alone:

- **The properties go on the `Annotation`, not on the body.** P3 defines
  `label`, `requiredStatement` and `accessibilitySummary` on the Annotation.
  The body is still read as a fallback, because real manifests put them there,
  but the annotation wins. The validator accepted either; the annotation is the
  conformant one.
- **A credit is a _labelled_ statement.** P3's `requiredStatement` shape is
  `{label, value}`, and the official validator rejects the array form. So a
  credit round-trips as `Credit: <credit>` — the same inherent asymmetry as
  §2.1's manifest-level attribution, and the round-trip test allows exactly
  that one label.

A manifest written against the old terms still loads; the three strings are
simply no longer read, and the context no longer declares them.

**This record is the shared contract, not just this commit's business.** The
media-tours plan needs `body.type` to tell a `Sound` body from an `Image` or a
`TextualBody`, and that plan also has no term to add for a narration, so the
one reader must return:

| Field                                          | Used by        | Why here                          |
| ---------------------------------------------- | -------------- | --------------------------------- |
| `url`, `region`                                | today          | existing behaviour                |
| `label`                                        | §2.7           | caption                           |
| `requiredStatement`, `provider`                | §2.7           | credit                            |
| `accessibilitySummary`, `accessibilityFeature` | §2.7           | alt text                          |
| `thumbnail`                                    | §3.2           | `media.thumb`                     |
| `type`, `format`                               | media-tours P1 | telling a `Sound` from an `Image` |
| `duration`, `start`, `end`                     | §4             | time-anchored stops and narration |

Two plans extending one function is exactly the conflict this plan exists to
prevent, so anything a consumer needs goes in this list, not in a second
`readPainting`-shaped helper.

### 2.8 `imageRegion` → the Image API Selector

**Done** (commit 5). The extension term was standing in for a selector we
already read (`readSelector()`) and currently _lost_ to it in precedence order
— the converter preferred the term. Inverted the precedence, deleted the term,
and the painting annotation's `target.selector` is now the only source. Test:
the fixtures that carry a region on the target keep fitting the same region.

The target becomes a `SpecificResource` whose `selector` is an
`ImageApiSelector`, and the prefix is `xywh=pixel:` rather than a bare `xywh=`
because the field is documented in image pixels — the prefix then says so
itself instead of implying the canvas size, which matters for a non-image map
where the canvas is a nominal 1080×1080 and the region's image is something
else entirely. `pixel:` is one of the three prefixes Media Fragments 1.0
actually defines (`pixel:`, `percent:`, and the default); `image:` is not one
of them, and the reader already understood `pixel:`.

`readImageRegion` went with the term: nothing read it any more.

### 2.9 `mapType` → TileJSON 2.1 + a `basemap` keyword field

`mapType` today carries two unrelated things: a tile URL template and a vendor
keyword (`osm`, `stadia`, `mapbox://styles/…`, `iiif`, `zoomify`). Split them:
TileJSON 2.1 `tiles` takes the template, with `minzoom`/`maxzoom`/`bounds`/
`scheme` honoured where present and `center`/`zoom` feeding the initial view;
a new **`storymap:basemap`** term carries the keyword. Delete `mapType`.
`storymap:basemap` is the one name in this plan we choose rather than derive —
it is a noun for the same job `mapType` did. Test: a mapconfig service using
`tiles` + `center` + `zoom` and one using `basemap: "stadia"` both resolve.

### 2.10 `georeferencedLayers` → georeferencing annotations

Read annotations with `motivation: "georeferencing"` from each canvas (today
`readPainting` skips any motivation that is not `painting`, `:186`) and delete
the manifest-level term.

**Trap to write down:** `georeferencedLayers` is manifest-scoped and feeds
map-wide `data.overlays[]`, whereas a georeferencing annotation is
canvas-scoped. The converter must collect georeferencing annotations from
**all** canvases into one `overlays[]` array, or a layer annotated on canvas 0
disappears for the rest of the story. Test: a two-canvas manifest with a
georeferencing annotation on the first canvas still renders the layer for both
slides.

---

## 3. P2 — standard fields with no term to remove

- **`thumbnail` → `media.thumb`.** `StorymapSlideMedia.thumb` exists
  (`src/types.ts:44`) and is never written; the manifest doc already lists it
  as dropped. Read the body or canvas `thumbnail`.
- **`metadata`, `rights`, `provider`, `logo`, `homepage`.** P3's label/value
  pairs and Agent links are where institutional credit lives. `rights` is a
  licence URI and should be shown, not ignored.
- **A local linked-data context for the `navPlace` properties bag.** The
  navPlace extension §3.2 says terms used in a GeoJSON Feature's `properties`
  "should be described either by registered IIIF API extensions or local
  linked data contexts", and that a client discovering a property it does not
  understand "must ignore" it. Our seven `LOCATION_PROPERTIES` (`:23`) have no
  context describing them, which is a conformance gap in its own right rather
  than a feature. Ship one context file (the sibling of `public/context.json`,
  for the properties bag) and reference it from the fixtures. It is also the
  home for presentation properties such as `popup` and `audioBadge`, which
  therefore need no `storymap:` term at all — the exact mechanism
  `docs/plans/iiif-media-tours.md` §2 wants for its marker config.
  Standardise on `name` for the label even though the navPlace extension's own
  example uses `label`, because `name` is what the reader already copies and
  changing it would break the 7 properties already in the fixtures.
- **Language maps.** `flattenLanguageMap` (`:106`) concatenates every language
  and loses which is which. Keep the map, pick the language the viewer is
  already configured for (the `storymap:language` option, which stays), and
  expose the active language on the slide so a host can offer a language
  switch. This is the single highest-value change for a multilingual tour.
- **`structures` / `Range`.** Two distinct jobs, both of which the ecosystem
  expects (Annona Range Storyboard, TimelineJS `group`):
    1. a Range with a `label` and no `start` → the **group** for its member
       canvases, into `slide.group` — finally giving that inert field meaning;
    2. a Range whose `items` order **differs from canvas order** → the curated
       **slide sequence**, which is what a storyboard is.
       Nested Ranges are chapters. Test: a manifest whose Range reorders canvases
       produces slides in Range order, and a flat Range sets `group`.

---

## 4. P3 — selectors beyond `xywh` — reader shipped, resolution open

> **Partly done.** `readSelector()` landed with the media-tours work and
> returns a normalized `{ region?, point?, quote?, time?, svg? }` covering
> every selector below; `readTargetRegion` is gone. The `PointSelector`
> synthesis and the 5% rule moved here from the media-tours plan, as asked.
> **Still open:** resolving a `TextQuoteSelector` to pixels (needs a text
> layer), and drawing an `SvgSelector` outline (needs an SVG-shaped
> highlight). Both are accepted and preserved today, and the authoring guide
> says so rather than implying they render.

- `SvgSelector` — non-rectangular regions (a rotated or L-shaped stop), which
  `xywh=` cannot express. Scope note: the _viewer_ would need an SVG-shaped
  highlight to match; until it has one, accept and preserve the selector
  without rendering it differently.
- `PointSelector` — a pin rather than a box, which the viewer cannot fit, so
  the reader synthesises a region: a **square of 5% of the canvas's smaller
  side, centred on the point, clamped to the canvas bounds**. Stated here once
  because the media-tours plan consumes it for its annotation-driven stops and
  had it inline; if the media-tours plan lands first, move it here rather than
  keeping both copies.
- `TextQuoteSelector` — anchor a stop to quoted text with `prefix`/`suffix`
  disambiguation. **Scope deliberately:** we can accept and preserve a quote
  selector, but resolving it needs a transcript the manifest does not carry, so
  resolution only happens when a tour supplies one. Say so in the doc rather
  than implying it works.
- `TimeState` + `start`/`end` on a body — time-anchored stops and narration,
  which is what makes Telar-style layered narratives expressible.
- `refinedBy` chains, at least one level deep.

---

## 5. P4 — deep links and external annotations

- **Content State 1.0**, emit and accept, alongside the hash. The hash parser is
  digits-only (`/^#slide-(\d+)$/`, `src/storymap/StoryMap.ts:1342`) and
  `_syncHash` (`:1326`) always writes the index, so a stop with an id is not
  shareable today. Widen the regex to accept a `uniqueid`, emit the id form
  when one exists, keep the index form working, and add `current_id` to the
  `change` payload (`:636`, which today carries only `current_slide`) so hosts
  can tell which _stop_ they are on. Region-level sharing (`canvas#xywh=`) is
  the capability the ecosystem actually links to, so include it.
- **`seeAlso`.** Read an external `AnnotationCollection` (or `AnnotationPage`)
  and merge its annotations for the canvases we render, plus a
  `SearchService1` link for later. This is the enabler for the mature
  annotation servers (§1.8) and for Content Search, without which those
  resources are invisible to us by construction — the converter does no I/O.

---

## 6. P5 — the curation format as a low-ceremony input

The CODH curation format is one object per curated region: an `oa:Annotation`
whose target is a canvas (or a `canvas#xywh=` fragment) and whose body is text
(`text/html` or plain). Exhibit, the Curation Viewer and the Curation Manager
all use it, and it is a fraction of the ceremony of a full Web Annotation page
— which is exactly what an author needs to hand-place stops on one image
without deploying an annotation server.

Accept it as an alternative input alongside manifests, funnelling into the same
normalized shape as §4's `readSelector()`, and document it in the authoring
guide. Verify the exact context URI and required shape against the CODH
curation documentation before implementing; do not write it from memory.

---

## 7. P6 — evaluate IIIF Commons `iiif-parser`

A written evaluation, not a commitment: a comparison of what
`src/storymap/iiif.ts` reads today against what `iiif-parser` would
cover, what it would cost as a runtime dependency, and whether a maintained,
spec-complete, typed parser is worth it given that the repo deliberately
dropped a dependency for a 5 kB saving and declined to bundle Allmaps.

The evidence for taking it seriously is §0.1: a partial hand-rolled reader
fails silently on real-world manifests, and that is the entire bug class in
this plan. The evidence against is the dependency line, and the fact that our
`storymap:` terms and the mapconfig vocabulary are ours either way, so the
converter's _mapping_ layer would remain regardless — the question is only
whether the _parsing_ layer is ours too. Deliverable: the comparison plus a
recommendation, in this plan, before any code moves.

---

## 8. P7 — pathways (non-linear navigation)

Full design, decided here; implementation phased. Motivated by Adno's
"narratives and pathways" (§1.7) and Exhibit's branching tours, and by the fact
that our model cannot express either.

### 8.1 Spine plus edges, not a graph rewrite

Canvas order remains canonical and `goTo(n)` remains index-based. Links are an
additional, explicitly activated affordance. Rationale: every navigation entry
point today is index-based — `StoryMap.goTo` (`:594`), `StorySlider.next`
(`:454`), the hash regex (`:1342`) — and the slider is a rendering of canvas
order. A graph rewrite would touch all of them for no gain until links exist.

### 8.2 Edge model and resolution

- storymap JSON: `slide.links?: { to: string; label?: string; region?:
[number, number, number, number] }[]` — additive; schema, types and
  `validate` updated. `to` resolves against `uniqueid` first, then a numeric
  index.
- manifest: Web Annotations with `motivation: "linking"`, `body` a `TextualBody`
  (the label) or a `SpecificResource`, `target` a canvas id or
  `canvas#xywh=`. One reader path serves both formats, and a link can carry a
  region, composing with the existing region stops.
- Resolution needs §2.3: every canvas gets an id, and a `canvasId → slideIndex`
  map is built once at load. An unresolvable target is inert with a console
  warning — never a dead control.
- No new `storymap:` term is added for this; `linking` annotations need no
  vocabulary.

### 8.3 Deep links

Single stop, not path. A link points at one canvas; the route taken is session
state, not shareable, which keeps §5.1's Content State implementation
spec-shaped and simple. Sharing a stop is `§5.1`'s `current_id` plus a
`#slide-<id>` hash.

### 8.4 Back behaviour

Index-based in v1, with a visited back-stack recorded as an explicit follow-up.
A stack changes every `goTo` caller and the slider's index model, for a benefit
that only exists once branching does.

### 8.5 UI and accessibility

- A `.vco-links` block at the end of the slide text, built from real `<a>`
  elements: keyboard reachable, Enter activates, `aria-current` on the active
  link.
- **Labels must go through the existing allowlist sanitizer.** The stored-XSS
  audit in 0.10.8 made that lesson once; a link label is attacker-controlled
  text like any other.
- 44px touch targets, consistent with the #434 marker work.
- The slider stays linear. A breadcrumb appears only if §8.4's back-stack
  lands.

### 8.6 Knock-on to the media-tours plan

Its proposed `markerIcon` and `markerLabel` terms are **not** added. Marker
presentation already has a non-JSON-LD channel: the `navPlace` Feature
`properties` bag that `LOCATION_PROPERTIES` (`:23`) reads, where `icon`,
`iconSize`, `image`, `name`, `line` and `zoom` already live. So a marker label
is `properties.name` (already supported) and an icon is `properties.icon`, and
narration is a standard `Sound` body rather than a term. `autoplay_media` is
unaffected: it is a storymap JSON option, like `autoplay`.

**The per-stop override loss is accepted, not worked around.** The navPlace
extension permits `navPlace` on a Collection, a Manifest, a Range and a Canvas
and states that other types of resource "**must not** have the `navPlace`
property" — which includes an Annotation. Annotation-driven stops (media-tours
P1) therefore cannot carry their own location or marker presentation: every
stop on a canvas shares that canvas's `navPlace`. That is also semantically
right for the common case, since a region stop on an image lives in image space
where a latitude means nothing. It does mean a per-stop marker override is
impossible, and the guide should say so rather than implying it works.

### 8.7 Named pathways — later phase, not v1

`storymap:pathway: [{ id, label, stops: [uniqueid…] }]` as an alternative
ordered traversal, with a menubar selector to start one. This is Adno's sense
of "pathways". Deferred so v1 has exactly one navigation model.

### 8.8 Tests and risks

Units for edge resolution, dangling targets, cycles, and a region-carrying
link. E2E for link → target → back, and for `#slide-<id>`. Risks to write down:
dead links after a manifest update (resolve at navigation time, not at load),
and the interaction between `uniqueid` and `marker_number` — they are different
index spaces and must not be conflated.

---

## 9. Order, dependencies, verification

Order: **§2 (P1) → §3 (P2) → §4 (P3) → §5 (P4) → §6 (P5) → §7 (P6) → §8
(P7)**, with §2 split into the 9 per-term commits and §8 gated on §2.3 and
§5.1.

Cross-cutting: **identity and deep-linking is one workstream**, not three
tasks. §2.3 (`id` → `uniqueid`), §5.1 (id-based hash, `current_id`) and §8.3
(links resolved by `uniqueid`) all touch `StorySlider._addSlide`,
`StoryMap._applyHashSlide`/`_syncHash` and the `change` payload. Scattering
them across phases means shipping three partial states of one behaviour.

Gates per phase: `npm run typecheck`, `lint`, `format:check`, `validate`,
`test`, `build`, then the new plus adjacent e2e (iiif/manifest/georeference/
autoplay/marker specs). **§2 legitimately edits `schema/`,
`scripts/convert-to-iiif.mjs`, `public/context.json` and the fixtures, so for
those commits the format gate becomes a _reviewed_ diff rather than an empty
one, and `npm run validate:iiif` must stay at **50/50** throughout (the 50th
is `annotated-image.json`, added by media-tours). §5, §6, §7 and
§8 hold the empty-diff line, as does the `group`/`uniqueid` documentation work
in §3.

Non-goals and watch list: IIIF Content Search UI (the `seeAlso` reader is the
enabler; the search UI is a separate piece of work), IIIF Auth 2.0 flows
(institutional content is real, but it is its own project and it collides with
our consent layer), IIIF Change Discovery 1.0 (an aggregation API for
portals and indexers — a viewer does not need it; its reusable parts,
`seeAlso`/`provider`/`canonical`, are covered in §5.2), and P4 `Behavior`/
`Scene`.
