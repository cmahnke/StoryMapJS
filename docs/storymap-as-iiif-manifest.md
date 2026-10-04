# StoryMap data as IIIF Presentation 3.0 manifests

A proposal for exchanging StoryMapJS data as
[IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/) manifests so
that stories can be preserved, harvested and re-rendered by IIIF-aware tools.

The legacy format is described by [`schema/storymap.schema.json`](../schema/storymap.schema.json);
the fixtures in [`public/examples/`](../public/examples/) are real-world samples.
`scripts/convert-to-iiif.mjs` converts every fixture to this proposal
([`public/examples-iiif/`](../public/examples-iiif/)), and
`scripts/validate-iiif.mjs` checks every converted manifest against the
[official IIIF presentation validator](https://presentation-validator.iiif.io/)
(`npm run validate:iiif`). All converted fixtures pass the official validator.

## Contexts

A manifest declares four context URLs, in this order: the official
[navPlace extension](https://iiif.io/api/extension/navplace/) context (which
§3.1 of the extension requires before Presentation 3), the Presentation 3.0
context, the navPlace properties context, and the StoryMap extension context.
The last of the four resolves to the document below — shown inline here for
reference; a manifest must reference it by URL, not paste it in (see the
`@context` rule under "Validator interop"):

```json
{
    "@context": {
        "@version": 1.1,
        "storymap": "https://christianmahnke.de/iiif/storymap#",
        "mapAsImage": "storymap:mapAsImage",
        "basemap": "storymap:basemap",
        "tilejson": "storymap:tilejson",
        "mapAccessToken": "storymap:mapAccessToken",
        "mapBackgroundColor": "storymap:mapBackgroundColor",
        "mapCenterOffset": "storymap:mapCenterOffset",
        "fontCss": "storymap:fontCss",
        "callToAction": "storymap:callToAction",
        "callToActionText": "storymap:callToActionText",
        "startAtSlide": "storymap:startAtSlide",
        "language": "storymap:language",
        "calculateZoom": "storymap:calculateZoom",
        "lineFollowsPath": "storymap:lineFollowsPath",
        "showLines": "storymap:showLines",
        "showHistoryLine": "storymap:showHistoryLine",
        "lineColor": "storymap:lineColor",
        "lineColorInactive": "storymap:lineColorInactive",
        "lineWeight": "storymap:lineWeight",
        "lineOpacity": "storymap:lineOpacity",
        "lineDash": "storymap:lineDash",
        "lineJoin": "storymap:lineJoin",
        "useCustomMarkers": "storymap:useCustomMarkers",
        "mapArea": "storymap:mapArea",
        "overviewExtent": "storymap:overviewExtent",
        "keyboard": "storymap:keyboard",
        "overlays": "storymap:overlays",
        "type": {
            "@id": "storymap:type",
            "@type": "@id"
        },
        "mediaSrcset": "storymap:mediaSrcset",
        "mediaSizes": "storymap:mediaSizes"
    }
}
```

### navPlace context (official)

Served at `http://iiif.io/api/extension/navplace/context.json`. It binds the
`navPlace` property to a GeoJSON FeatureCollection:

```json
{
    "@context": {
        "@version": 1.1,
        "iiif_navPlace": "http://iiif.io/api/extension/navplace#",
        "navPlace": {
            "@context": "https://geojson.org/geojson-ld/geojson-context.jsonld",
            "@id": "iiif_navPlace:navPlace"
        }
    }
}
```

### StoryMap context

StoryMap-specific terms use the `storymap:` prefix (the term IRIs live under
`https://christianmahnke.de/iiif/storymap#`). The context document is
[`public/context.json`](../public/context.json) — it ships with the demo build
and is served at `https://cmahnke.github.io/StoryMapJS/context.json`, which is
what the fixtures reference. Content:

```json
{
    "@context": {
        "@version": 1.1,
        "storymap": "https://christianmahnke.de/iiif/storymap#",
        "basemap": "storymap:basemap",
        "tilejson": "storymap:tilejson",
        "mapAsImage": "storymap:mapAsImage",
        "mapAccessToken": "storymap:mapAccessToken",
        "mapBackgroundColor": "storymap:mapBackgroundColor",
        "mapCenterOffset": "storymap:mapCenterOffset",
        "fontCss": "storymap:fontCss",
        "callToAction": "storymap:callToAction",
        "callToActionText": "storymap:callToActionText",
        "startAtSlide": "storymap:startAtSlide",
        "language": "storymap:language",
        "calculateZoom": "storymap:calculateZoom",
        "lineFollowsPath": "storymap:lineFollowsPath",
        "showLines": "storymap:showLines",
        "showHistoryLine": "storymap:showHistoryLine",
        "lineColor": "storymap:lineColor",
        "lineColorInactive": "storymap:lineColorInactive",
        "lineWeight": "storymap:lineWeight",
        "lineOpacity": "storymap:lineOpacity",
        "lineDash": "storymap:lineDash",
        "lineJoin": "storymap:lineJoin",
        "useCustomMarkers": "storymap:useCustomMarkers",
        "mapArea": "storymap:mapArea",
        "overviewExtent": "storymap:overviewExtent",
        "keyboard": "storymap:keyboard",
        "overlays": "storymap:overlays",
        "type": { "@id": "storymap:type", "@type": "@id" },
        "mediaSrcset": "storymap:mediaSrcset",
        "mediaSizes": "storymap:mediaSizes"
    }
}
```

## Manifest ↔ storymap root

| IIIF                    | StoryMap                    | Notes                                                                                                                             |
| ----------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | —                           | `https://example.org/storymap/<name>` (absolute URIs required)                                                                    |
| `type`                  | —                           | `"Manifest"`                                                                                                                      |
| `label`                 | `storymap.title` (extra)    | Language map, e.g. `{"none": ["StoryMapJS"]}`; the legacy format has no title field, so readers keep it as an extra `title` field |
| `items`                 | `storymap.slides`           | One Canvas per slide, in slide order                                                                                              |
| `summary`               | —                           | Optional language map                                                                                                             |
| `provider`              | —                           | Optional publishing institution                                                                                                   |
| `behavior`              | —                           | `["paged"]` — the story is consumed slide by slide                                                                                |
| `requiredStatement`     | `storymap.iiif.attribution` | Only when an attribution is present                                                                                               |
| `navPlace` _(optional)_ | —                           | Optional manifest-level aggregation of canvas locations                                                                           |
| `service` (map config)  | `storymap.*` map settings   | See "StoryMap-specific terms" below                                                                                               |

## Canvas ↔ slide

Each slide becomes one Canvas in `items` order. Canvas ids are
`<manifest-id>/canvas/<n>` (1-based); each Canvas carries a single AnnotationPage
(`<canvas-id>/annotationpage/1`) holding the slide's painted media
(`<canvas-id>/annotation/1`, `motivation: "painting"`, `target: <canvas-id>`).

| IIIF                   | StoryMap                | Notes                                                                                                        |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`, `type`           | —                       | `"Canvas"`                                                                                                   |
| `label`                | `slide.text.headline`   | Language map `{"none": [headline]}`; omitted when the headline is empty                                      |
| `summary`              | `slide.text.text`       | Language map; the slide body text (may contain HTML)                                                         |
| `height`, `width`      | —                       | Nominal `1080 × 1080` for non-image slides; actual image dimensions for image-map slides                     |
| `items`                | `slide.media`           | AnnotationPage with the painting annotation, see below — which also carries the caption, credit and alt text |
| `storymap:type`        | `slide.type`            | `"overview"` marks the map overview slide                                                                    |
| `background`           | `slide.background`      | A painting annotation whose body is an `Image` (the url) and/or a `Color` (the colour)                       |
| `storymap:mediaSrcset` | `slide.media.srcset`    | Responsive image candidates, passed through to the `img` element                                             |
| `storymap:mediaSizes`  | `slide.media.sizes`     | The `sizes` companion of `mediaSrcset`                                                                       |
| _(target selector)_    | `slide.location.region` | `ImageApiSelector` `xywh=pixel:x,y,w,h`; image stops on image-map slides                                     |
| `navDate`              | `slide.date`            | Plain string, verbatim; the official validator applies no format rule at all, so a human date is fine        |
| `navPlace`             | `slide.location`        | See below                                                                                                    |

## Locations via navPlace

Canvas locations use the official
[navPlace extension](https://iiif.io/api/extension/navplace/): each Canvas with
a numeric `location.lat`/`location.lon` carries a `navPlace` FeatureCollection
with one GeoJSON Feature:

- `geometry`: `{type: "Point", coordinates: [lon, lat]}` — the storymap values
  verbatim. For image-map storymaps (`storymap:mapAsImage: true`) the values are
  image coordinates rather than WGS84 degrees; consumers can detect this via
  `storymap:mapAsImage`.
- `properties`: marker data — `name`, `zoom`, `line`, `icon`, `iconSize`,
  `image`, `use_custom_marker`, plus the presentation-only `popup` and
  `audioBadge` (only present keys).
- `location.use_custom_marker` / `use_custom_markers` (manifest) opt into
  custom marker rendering; see the storymap terms below.

Those properties are described by **`https://cmahnke.github.io/StoryMapJS/navplace-properties.json`**,
which a manifest using a `properties` bag should name in its `@context`. The
extension requires it (§3.2): terms in a GeoJSON Feature's `properties` must be
described either by a registered IIIF extension or by a local linked-data
context, and a client that meets a property it does not understand must ignore
it. There is no IIIF extension for marker presentation — navPlace defines
exactly one term, `navPlace` itself — so the local context is the only option.
It is why `popup` and `audioBadge` need no `storymap:` term of their own, and
the same mechanism serves marker config. The nine local names hang off this project's existing namespace
(`https://christianmahnke.de/iiif/storymap#`), not a new one.

### Context order matters

The navPlace extension's context **must be listed before** the Presentation 3
context — §3.1 of the extension:

> The navPlace extension linked data context must be included before the IIIF
> Presentation API 3 linked data context on the top-level object.

So a manifest that uses `navPlace` declares:

```json
"@context": [
    "http://iiif.io/api/extension/navplace/context.json",
    "http://iiif.io/api/presentation/3/context.json",
    "https://cmahnke.github.io/StoryMapJS/navplace-properties.json",
    "https://cmahnke.github.io/StoryMapJS/context.json"
]
```

Getting this backwards does not break a viewer — the reader does not consult
either context — but it does make the document wrong as linked data, which is
the point of shipping a context at all. Every fixture in this repository had it
backwards.

Alternatively a manifest MAY aggregate all slide locations in a single
manifest-level `navPlace` with one Feature per Canvas in `items` order.

## Slide media

The slide's media becomes a painting annotation on the canvas with a typed body:

- Image URLs → `{id, type: "Image", format: "image/jpeg" | ...}`
- Video services (YouTube, Vimeo, Dailymotion, Vine) → `{id, type: "Video"}`
- Audio services (SoundCloud) → `{id, type: "Sound"}`
- Page-embedded media (tweets, Wikipedia, photo pages) → `{id, type: "Text", format: "text/html"}`
- Text-only slides (no media URL, or a media value that is an HTML snippet) →
  `{type: "TextualBody", format: "text/html", value: "<html>"}`

Media URL inference (YouTube players, Twitter embeds, etc.) remains a viewer
concern — manifests carry plain typed bodies and never embed service-specific
logic.

## IIIF image-map slides (replacing zoomify)

Storymaps that paint an image as the map (`map_as_image: true` with `map_type:
"iiif"`, formerly `"zoomify"`) have canvases that paint an Image annotation
whose body references an IIIF Image API service. The canvas dimensions are the
actual image dimensions. Two body variants are valid:

**(a) plain image body:**

```json
{
    "id": "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon/full/max/0/default.jpg",
    "type": "Image",
    "format": "image/jpeg",
    "width": 2315,
    "height": 3000
}
```

**(b) body with an ImageService3 reference (preferred):**

```json
{
    "id": "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon/full/max/0/default.jpg",
    "type": "Image",
    "format": "image/jpeg",
    "width": 2315,
    "height": 3000,
    "service": [
        {
            "id": "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon/info.json",
            "type": "ImageService3",
            "profile": "level2"
        }
    ]
}
```

The converter emits variant (b). Legacy `zoomify` storymaps are converted to
`storymap:basemap: "iiif"`; since the original zoomify tile paths are dead, the
converter substitutes the IIIF reference image above (the legacy pyramid
definition is not carried — nothing reads it).

## StoryMap-specific terms

### Manifest level — via a map configuration service

The official validator validates manifests against a JSON Schema whose Manifest
class is closed (`additionalProperties: false`), so manifest-level StoryMap
settings cannot be placed directly on the Manifest object. They live on a
dedicated extension service instead — a JSON-LD-idiomatic place for extended
configuration, and one the validator accepts (`service` entries allow extra
properties):

```json
{
    "service": [
        {
            "id": "https://example.org/storymap/<name>/map-config",
            "type": "Service",
            "profile": "https://cmahnke.github.io/StoryMapJS/context.json/mapconfig",
            "storymap:basemap": "osm:standard"
        }
    ]
}
```

### TileJSON for a tile service

A keyword basemap and a tile URL template are different kinds of thing, and
`mapType` used to be both. They are now separate: `storymap:basemap` names a
source the viewer knows how to configure, and an **unprefixed** `tilejson`
object describes any other tile service in the standard's own terms. Only
`tiles` is required:

```json
{
    "service": [
        {
            "id": "https://example.org/storymap/<name>/map-config",
            "type": "Service",
            "profile": "https://cmahnke.github.io/StoryMapJS/context.json/mapconfig",
            "tilejson": {
                "tiles": ["https://tiles.example.org/{z}/{x}/{y}.png"],
                "minzoom": 4,
                "maxzoom": 17,
                "bounds": [-122.7, 37.1, -121.1, 38.1],
                "scheme": "tms",
                "center": [4.4777, 51.9244, 12]
            }
            // `tiles` may also be a single template string — that is what the
            // converter writes. The reader accepts both forms.
        }
    ]
}
```

`tiles` becomes `map_type`, so everything that dispatches on a template (the
`tile_source_factory` option, attribution, the minimap) works unchanged. The
rest is honoured where the map can act on it:

| Member    | Effect                                                                    |
| --------- | ------------------------------------------------------------------------- |
| `tiles`   | the tile URL template, as `map_type`                                      |
| `minzoom` | the view's minimum zoom, and the tile grid's range                        |
| `maxzoom` | the view's maximum zoom, and the tile grid's range                        |
| `bounds`  | a `[west, south, east, north]` lon/lat box the view center is kept inside |
| `scheme`  | `tms` flips the tile row, which is counted from the bottom in TMS         |
| `center`  | `[lon, lat, zoom]`, the initial view                                      |

The `center` is the initial view only, and `bounds` constrains the center
without pinning the resolution — a hard extent constraint would fight the panel
offset, the same reason `map_bbox` works the way it does.

| Service property (storymap:)  | StoryMap field                      | Values                                                                                                                                          |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `basemap`                     | `map_type`                          | A keyword the viewer configures itself: `osm:standard`, `mapbox://styles/...`, `stadia:...`, `iiif`. `zoomify` is replaced by `iiif`            |
| _(unprefixed)_ `tilejson`     | `map_type` + `tilejson`             | TileJSON 2.1 for an arbitrary tile service — see below                                                                                          |
| `mapAsImage`                  | `map_as_image`                      | `true` when the image itself is the map                                                                                                         |
| `mapAccessToken`              | `map_access_token`                  | Mapbox/Stadia token from the storymap data, never the repository                                                                                |
| `mapBackgroundColor`          | `map_background_color`              | CSS color                                                                                                                                       |
| `mapCenterOffset`             | `map_center_offset`                 | `{left, top}`                                                                                                                                   |
| `mapSubdomains`               | `map_subdomains`                    | Tile URL subdomains                                                                                                                             |
| _(none)_                      | `iiif.url`                          | From the Image API `service[]` a painting body carries, plus `/info.json`; see below                                                            |
| `fontCss`                     | `font_css`                          | e.g. `stock:dancing-ledger`, or `false` for no injected theme                                                                                   |
| `callToAction`                | `call_to_action`                    | boolean                                                                                                                                         |
| `callToActionText`            | `call_to_action_text`               | string                                                                                                                                          |
| `startAtSlide`                | `start_at_slide`                    | 0-based slide index                                                                                                                             |
| `language`                    | `language`                          | IETF language tag                                                                                                                               |
| `calculateZoom`               | `calculate_zoom`                    | boolean                                                                                                                                         |
| `lessBounce`                  | `less_bounce`                       | boolean                                                                                                                                         |
| `lineFollowsPath`             | `line_follows_path`                 | boolean                                                                                                                                         |
| `showLines`                   | `show_lines`                        | boolean                                                                                                                                         |
| `showHistoryLine`             | `show_history_line`                 | boolean                                                                                                                                         |
| `lineColor`                   | `line_color`                        | CSS color                                                                                                                                       |
| `lineColorInactive`           | `line_color_inactive`               | CSS color                                                                                                                                       |
| `lineWeight`                  | `line_weight`                       | number (px)                                                                                                                                     |
| `lineOpacity`                 | `line_opacity`                      | 0–1                                                                                                                                             |
| `lineDash`                    | `line_dash`                         | CSS dash pattern                                                                                                                                |
| `lineJoin`                    | `line_join`                         | CSS line join                                                                                                                                   |
| `useCustomMarkers`            | `use_custom_markers`                | boolean                                                                                                                                         |
| `mapArea`                     | `map_area`                          | `"full"` (default) or `"left"`                                                                                                                  |
| `overviewExtent`              | `overview_extent`                   | `[west, south, east, north]` lon/lat box for the minimap overview                                                                               |
| `keyboard`                    | `keyboard`                          | boolean: arrow keys navigate the story from anywhere                                                                                            |
| `overlays`                    | `overlays`                          | array of stacked layers (see below)                                                                                                             |
| _(georeferencing annotation)_ | `overlays[]` (georeference entries) | IIIF images placed from ground control points — see "Geo-referenced layers"                                                                     |
| _(viewer option)_             | `show_layers_control`, `basemaps`   | the layer switcher and its basemap list: viewer-side only, never read from a manifest; `label` functions likewise never cross the JSON boundary |

### Canvas level — direct properties

Canvas objects are open for extension terms, so slide-specific StoryMap data is
carried directly on the Canvas: `storymap:type`, plus the two terms with no
standard home, `storymap:mediaSrcset` and `storymap:mediaSizes` (see the
Canvas table above). A slide's date is the standard `navDate` and its
background is the standard `background` annotation. The media caption, credit and alt
text are **not** terms any more: they are the painting annotation's own `label`,
`requiredStatement` and `accessibilitySummary`, which is where Presentation 3
defines them. A manifest written against the old terms still loads — the strings
are simply no longer read.

Readers must use the prefixed term for the slide type (`storymap:type`): the
bare `type` key of a Canvas is the IIIF class type (`"Canvas"`) and can never
carry the StoryMap slide type.

## Annotation-driven tour stops

A Canvas annotation whose `motivation` is `commenting`, `tagging`,
`classifying` or `describing` and whose target resolves to a region becomes
one slide, appended after that Canvas's own slide. This is the shape Storiiies
and Micrio use for a guided tour of one image, and it is the subject of
[docs/iiif-authoring.md](iiif-authoring.md).

- **Target** — `xywh=` fragment / Image API Selector, or a `PointSelector`
  (synthesized into a square of 5% of the Canvas's smaller side, centred and
  clamped). A `TextQuoteSelector`, `TimeState` or `SvgSelector` is preserved
  but not resolved or drawn. A bare string target's `#xywh=` counts. An
  annotation aimed at the whole Canvas is **not** a stop.
- **Body** — a `TextualBody` supplies the slide text (`text/plain` escaped and
  split per blank-line block, `text/html` kept as markup); a body with an
  `id` (e.g. `type: "Sound"`) supplies `media.url`, whose extension picks the
  player. An annotation with a region but no body is not a stop.
- **Region stops are honoured in image mode** only — the same rule as a
  `xywh=pixel:` region. A geographic map ignores them.
- `navPlace` may not appear on an Annotation (the extension forbids it), so
  all stops on a Canvas share that Canvas's location and marker presentation.

## What the body record carries

The painting annotation's body is read into one shared record. The
`storymap:mediaCaption` / `mediaCredit` / `mediaAlt` extension terms are
dropped — a manifest still using them loads, but the strings are not read —
and the standard properties are the only source:

| Body property                                                   | Slide media field                |
| --------------------------------------------------------------- | -------------------------------- |
| `label`                                                         | `caption`                        |
| `requiredStatement` (one `{label, value}` object) or `provider` | `credit`                         |
| `accessibilitySummary`                                          | `alt`                            |
| `thumbnail`                                                     | `thumb`                          |
| `type`, `format`                                                | player selection (`MediaType()`) |
| `duration`, `start`, `end`                                      | time-anchored stops              |
| a sibling `TextualBody` with `format: text/vtt`                 | `subtitles`                      |

## Native IIIF vs. the StoryMap extension

IIIF defines three approved Presentation API extensions — navPlace, Text
Granularity and Georeference — and **no vocabulary for a basemap or a tile
layer stack**. Everything the viewer draws under and over the story (basemap
type, layout, minimap bounds, stacked layers, keyboard navigation) therefore
stays in the `storymap:` terms of the map configuration service, which is the
JSON-LD-idiomatic place for extended configuration. What IIIF _does_ model
natively is used wherever it exists:

| Story                                  | Native IIIF                                                                                           | Used here                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Slide location                         | `navPlace` Point                                                                                      | yes                                          |
| Story extent                           | `navPlace` Polygon (an explicit navPlace use case)                                                    | yes — a canvas polygon becomes `map_bbox`    |
| Image region stops                     | `ImageApiSelector` `xywh=pixel:` on the painting annotation target                                    | yes — the selector is the only source (§2.8) |
| Raster layer placed on a map           | [Georeference Extension](https://iiif.io/api/extension/georef) (GCPs, `motivation: "georeferencing"`) | yes — see below                              |
| Basemap, layer stack, layout, keyboard | —                                                                                                     | no; `storymap:` terms                        |

### Groups and the slide order

`structures` does two jobs. A Range with a `label` and no `start` is a **group**,
and every canvas it contains gets that value as `slide.group`; nested Ranges are
chapters inside it, and the outermost labelled Range is the group. And the order
canvases appear in is the **slide order** — a Range is allowed to run them in a
order the document does not, which is what a storyboard is for:

```json
{
    "structures": [
        {
            "id": "https://example.org/storymap/<name>/range/1",
            "type": "Range",
            "label": { "none": ["Act I"] },
            "items": [
                "https://example.org/storymap/<name>/canvas/1",
                "https://example.org/storymap/<name>/canvas/3"
            ]
        }
    ]
}
```

A canvas in no Range keeps its document position, after the ones a Range does
mention. A Range with a `start` is a time segment of a canvas, not a group: it
contributes order and nothing else.

### Deep links and external annotations

Two things a manifest can offer that a viewer used to ignore.

**A stop can be linked by its identity.** Every canvas id is a `uniqueid`
(§2.3), so a stop is addressable by something that survives a slide being
inserted above it. The viewer writes both forms:

| Where            | Form                                                         | Example                               |
| ---------------- | ------------------------------------------------------------ | ------------------------------------- |
| `change` payload | `current_id`, next to `current_slide`                        | —                                     |
| URL hash         | `#slide-<uniqueid>`, or `#slide-3` for a storymap-JSON slide | `#slide-https%3A%2F%2F…%2Fcanvas%2F3` |
| Query parameter  | `iiif-content`, IIIF Content State 1.0                       | `?iiif-content=https://…/canvas/3`    |

Both are read on load, and the hash again on every `hashchange`, so browser
back/forward keeps working. The index form is still accepted, so links shared
before ids were emitted keep resolving.

The `iiif-content` parameter is the standard's own format and follows its
encoding rule, which is deliberately asymmetric: a **plain URI is written
unencoded**, a **JSON-LD form is content-state-encoded** (base64url, no
padding). A whole canvas is therefore a bare target URI, while a region — which
the spec says a bare URI cannot express — is the encoded Target Body:

```json
{
    "target": {
        "type": "SpecificResource",
        "source": { "id": "https://example.org/canvas/7", "type": "Canvas" },
        "selector": { "type": "ImageApiSelector", "value": "xywh=pixel:10,20,30,40" }
    }
}
```

**External annotations.** A manifest's `seeAlso` points at annotation
collections or pages that live on an annotation server. They are recorded on the
data as `see_also` but **not fetched** — reading them is a network round trip
per document, and a viewer should not block its first paint on a third party. A
host opts in:

```js
const { stops, searchService, failed } = await storymap.loadAnnotations();
```

which fetches, merges the annotations for the canvases being rendered into tour
stops, and fires `annotationsloaded` with the same value. A `SearchService1` in
`seeAlso` is reported as `searchService` rather than followed. One level of
indirection is followed, so a collection may reference its pages, but a cycle
cannot become an infinite walk. Fetching is cached per document, so two calls
share one request.

### Institutional credit

A manifest says who published it and under what licence, and all of it ends up
on the one credit line the viewer renders — the map attribution the host can
also feed with `setExtraAttributions()`:

| Manifest property   | Becomes                             |
| ------------------- | ----------------------------------- |
| `requiredStatement` | `Attribution: <value>`              |
| `provider` (Agent)  | `Provider: <label, or the id>`      |
| `rights`            | `Licence: <uri>`                    |
| `homepage` (Agent)  | the Agent's label or id, unlabelled |

They are joined with `·` in that order. `logo` is an image rather than a
credit line, so it is offered as `data.logo`, and `metadata`'s label/value
pairs are handed on as `data.metadata[]` — arbitrary pairs cannot be rendered
generically, and dropping them loses provenance.

The converter writes a `metadata` pair reading "Generated by: StoryMapJS"
rather than claiming to be the manifest's `provider`. P3's `provider` is
whoever published the content, and the converter does not know that; writing
itself there would put "Provider: StoryMapJS" on the credit line of every
converted storymap.

### Geo-referenced layers

A `motivation: "georeferencing"` annotation carries the Georeference Extension
payload: the IIIF Image API service to place in its `target`, and its ground
control points (`properties.resourceCoords` ↔ `geometry.coordinates`, WGS84) in
its `body`. Per the extension, a layer that is not part of the canvas it ships
in — which is every map layer — embeds the image it places in `target` rather
than referencing it. The viewer fits the points affinely and places the image,
which OpenLayers reprojects onto the view exactly like the IIIF basemap:

```json
{
    "items": [
        {
            "id": "https://example.org/storymap/<name>/canvas/1",
            "type": "Canvas",
            "items": [
                {
                    "id": "https://example.org/storymap/<name>/canvas/1/georeferencing/1",
                    "type": "Annotation",
                    "motivation": "georeferencing",
                    "target": {
                        "id": "https://iiif.example.org/image1",
                        "type": "Image",
                        "width": 5965,
                        "height": 2514,
                        "service": [
                            {
                                "id": "https://iiif.example.org/image1",
                                "type": "ImageService3",
                                "profile": "level2"
                            }
                        ]
                    },
                    "requiredStatement": {
                        "label": { "none": ["Attribution"] },
                        "value": { "none": ["Sheet 12, 1789"] }
                    },
                    "body": {
                        "type": "FeatureCollection",
                        "transformation": { "type": "polynomial", "options": { "order": 1 } },
                        "features": [
                            {
                                "type": "Feature",
                                "properties": { "resourceCoords": [5085, 782] },
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": [4.4885839, 51.9101828]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
}
```

An annotation is canvas-scoped but the layer it describes is map-wide, so the
annotations are collected from **every** canvas: a layer annotated on the first
canvas still applies to the whole story. `requiredStatement` is read as the
layer's attribution. The other presentation keys the term could carry —
`opacity`, `visible`, `className`, `blendMode` — have no IIIF vocabulary for a
georeferencing annotation and are not read; the extent is not lost in substance,
because the control points describe it. Entries with fewer than three usable
points are dropped while reading.

**A caveat about the official validator.** The Presentation 3.0 validator checks
against the base JSON Schema, which predates the Georeference Extension, so it
rejects a `FeatureCollection` body and an embedded `Image` target with _"is not
valid under any of the given schemas"_ — even with the extension's own context
declared, which does resolve at
`http://iiif.io/api/extension/georef/1/context.json`. We keep the extension's
spelling anyway: a georeferenced manifest that other IIIF tools can read is
worth more than one this particular validator accepts. `npm run validate:iiif`
reports the two georeferenced fixtures as _not covered_ rather than as failures,
with that reason.

The result is an `overlays[]` entry, so `setOverlayVisible()` /
`setOverlayOpacity()` and the rest of the layer API work on it as for any other
layer. A storymap-JSON `overlays[]` entry may carry a `georeference` in place
of a `map_type`, which is the shape the converter writes these annotations
from.

**Limits.** The extension also allows second/third-order polynomials, thin
plate splines and rotated or skewed sheets. OpenLayers places an image as an
axis-aligned extent, so the viewer fits the affine (first-order) case only:
anything else is reported in the console and skipped rather than drawn in the
wrong place. For true warping, plug
[Allmaps' `WarpedMapLayer`](https://www.npmjs.com/package/@allmaps/openlayers)
(or any OpenLayers layer) into the `tile_source_factory` option and keep the
georeference data on your side — see the "IIIF extensions" recipe in
[docs/migration-from-knightlab.md](migration-from-knightlab.md). Image-space
maps (`map_as_image`, zoomify) have no geographic view, so a placed sheet is
skipped there as well.

A storymap-JSON `overlays[]` entry can carry a `georeference` — url, width,
height and the FeatureCollection body — instead of a `map_type`, and the
converter writes it as the annotation above, on the first canvas. The two
georeferenced fixtures are still hand-authored: they are the only manifests in
the set with no storymap-JSON source. `georeferenced-layer.json` places its
sheet; `georeferenced-layer-unsupported.json` shows the skip path.

## Validator interop

The official IIIF presentation validator
(`https://presentation-validator.iiif.io/validate?version=3.0&format=json`)
validates manifests with a static JSON Schema:

- `navPlace` (manifest- and canvas-level) is part of the schema and passes;
  GeoJSON Feature `properties` are open objects and tolerate marker data.
- Canvas objects are open and tolerate `storymap:` terms.
- The Manifest object is **closed** — `storymap:` terms directly on the Manifest
  are rejected, hence the map configuration service described above.
- `@context` entries must be URI strings; a StoryMap namespace cannot be
  declared inline but must be referenced by URL.

`npm run validate:iiif` posts every manifest in `public/examples-iiif/` to the
official validator and fails CI when any of them is rejected.

## Worked example

A small hurricane storymap: an overview slide (text-only media), a slide with a
photo, and a slide with a YouTube video — full manifest:

```json
{
    "@context": [
        "http://iiif.io/api/extension/navplace/context.json",
        "http://iiif.io/api/presentation/3/context.json",
        "https://cmahnke.github.io/StoryMapJS/navplace-properties.json",
        "https://cmahnke.github.io/StoryMapJS/context.json"
    ],
    "id": "https://example.org/storymap/storm",
    "type": "Manifest",
    "label": { "none": ["storm"] },
    "behavior": ["paged"],
    "provider": [
        {
            "id": "https://example.org/",
            "type": "Agent",
            "label": { "none": ["StoryMapJS"] }
        }
    ],
    "service": [
        {
            "id": "https://example.org/storymap/storm/map-config",
            "type": "Service",
            "profile": "https://cmahnke.github.io/StoryMapJS/context.json/mapconfig",
            "storymap:basemap": "osm:standard",
            "storymap:language": "en",
            "storymap:showLines": true,
            "storymap:showHistoryLine": true,
            "storymap:lineColor": "#c0392b",
            "storymap:lineWeight": 3,
            "storymap:lineOpacity": 0.8
        }
    ],
    "items": [
        {
            "id": "https://example.org/storymap/storm/canvas/1",
            "type": "Canvas",
            "height": 1080,
            "width": 1080,
            "label": { "none": ["The Path of the Storm"] },
            "summary": { "none": ["A storm formed over the warm ocean."] },
            "items": [
                {
                    "id": "https://example.org/storymap/storm/canvas/1/annotationpage/1",
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "id": "https://example.org/storymap/storm/canvas/1/annotation/1",
                            "type": "Annotation",
                            "motivation": "painting",
                            "body": {
                                "type": "TextualBody",
                                "format": "text/html",
                                "value": "A storm formed over the warm ocean."
                            },
                            "target": "https://example.org/storymap/storm/canvas/1"
                        }
                    ]
                }
            ],
            "storymap:type": "overview",
            "navDate": "Sep 1"
        },
        {
            "id": "https://example.org/storymap/storm/canvas/2",
            "type": "Canvas",
            "height": 1080,
            "width": 1080,
            "label": { "none": ["Sep 2"] },
            "summary": { "none": ["The storm made landfall."] },
            "items": [
                {
                    "id": "https://example.org/storymap/storm/canvas/2/annotationpage/1",
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "id": "https://example.org/storymap/storm/canvas/2/annotation/1",
                            "type": "Annotation",
                            "motivation": "painting",
                            "body": {
                                "id": "https://example.org/images/landfall.jpg",
                                "type": "Image",
                                "format": "image/jpeg"
                            },
                            "target": "https://example.org/storymap/storm/canvas/2",
                            "label": "Landfall",
                            "requiredStatement": {
                                "label": { "none": ["Credit"] },
                                "value": { "none": ["Weather Service"] }
                            }
                        }
                    ]
                }
            ],
            "navDate": "Sep 2",
            "navPlace": {
                "id": "https://example.org/storymap/storm/canvas/2/navplace",
                "type": "FeatureCollection",
                "features": [
                    {
                        "id": "https://example.org/storymap/storm/canvas/2/navplace/feature/1",
                        "type": "Feature",
                        "geometry": { "type": "Point", "coordinates": [-89.6, 28.2] },
                        "properties": { "zoom": 10, "line": true }
                    }
                ]
            }
        },
        {
            "id": "https://example.org/storymap/storm/canvas/3",
            "type": "Canvas",
            "height": 1080,
            "width": 1080,
            "label": { "none": ["Sep 3"] },
            "items": [
                {
                    "id": "https://example.org/storymap/storm/canvas/3/annotationpage/1",
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "id": "https://example.org/storymap/storm/canvas/3/annotation/1",
                            "type": "Annotation",
                            "motivation": "painting",
                            "body": {
                                "id": "https://www.youtube.com/watch?v=example",
                                "type": "Video"
                            },
                            "target": "https://example.org/storymap/storm/canvas/3",
                            "requiredStatement": {
                                "label": { "none": ["Credit"] },
                                "value": { "none": ["News"] }
                            }
                        }
                    ]
                }
            ],
            "navDate": "Sep 3",
            "navPlace": {
                "id": "https://example.org/storymap/storm/canvas/3/navplace",
                "type": "FeatureCollection",
                "features": [
                    {
                        "id": "https://example.org/storymap/storm/canvas/3/navplace/feature/1",
                        "type": "Feature",
                        "geometry": { "type": "Point", "coordinates": [-90.1, 29.9] },
                        "properties": { "zoom": 9, "line": true }
                    }
                ]
            }
        }
    ]
}
```

## Full mapping table

| Legacy field (storymap root) | IIIF path                                                               |
| ---------------------------- | ----------------------------------------------------------------------- |
| `slides`                     | `items[]` (Canvas per slide)                                            |
| `language`                   | `service[0].storymap:language`                                          |
| `map_type`                   | `service[0].storymap:basemap` (`zoomify` → `iiif`), or `tilejson.tiles` |
| `map_as_image`               | `service[0].storymap:mapAsImage`                                        |
| `map_mini`                   | _dropped_ (viewer setting, not part of the exchange format)             |
| `map_subdomains`             | _dropped_ (inert, no reader)                                            |
| `map_access_token`           | `service[0].storymap:mapAccessToken`                                    |
| `map_background_color`       | `service[0].storymap:mapBackgroundColor`                                |
| `map_center_offset`          | `service[0].storymap:mapCenterOffset`                                   |
| `map_popup`                  | _dropped_ (viewer setting)                                              |
| `use_custom_markers`         | `service[0].storymap:useCustomMarkers`                                  |
| `map_area`                   | `service[0].storymap:mapArea`                                           |
| `overview_extent`            | `service[0].storymap:overviewExtent`                                    |
| `keyboard`                   | `service[0].storymap:keyboard`                                          |
| `overlays` (georeference)    | Georeferencing annotation `target` + `body`                             |
| `zoom_distance`              | _dropped_ (viewer setting)                                              |
| `calculate_zoom`             | `service[0].storymap:calculateZoom`                                     |
| `less_bounce`                | _dropped_ (inert, no reader)                                            |
| `line_follows_path`          | `service[0].storymap:lineFollowsPath`                                   |
| `show_lines`                 | `service[0].storymap:showLines`                                         |
| `show_history_line`          | `service[0].storymap:showHistoryLine`                                   |
| `line_color`                 | `service[0].storymap:lineColor`                                         |
| `line_color_inactive`        | `service[0].storymap:lineColorInactive`                                 |
| `line_weight`                | `service[0].storymap:lineWeight`                                        |
| `line_opacity`               | `service[0].storymap:lineOpacity`                                       |
| `line_dash`                  | `service[0].storymap:lineDash`                                          |
| `line_join`                  | `service[0].storymap:lineJoin`                                          |
| `iiif.url`                   | Canvas Image annotation `service[0].id` + `/info.json`                  |
| `iiif.attribution`           | `requiredStatement`                                                     |
| `zoomify`                    | _dropped_ (zoomify is replaced by the IIIF reference image)             |
| `font_css`                   | `service[0].storymap:fontCss` (`false` disables the injected theme)     |
| `call_to_action`             | `service[0].storymap:callToAction`                                      |
| `call_to_action_text`        | `service[0].storymap:callToActionText`                                  |
| `relative_date`              | _dropped_ (viewer setting)                                              |
| `start_at_slide`             | `service[0].storymap:startAtSlide`                                      |
| _(root) `width`, `height`_   | _dropped_ (viewer embed size)                                           |

| Legacy field (slide)           | IIIF path                                                                   |
| ------------------------------ | --------------------------------------------------------------------------- |
| `type: "overview"`             | Canvas `storymap:type: "overview"`                                          |
| `date`                         | Canvas `navDate`                                                            |
| `text.headline`                | Canvas `label` (language map)                                               |
| `text.text`                    | Canvas `summary` (language map)                                             |
| `location.lat`, `location.lon` | Canvas `navPlace` Feature `geometry.coordinates`                            |
| `location.zoom`                | Canvas `navPlace` Feature `properties.zoom`                                 |
| `location.line`                | Canvas `navPlace` Feature `properties.line`                                 |
| `location.name`                | Canvas `navPlace` Feature `properties.name`                                 |
| `location.icon`                | Canvas `navPlace` Feature `properties.icon`                                 |
| `location.iconSize`            | Canvas `navPlace` Feature `properties.iconSize`                             |
| `location.image`               | Canvas `navPlace` Feature `properties.image`                                |
| `location.use_custom_marker`   | Canvas `navPlace` Feature `properties.use_custom_marker`                    |
| `media.url` (image)            | Annotation body `{type: "Image", format: ...}`                              |
| `media.url` (video service)    | Annotation body `{type: "Video"}`                                           |
| `media.url` (audio service)    | Annotation body `{type: "Sound"}`                                           |
| `media.url` (web page)         | Annotation body `{type: "Text", format: "text/html"}`                       |
| `media.url` (absent / HTML)    | Annotation body `{type: "TextualBody", value: ...}`                         |
| `media.caption`                | Painting annotation `label`                                                 |
| `media.credit`                 | Painting annotation `requiredStatement` (`{label, value}`)                  |
| `media.alt`                    | Painting annotation `accessibilitySummary`                                  |
| `media.srcset`                 | Canvas `storymap:mediaSrcset`                                               |
| `media.sizes`                  | Canvas `storymap:mediaSizes`                                                |
| `location.region`              | Painting annotation target `ImageApiSelector` `xywh=pixel:`                 |
| `media.thumb`                  | Canvas `thumbnail[]` or the body `thumbnail[]`                              |
| `background`                   | Canvas `background` painting annotation (Image + Color body)                |
| `uniqueid`                     | Canvas `id`                                                                 |
| `group`                        | A `structures` Range label; the Range order is the slide order              |
| `language` (per slide)         | The language tag the slide's text was read in (§3.4)                        |
| `logo`, `metadata`             | Read into `data.logo` / `data.metadata[]`                                   |
| `tilejson`                     | `service[0].tilejson`                                                       |
| `title`                        | Manifest `label` (a label is required, so the converter uses the file name) |

## Conversion

`npm run convert:iiif` regenerates `public/examples-iiif/` from
`public/examples/` (it needs Node 22.6+, since the script imports the
TypeScript library source via type stripping). Ids are deterministic:

- Manifest: `https://example.org/storymap/<name>`
- Canvas: `<manifest-id>/canvas/<n>` (1-based, slide order)
- AnnotationPage: `<canvas-id>/annotationpage/1`
- Annotation: `<canvas-id>/annotation/1`
- FeatureCollection / Feature: `<canvas-id>/navplace[.../feature/1]`

Three fixtures in `public/examples-iiif/` are hand-authored and not
overwritten by a full run: `georeferenced-layer.json` and
`georeferenced-layer-unsupported.json`, which exercise the Georeference
Extension payloads (the legacy format cannot express ground control points,
so there is nothing to convert from), and `annotated-image.json`, the
annotation-driven tour (there is no storymap document to convert from —
annotation stops only exist on the manifest side).
