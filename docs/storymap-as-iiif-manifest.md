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

A manifest carries three context URLs: the Presentation 3.0 context, the
official [navPlace extension](https://iiif.io/api/extension/navplace/) context,
and the StoryMap extension context:

```json
{
    "@context": [
        "http://iiif.io/api/presentation/3/context.json",
        "http://iiif.io/api/extension/navplace/context.json",
        "https://cmahnke.github.io/StoryMapJS/context.json"
    ]
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
        "mapType": "storymap:mapType",
        "mapAsImage": "storymap:mapAsImage",
        "mapAccessToken": "storymap:mapAccessToken",
        "mapBackgroundColor": "storymap:mapBackgroundColor",
        "mapCenterOffset": "storymap:mapCenterOffset",
        "mapSubdomains": "storymap:mapSubdomains",
        "iiifUrl": { "@id": "storymap:iiifUrl", "@type": "@id" },
        "fontCss": "storymap:fontCss",
        "callToAction": "storymap:callToAction",
        "callToActionText": "storymap:callToActionText",
        "startAtSlide": "storymap:startAtSlide",
        "language": "storymap:language",
        "calculateZoom": "storymap:calculateZoom",
        "lessBounce": "storymap:lessBounce",
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
        "georeferencedLayers": "storymap:georeferencedLayers",
        "type": { "@id": "storymap:type", "@type": "@id" },
        "background": "storymap:background",
        "mediaSrcset": "storymap:mediaSrcset",
        "mediaSizes": "storymap:mediaSizes",
        "imageRegion": "storymap:imageRegion",
        "date": "storymap:date"
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
| `storymap:background`  | `slide.background`      | `{url, color}` — only present keys                                                                           |
| `storymap:mediaSrcset` | `slide.media.srcset`    | Responsive image candidates, passed through to the `img` element                                             |
| `storymap:mediaSizes`  | `slide.media.sizes`     | The `sizes` companion of `mediaSrcset`                                                                       |
| `storymap:imageRegion` | `slide.location.region` | `[x, y, w, h]` image pixels (IIIF xywh convention); image stops on image-map slides                          |
| `storymap:date`        | `slide.date`            | String or object, verbatim                                                                                   |
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
- `properties`: marker data — `zoom`, `line`, `icon`, `iconSize`, `image`,
  `use_custom_marker`, `name` (only present keys).
- `location.use_custom_marker` / `use_custom_markers` (manifest) opt into
  custom marker rendering; see the storymap terms below.

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
`storymap:mapType: "iiif"`; since the original zoomify tile paths are dead, the
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
            "profile": "https://christianmahnke.de/iiif/storymap/mapconfig",
            "storymap:mapType": "osm:standard"
        }
    ]
}
```

| Service property (storymap:) | StoryMap field                      | Values                                                                                                            |
| ---------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `mapType`                    | `map_type`                          | `osm:standard`, `mapbox:...`, `stadia:...`, `iiif`, or an `https://...` tile URL; `zoomify` is replaced by `iiif` |
| `mapAsImage`                 | `map_as_image`                      | `true` when the image itself is the map                                                                           |
| `mapAccessToken`             | `map_access_token`                  | Mapbox/Stadia token from the storymap data, never the repository                                                  |
| `mapBackgroundColor`         | `map_background_color`              | CSS color                                                                                                         |
| `mapCenterOffset`            | `map_center_offset`                 | `{left, top}`                                                                                                     |
| `mapSubdomains`              | `map_subdomains`                    | Tile URL subdomains                                                                                               |
| `iiifUrl`                    | `iiif.url`                          | IIIF Image API `info.json` URL for image-map storymaps                                                            |
| `fontCss`                    | `font_css`                          | e.g. `stock:dancing-ledger`                                                                                       |
| `callToAction`               | `call_to_action`                    | boolean                                                                                                           |
| `callToActionText`           | `call_to_action_text`               | string                                                                                                            |
| `startAtSlide`               | `start_at_slide`                    | 0-based slide index                                                                                               |
| `language`                   | `language`                          | IETF language tag                                                                                                 |
| `calculateZoom`              | `calculate_zoom`                    | boolean                                                                                                           |
| `lessBounce`                 | `less_bounce`                       | boolean                                                                                                           |
| `lineFollowsPath`            | `line_follows_path`                 | boolean                                                                                                           |
| `showLines`                  | `show_lines`                        | boolean                                                                                                           |
| `showHistoryLine`            | `show_history_line`                 | boolean                                                                                                           |
| `lineColor`                  | `line_color`                        | CSS color                                                                                                         |
| `lineColorInactive`          | `line_color_inactive`               | CSS color                                                                                                         |
| `lineWeight`                 | `line_weight`                       | number (px)                                                                                                       |
| `lineOpacity`                | `line_opacity`                      | 0–1                                                                                                               |
| `lineDash`                   | `line_dash`                         | CSS dash pattern                                                                                                  |
| `lineJoin`                   | `line_join`                         | CSS line join                                                                                                     |
| `useCustomMarkers`           | `use_custom_markers`                | boolean                                                                                                           |
| `mapArea`                    | `map_area`                          | `"full"` (default) or `"left"`                                                                                    |
| `overviewExtent`             | `overview_extent`                   | `[west, south, east, north]` lon/lat box for the minimap overview                                                 |
| `keyboard`                   | `keyboard`                          | boolean: arrow keys navigate the story from anywhere                                                              |
| `overlays`                   | `overlays`                          | array of stacked layers (see below)                                                                               |
| `georeferencedLayers`        | `overlays[]` (georeference entries) | IIIF images placed from ground control points — see "Geo-referenced layers"                                       |

### Canvas level — direct properties

Canvas objects are open for extension terms, so slide-specific StoryMap data is
carried directly on the Canvas: `storymap:type`, `storymap:background`,
`storymap:date` (see the Canvas table above). The media caption, credit and alt
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
  `storymap:imageRegion` region. A geographic map ignores them.
- `navPlace` may not appear on an Annotation (the extension forbids it), so
  all stops on a Canvas share that Canvas's location and marker presentation.

## What the body record carries

The painting annotation's body is read into one shared record, and the standard
properties are used as **fallbacks** under the extension terms (dropping the
terms and inverting that precedence is [docs/plans/iiif-interop.md](plans/iiif-interop.md)
§2, a separate breaking change):

| Body property                                   | Slide media field                |
| ----------------------------------------------- | -------------------------------- |
| `label`                                         | `caption`                        |
| `requiredStatement[]` (or `provider`)           | `credit`                         |
| `accessibilitySummary`                          | `alt`                            |
| `thumbnail`                                     | `thumb`                          |
| `type`, `format`                                | player selection (`MediaType()`) |
| `duration`, `start`, `end`                      | time-anchored stops              |
| a sibling `TextualBody` with `format: text/vtt` | `subtitles`                      |

## Native IIIF vs. the StoryMap extension

IIIF defines three approved Presentation API extensions — navPlace, Text
Granularity and Georeference — and **no vocabulary for a basemap or a tile
layer stack**. Everything the viewer draws under and over the story (basemap
type, layout, minimap bounds, stacked layers, keyboard navigation) therefore
stays in the `storymap:` terms of the map configuration service, which is the
JSON-LD-idiomatic place for extended configuration. What IIIF _does_ model
natively is used wherever it exists:

| Story                                  | Native IIIF                                                                                           | Used here                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Slide location                         | `navPlace` Point                                                                                      | yes                                                                           |
| Story extent                           | `navPlace` Polygon (an explicit navPlace use case)                                                    | yes — a canvas polygon becomes `map_bbox`                                     |
| Image region stops                     | IIIF Image API Selector (`xywh=`) on the painting annotation target                                   | yes — the selector is read, `storymap:imageRegion` wins when both are present |
| Raster layer placed on a map           | [Georeference Extension](https://iiif.io/api/extension/georef) (GCPs, `motivation: "georeferencing"`) | yes — see below                                                               |
| Basemap, layer stack, layout, keyboard | —                                                                                                     | no; `storymap:` terms                                                         |

### Geo-referenced layers

`storymap:georeferencedLayers` carries the Georeference Extension payload: the
IIIF Image API service to place, its pixel size and the annotation body with
its ground control points (`properties.resourceCoords` ↔
`geometry.coordinates`, WGS84). The viewer fits the points affinely and places
the image, which OpenLayers reprojects onto the view exactly like the IIIF
basemap:

```json
{
    "service": [
        {
            "id": "https://example.org/storymap/<name>/map-config",
            "type": "Service",
            "profile": "https://christianmahnke.de/iiif/storymap/mapconfig",
            "storymap:georeferencedLayers": [
                {
                    "url": "https://iiif.example.org/image1",
                    "width": 5965,
                    "height": 2514,
                    "opacity": 0.8,
                    "attribution": "Sheet 12, 1789",
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

The result is an `overlays[]` entry, so the usual presentation keys
(`opacity`, `visible`, `attribution`, `className`, `blendMode`, `extent`) and
`setOverlayVisible()` / `setOverlayOpacity()` work as for any other layer.
Entries with fewer than three usable points are dropped while reading.

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

Because ground control points cannot be expressed in the legacy storymap
format, this is a **manifest-only** feature: the converter has nothing to
convert from, and `public/examples-iiif/georeferenced-layer.json` (plus its
`-unsupported` counterpart, which shows the skip path) is hand-authored.

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
        "http://iiif.io/api/presentation/3/context.json",
        "http://iiif.io/api/extension/navplace/context.json",
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
            "profile": "https://christianmahnke.de/iiif/storymap/mapconfig",
            "storymap:mapType": "osm:standard",
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
            "storymap:date": "Sep 1"
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
            "storymap:date": "Sep 2",
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
            "storymap:date": "Sep 3",
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

| Legacy field (storymap root) | IIIF path                                                           |
| ---------------------------- | ------------------------------------------------------------------- |
| `slides`                     | `items[]` (Canvas per slide)                                        |
| `language`                   | `service[0].storymap:language`                                      |
| `map_type`                   | `service[0].storymap:mapType` (`zoomify` → `iiif`)                  |
| `map_as_image`               | `service[0].storymap:mapAsImage`                                    |
| `map_mini`                   | _dropped_ (viewer setting, not part of the exchange format)         |
| `map_subdomains`             | `service[0].storymap:mapSubdomains`                                 |
| `map_access_token`           | `service[0].storymap:mapAccessToken`                                |
| `map_background_color`       | `service[0].storymap:mapBackgroundColor`                            |
| `map_center_offset`          | `service[0].storymap:mapCenterOffset`                               |
| `map_popup`                  | _dropped_ (viewer setting)                                          |
| `use_custom_markers`         | `service[0].storymap:useCustomMarkers`                              |
| `map_area`                   | `service[0].storymap:mapArea`                                       |
| `overview_extent`            | `service[0].storymap:overviewExtent`                                |
| `keyboard`                   | `service[0].storymap:keyboard`                                      |
| `overlays`                   | `service[0].storymap:overlays` (+ `storymap:georeferencedLayers`)   |
| `zoom_distance`              | _dropped_ (viewer setting)                                          |
| `calculate_zoom`             | `service[0].storymap:calculateZoom`                                 |
| `less_bounce`                | `service[0].storymap:lessBounce`                                    |
| `line_follows_path`          | `service[0].storymap:lineFollowsPath`                               |
| `show_lines`                 | `service[0].storymap:showLines`                                     |
| `show_history_line`          | `service[0].storymap:showHistoryLine`                               |
| `line_color`                 | `service[0].storymap:lineColor`                                     |
| `line_color_inactive`        | `service[0].storymap:lineColorInactive`                             |
| `line_weight`                | `service[0].storymap:lineWeight`                                    |
| `line_opacity`               | `service[0].storymap:lineOpacity`                                   |
| `line_dash`                  | `service[0].storymap:lineDash`                                      |
| `line_join`                  | `service[0].storymap:lineJoin`                                      |
| `iiif.url`                   | `service[0].storymap:iiifUrl` + canvas Image annotation `service[]` |
| `iiif.attribution`           | `requiredStatement`                                                 |
| `zoomify`                    | _dropped_ (zoomify is replaced by the IIIF reference image)         |
| `font_css`                   | `service[0].storymap:fontCss`                                       |
| `call_to_action`             | `service[0].storymap:callToAction`                                  |
| `call_to_action_text`        | `service[0].storymap:callToActionText`                              |
| `relative_date`              | _dropped_ (viewer setting)                                          |
| `start_at_slide`             | `service[0].storymap:startAtSlide`                                  |
| _(root) `width`, `height`_   | _dropped_ (viewer embed size)                                       |

| Legacy field (slide)           | IIIF path                                                  |
| ------------------------------ | ---------------------------------------------------------- |
| `type: "overview"`             | Canvas `storymap:type: "overview"`                         |
| `date`                         | Canvas `storymap:date`                                     |
| `text.headline`                | Canvas `label` (language map)                              |
| `text.text`                    | Canvas `summary` (language map)                            |
| `location.lat`, `location.lon` | Canvas `navPlace` Feature `geometry.coordinates`           |
| `location.zoom`                | Canvas `navPlace` Feature `properties.zoom`                |
| `location.line`                | Canvas `navPlace` Feature `properties.line`                |
| `location.name`                | Canvas `navPlace` Feature `properties.name`                |
| `location.icon`                | Canvas `navPlace` Feature `properties.icon`                |
| `location.iconSize`            | Canvas `navPlace` Feature `properties.iconSize`            |
| `location.image`               | Canvas `navPlace` Feature `properties.image`               |
| `location.use_custom_marker`   | Canvas `navPlace` Feature `properties.use_custom_marker`   |
| `media.url` (image)            | Annotation body `{type: "Image", format: ...}`             |
| `media.url` (video service)    | Annotation body `{type: "Video"}`                          |
| `media.url` (audio service)    | Annotation body `{type: "Sound"}`                          |
| `media.url` (web page)         | Annotation body `{type: "Text", format: "text/html"}`      |
| `media.url` (absent / HTML)    | Annotation body `{type: "TextualBody", value: ...}`        |
| `media.caption`                | Painting annotation `label`                                |
| `media.credit`                 | Painting annotation `requiredStatement` (`{label, value}`) |
| `media.alt`                    | Painting annotation `accessibilitySummary`                 |
| `media.srcset`                 | Canvas `storymap:mediaSrcset`                              |
| `media.sizes`                  | Canvas `storymap:mediaSizes`                               |
| `location.region`              | Canvas `storymap:imageRegion` `[x, y, w, h]` (xywh)        |
| `media.thumb`                  | _dropped_ (thumbnails may be added via Canvas `thumbnail`) |
| `background`                   | Canvas `storymap:background` `{url, color}`                |
| `uniqueid`                     | _dropped_ (canvas `id`s are the canonical identifiers)     |

## Conversion

`node scripts/convert-to-iiif.mjs` regenerates `public/examples-iiif/` from
`public/examples/`. Ids are deterministic:

- Manifest: `https://example.org/storymap/<name>`
- Canvas: `<manifest-id>/canvas/<n>` (1-based, slide order)
- AnnotationPage: `<canvas-id>/annotationpage/1`
- Annotation: `<canvas-id>/annotation/1`
- FeatureCollection / Feature: `<canvas-id>/navplace[.../feature/1]`

Two fixtures in `public/examples-iiif/` are hand-authored and not overwritten
by a full run: `georeferenced-layer.json` and
`georeferenced-layer-unsupported.json`, which exercise the Georeference
Extension payloads (the legacy format cannot express ground control points, so
there is nothing to convert from).
