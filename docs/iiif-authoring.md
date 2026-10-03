# Authoring IIIF stories and tours

How to encode a story as a IIIF Presentation 3 manifest that this viewer
reads, including the annotation-driven tour stops it accepts.

The viewer also reads legacy storymap JSON; see the
[README](../README.md) for that format. This page covers the IIIF side.
[docs/storymap-as-iiif-manifest.md](storymap-as-iiif-manifest.md) documents the
full property mapping; this page is the task-oriented version.

## The shortest possible story

One canvas, one slide:

```json
{
    "@context": "http://iiif.io/api/presentation/3/context.json",
    "id": "https://example.org/story/1",
    "type": "Manifest",
    "label": { "en": ["A story"] },
    "items": [
        {
            "id": "https://example.org/story/1/canvas/1",
            "type": "Canvas",
            "height": 3000,
            "width": 2315,
            "label": { "en": ["The first slide"] },
            "summary": { "en": ["Its body text."] },
            "items": [
                {
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "type": "Annotation",
                            "motivation": "painting",
                            "body": {
                                "id": "https://example.org/image/full/max/0/default.jpg",
                                "type": "Image",
                                "format": "image/jpeg",
                                "service": [
                                    {
                                        "id": "https://example.org/image/info.json",
                                        "type": "ImageService3",
                                        "profile": "level2"
                                    }
                                ]
                            },
                            "target": "https://example.org/story/1/canvas/1"
                        }
                    ]
                }
            ]
        }
    ]
}
```

One canvas is one slide: `label` becomes the headline, `summary` the body
text, and the painting annotation's body the slide media. There is also one
slide for a Canvas that has no painting at all.

That `service` array on the body is also where the basemap comes from. With
`storymap:basemap: "iiif"` the viewer takes the first painting body carrying an
`ImageService3` as the image basemap and fetches its `info.json`, which is how
`iiif.url` is resolved — so the basemap service is spelled the standard way and
needs no mapconfig term.

## Guided tours: one image, many stops

This is the Micrio/Storiiies shape and the reason the format exists here: a
single canvas shown as a map, with one slide per detail. An annotation with
`commenting`, `tagging`, `classifying` or `describing` and a **fragment
target** becomes a slide, and the view fits the region the target points at.

Two things are required:

1. The canvas must be presented as an image map — a
   [map configuration service](storymap-as-iiif-manifest.md#manifest--service)
   with `storymap:basemap: "iiif"` and `storymap:mapAsImage: true`. Region
   stops are honoured in image mode; a geographic map ignores them.
2. The target must resolve to a region. An annotation aimed at the whole
   canvas is not a stop — the canvas slide already shows that.

```json
"service": [
    {
        "id": "https://example.org/story/1/map-config",
        "type": "Service",
        "profile": "https://cmahnke.github.io/StoryMapJS/context.json/mapconfig",
        "storymap:basemap": "iiif",
        "storymap:mapAsImage": true
    }
]
```

Then the stops, on the canvas, after its painting:

```json
{
    "type": "AnnotationPage",
    "items": [
        {
            "id": "https://example.org/story/1/canvas/1/annotation/2",
            "type": "Annotation",
            "motivation": "commenting",
            "label": { "en": ["The lower group"] },
            "body": {
                "type": "TextualBody",
                "format": "text/plain",
                "value": "First paragraph.\n\nSecond paragraph."
            },
            "target": {
                "type": "SpecificResource",
                "source": "https://example.org/story/1/canvas/1",
                "selector": {
                    "type": "FragmentSelector",
                    "value": "xywh=120,1500,1100,900"
                }
            }
        }
    ]
}
```

The annotation `label` becomes the stop's headline — that is what the slider
and the map marker show. Stops render in annotation order, after the canvas
slide.

### Target selectors

| Selector                                                    | Becomes                                                                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `FragmentSelector` / `ImageApiSelector` with `xywh=x,y,w,h` | that image-pixel region. `xywh=pixel:…` works too                                                                                  |
| `PointSelector` (`x`, `y`)                                  | a square of 5% of the canvas's smaller side, centred on the point and clamped to the canvas — a pin you can fit                    |
| `TextQuoteSelector` (`exact`, optional `prefix`/`suffix`)   | preserved; **not resolved**, because a canvas carries no transcript. Use it to anchor a stop to quoted text in a tool that has one |
| `TimeState` (`start`, `end`) or a `start`/`end` range       | preserved on the stop; a time-ranged narration can be built from it                                                                |
| `SvgSelector`                                               | preserved; the viewer fits the bounding region, it does not draw the true outline yet                                              |

One level of `refinedBy` is followed, so a fragment refined by a quote works.

### Bodies

A stop's `body` may be one resource or an array.

- **Text** — a `TextualBody` becomes the slide text. `text/plain` is escaped
  and split into one paragraph per blank-line-separated block; `text/html` is
  kept as markup. Slide text is sanitized when it renders, so a body cannot
  inject script.
- **Media** — a body with an `id` (typically `type: "Sound"`) becomes
  `media.url`. The viewer resolves the URL to a player: a `.mp3`/`.wav`/`.m4a`
  URL renders a native `<audio>`, a YouTube or Vimeo URL renders that embed,
  and anything else falls back to a framed website. A `Sound` body therefore
  needs no type of its own beyond `id` and `format`.
- A media body's `label` becomes the media caption,
  `accessibilitySummary` the alt text, and `requiredStatement` (or `provider`)
  the credit. A `thumbnail` becomes the media thumb. A sibling `TextualBody`
  with `format: "text/vtt"` and an `id` becomes the media's subtitle track —
  IIIF has no subtitle term, so this is the one body the viewer reads for
  that purpose.
- An annotation with a region but **no** body is not a stop — a stop with
  nothing to say is just a focus change. Use it in a viewer that links
  annotations.

## Locations, groups and attribution

- **A point on a map** — [navPlace](https://iiif.io/api/extension/navplace/)
  on the canvas. A `Point` gives the slide's location; a `Polygon` gives the
  story's extent (`map_bbox`). Marker presentation (`icon`, `iconSize`,
  `image`, `name`, `line`, `zoom`, `use_custom_marker`) goes in the Feature's
  `properties`. All stops on a canvas share that canvas's `navPlace` — the
  extension does not allow it on an annotation, so there is no per-stop
  override. Two `properties` names are marker behaviour, not data:
  `popup: true` gives the active marker a card with the slide's headline and
  excerpt, and `audioBadge: true` dots a marker whose slide has narration or
  audio. Open the card from code with `storymap.openMarkerPopup(n)` (it
  navigates to the stop first) and listen for `popupopen` / `popupclose`
  with `{ marker_number, current_slide }`. The nine names the reader
  copies — and the linked-data context that describes them — are listed
  in `docs/storymap-as-iiif-manifest.md`.
- **Chapters** — a `Range` with a `label` and no `start` groups the canvases
  it lists. A `Range` whose `items` order differs from canvas order becomes
  the slide order instead: a Range _is_ a storyboard.
- **Attribution** — a `requiredStatement` object on the manifest, with a
  `label` and a `value` (both language maps). It lands in the map's
  attribution line.
- **Language** — every label, summary and property value is a language map.
  The viewer renders the language it was configured with, and falls back to
  `none`.

## Annotations in a separate file

A Canvas can point at an `AnnotationCollection` with `seeAlso`, and the viewer
follows it. Nothing is fetched while the story loads — that would put a network
round trip in front of the first paint — so the stops on the canvas appear
immediately, and a host asks for the rest afterwards:

```js
await sm.loadAnnotations();
sm.on("annotationsloaded", (result) => {
    console.log(`added ${result.stops.length} stops`);
});
```

One level is followed: a referenced `AnnotationPage` is read, but a `seeAlso`
inside that page is not, and a `SearchService1` is recorded rather than
followed. Stops from a referenced page are **appended** after the canvases
already rendered, not placed after the canvas they annotate, because that canvas
has been visited. A `uniqueid` is required, so a stop can be deep-linked.

## What this viewer does not read yet

- An `SvgSelector`'s true outline (see above).
- A `TextQuoteSelector` is not resolved against a transcript.
- `accessibilityFeature` beyond the alt-text mapping.

## Checking your work

```sh
npm run validate:iiif   # the official IIIF validator, over every example
```

[`public/examples-iiif/annotated-image.json`](../public/examples-iiif/annotated-image.json)
is a complete four-stop tour using everything above, and is what
`e2e/annotations.spec.ts` renders.
