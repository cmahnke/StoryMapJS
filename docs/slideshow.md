# Slideshow tours as StoryMapJS data

Slideshow tours are W3C `AnnotationCollection` documents with per-stop
image targets and a `strollview` extension object (slideshow-style guided
image tours). The viewer reads them through
`slideshowToStorymapData()` (`src/storymap/from-slideshow.ts`), the
counterpart of `manifestToStorymapData()` for that format: pure, so the
same document always produces the same story. Detection is narrow
(`isSlideshowCollection` — type plus extension markers, never a P3
`Manifest`/`Collection`), auto-detects by default, and disables with the
`slideshow: false` option.

```sh
# convert a tour (URL or file) with optional player settings
npm run convert:slideshow -- --settings settings.json --out tour.storymap.json <tour-url-or-file>
```

## Slide mapping (one annotation = one slide, in page order)

| Tour field                               | Story field                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `label`                                  | story `title` (first slide headline)                                        |
| `creator` / `rights`                     | story `credit` (+ map attribution)                                          |
| `TextualBody value`                      | `text.text` (`text/html` verbatim)                                          |
| target `#x,y,w,h`                        | `location.region` (origins clamped)                                         |
| annotation / canvas ids                  | `uniqueid` + `provenance`                                                   |
| `rotation` (non-zero)                    | `location.rotation`                                                         |
| `filters`                                | `location.filter` (`hue_rotate` → `hueRotate`)                              |
| `passepartout` + color/invert            | `location.mask`                                                             |
| `audio`                                  | `narration` (full flag bag)                                                 |
| `image_srv`                              | `location.basemap` (IIIF services and plain image files alike)              |
| `image_static`                           | `media.url` + story `fallbackUrl`                                           |
| `manifest_id` / `canvas_id` / `image_id` | `provenance.{manifest,canvas,image}` (canvas falls back to the target base) |

`rotation: 0`, `filters: false`, `passepartout: false` and `audio: false`
are omitted (the viewer defaults match). A target without a fragment, or
with an unusable one, keeps the whole canvas with a warning. Audio that
duplicates the slide media URL is kept once, as media.

## Legacy v1 tours

v1 documents (`AnnotationPageSequence`, one page per slide, `metadata`
with plain `title`/`author`/`license`) map page-by-page: bodies
concatenate with a space, the last `#x,y,w,h` fragment wins, the
`uniqueid` is the page's first annotation id (provenance comes from the
target's `manifest_id`/`canvas_id`/`image_id`), and the metadata becomes
title + credit. v1 has no filters/rotation/mask/audio/static fields.
Detection is by context plus shape, never Presentation 3.

## Player settings mapping

| Setting                              | Option                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `mode`                               | `mode` (`standard`/`static`)                                                                                                   |
| `viewerheight`                       | `viewerheight` (validated `px`/`%`/`vh`)                                                                                       |
| `autoplay` + `slidetimeout`          | `autoplay` ms (`false`/absent → `0`)                                                                                           |
| `fxmode`                             | `fxmode` (`basic` → `slide`)                                                                                                   |
| `progressbar`                        | `progressbar` (`false`/`"off"` → `false`)                                                                                      |
| `textmode`                           | `textmode`                                                                                                                     |
| `textsize`                           | `textsize`, bottom dock only (side docks ignore it — the player drops the declaration too: `"20%"/2` is `NaN` inside `calc()`) |
| `hudcolor`/`hudbgcolor`/`hudopacity` | direct (`"75"` → `75`)                                                                                                         |
| `shownav`                            | `shownav`                                                                                                                      |
| `showfullscreen`                     | `fullscreen`                                                                                                                   |
| `showinfo`                           | `show_info`                                                                                                                    |
| `showscrollbars`/`showheadings`      | `show_scrollbars`/`show_headings`                                                                                              |
| `bgcolor`                            | `map_background_color` (approximation, documented)                                                                             |
| `imgoverlay` + `imgoverlayurl`       | fanned out to every slide's `imgoverlay` (`"50%"` → `0.5`)                                                                     |

## Loss table (warned, one `console.warn` per kind)

Provenance identifiers beyond `uniqueid` (kept data-only in
`slide.provenance`), unfollowed `next` pages (inline documents; the URL
loader and CLI follow the chain), unknown `mode`/`fxmode`/`play` values,
unparsable bottom-dock `textsize`/`hudopacity`/`viewerheight`, overlay
enabled without a URL, malformed targets/annotations, empty pages
(skipped). Everything else translates silently — legacy v1 tours map
fully (above) — and every translator output validates against
`schema/storymap.schema.json`.

Translated tours render through the slideshow-gated presentation fields
(`slideshow_source`), so internal documents are unaffected — see the
README's slideshow section.

## Corpus

Observed tours (structural facts only; no content archived). Hunt grounds
exhausted per the stop rule: Forum Wissen embeds are consent-walled,
code search doesn't index the tour JSONs, museum/partner repos hold only
manifests — the canonical
[`strollview-format-lib`](https://github.com/seigedigital/strollview-format-lib)
(v1/v2 parsers, samples) is the authoritative shape reference.

| Tour                      | Ver | Stops | Targets              | Extras seen                                                       | Audio                    | Services                                |
| ------------------------- | --- | ----- | -------------------- | ----------------------------------------------------------------- | ------------------------ | --------------------------------------- |
| Uni der Dinge (Göttingen) | v2  | 19    | frag, bare, negative | filters obj, mask obj, rotation 0                                 | none                     | IIIF 2/3, custom API                    |
| 47 Ronin (emakimono)      | v2  | 35    | frag                 | all `false`                                                       | none                     | single `.ptif` service                  |
| John Low (VKC)            | v2  | 36    | frag, bare, negative | mask obj (incl. tiny/out-of-range), `image_static`                | `auto`/`n/a`, Drive + S3 | IIIF 2/3 mixed                          |
| DDD AAA (test tour)       | v2  | 17    | frag, bare           | rotation 35/181, `play: "click"`, `application/ogg`, missing keys | `click` + `auto`         | IIIF                                    |
| Demo (Leipzig)            | v1  | 8 pp  | frag, bare           | — (v1 has none)                                                   | —                        | IIIF 2 (`.jpx` bases serve `info.json`) |
| format-lib 1-01           | v1  | 8 pp  | frag, bare           | —                                                                 | —                        | IIIF                                    |

Never observed in the wild: `next` page chains, non-IIIF image files,
`audio.play` beyond `auto`/`click`, `mode`/`fxmode` beyond
`standard`/`basic`. Those paths are proven synthetically (paging chain
unit tests, local static-image e2e) and warn loudly if met.
