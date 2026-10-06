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

| Tour field                    | Story field                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `label`                       | story `title` (first slide headline)                           |
| `creator` / `rights`          | story `credit` (+ map attribution)                             |
| `TextualBody value`           | `text.text` (`text/html` verbatim)                             |
| target `#x,y,w,h`             | `location.region` (origins clamped)                            |
| annotation / canvas ids       | `uniqueid` + `provenance`                                      |
| `rotation` (non-zero)         | `location.rotation`                                            |
| `filters`                     | `location.filter` (`hue_rotate` → `hueRotate`)                 |
| `passepartout` + color/invert | `location.mask`                                                |
| `audio`                       | `narration` (full flag bag)                                    |
| `image_srv`                   | `location.basemap` (IIIF services and plain image files alike) |
| `image_static`                | `media.url` + story `fallbackUrl`                              |
| `manifest_id`                 | `provenance.manifest` only                                     |

`rotation: 0`, `filters: false`, `passepartout: false` and `audio: false`
are omitted (the viewer defaults match). A target without a fragment, or
with an unusable one, keeps the whole canvas with a warning. Audio that
duplicates the slide media URL is kept once, as media.

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
`slide.provenance`), legacy v1 tours (detected, not mapped), unfollowed
`next` pages (inline documents; the URL loader and CLI follow the chain),
unknown `mode`/`fxmode`/`play` values, unparsable bottom-dock
`textsize`/`hudopacity`/`viewerheight`, overlay enabled without a URL,
malformed targets/annotations. Everything else translates silently, and
every translator output validates against `schema/storymap.schema.json`.

Translated tours render through the slideshow-gated presentation fields
(`slideshow_source`), so internal documents are unaffected — see the
README's slideshow section.
