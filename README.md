# StoryMapJS: Maps that tell stories.

> **Important:** this is an **unofficial, unapproved fork** of the original
> [NUKnightLab/StoryMapJS](https://github.com/NUKnightLab/StoryMapJS)
> repository. It is a proof of concept for an AI-based renovation of the
> codebase, built using the model **GLM 5.3 Flash**. It is not endorsed by,
> affiliated with, or supported by Northwestern University Knight Lab.

This fork is a **viewer-only library**: it renders existing StoryMap JSON
files (or IIIF Presentation manifests) with TypeScript + Vite + OpenLayers.
There is no authoring tool — create your storymap JSON by hand or with your
own code, and see `docs/` for the migration notes from the original
Knight Lab release. The library also exports `storymapToManifest()`, which
produces a IIIF manifest from a storymap document (`npm run convert:iiif`
does the same from the command line; see `docs/storymap-as-iiif-manifest.md`).

## Development

See docs/DEVELOPMENT.md to get setup for local development of StoryMapJS. This
repository is the viewer library only (TypeScript + Vite + OpenLayers);
StoryMap JSON is validated against the schema in `schema/` on load and via
`npm run validate`.

## Contributing language translations

StoryMap ships locale files for dozens of languages under
`src/language/locale/` (for example
[`es.json`](src/language/locale/es.json)). To add or improve a translation,
copy an existing file and edit the quoted strings — please _don't_ change the
"keys" (the unquoted strings). The file name is the language code, e.g.
`es.json` (codes like `zh-cn.json` and `zh-tw.json` are also supported — the
value of the storymap's `language` option must match the file name).

## IIIF images

Large images served over the IIIF Image API are rendered so when set to be map_as_image the entire image is shown. When set as cartography the zoom will set so that all the markers fit.

Points are set to only display on mouseover in image mode, but you can set map_as_image to false in the config options to always show the points. The points are hidden when the intent is an image so that nothing obstructs the image the viewer is looking at. Looking at a painting is hard with a bunch of points on it.

## Map Options

To disable connecting lines on maps set `map_as_image: true` in the storymap
options (the default `false` renders cartography).

`storymap.map` is the raw OpenLayers map, typed with the re-exported `ol`
types, and `getBaseLayer()`, `getOverlayLayers()`, `getMinimap()`,
`getMarkers()` and friends hand out the layers the viewer built. Listen for
`imageready` to run code against the real imagery, and call
`storymap.dispose()` when the embedding view goes away — see
[docs/migration-from-knightlab.md](docs/migration-from-knightlab.md#reaching-the-map-layers-and-markers)
for the full surface.

The menubar buttons can be disabled individually:

    show_overview:       false,   // map overview button
    show_back_to_start:  false,   // back to the beginning button
    fullscreen:          false,   // fullscreen toggle

(true is the default; setting the option to false hides the button.)

More config options available to do what you want with the line:

    line_follows_path:      true,		// Map history path follows default line, if false it will connect previous and current only
    line_color:             "#c34528",
    line_color_inactive:    "#CCC",
    line_join:              "miter",
    line_weight:            3,
    line_opacity:           0.80,
    line_dash:              "5,5",
    show_lines:             true,
    show_history_line:      true,

To disable zoom calculation/edit zoom level set calculate_zoom to false in the config options.

### More data options

Beyond the map options above, the storymap data takes `overlays[]`
(stacked raster layers over the basemap), `tilejson` (a TileJSON source for
the base layer), `overview_extent` (the overview slide's bounds),
`keyboard` (page-wide arrow-key navigation for multi-viewer pages),
per-slide `marker: { popup, audioBadge }` (the active marker's card, openable
via `storymap.openMarkerPopup(n)`, and the narration/audio dot) and
`narration: { url }` with `autoplay_media` per slide. All are validated
against `schema/storymap.schema.json` — read it (or `src/types.ts`) for the
full list with defaults.

`show_layers_control: true` adds a menubar disclosure button listing the
`overlays[]` as checkboxes and `basemaps[]` as basemap radios, so the
visitor can switch layers without touching code.

`theme: "dark"` forces the dark palette, `"light"` pins the light one;
unset, the widget follows `prefers-color-scheme`.

### Slideshow-style tours

Slides can carry per-slide presentation for image tours (a stop can restyle
the view while it is active; everything is optional and validated against
`schema/storymap.schema.json`):

    location: {
        region: [x, y, w, h],  // image-pixel stop (IIIF xywh); negative origins clamp to the canvas
        rotation: 45,          // view rotation in degrees clockwise
        filter: { sepia: 40 }, // brightness/contrast/saturate (%), hueRotate (°), sepia (%), blur (px)
        mask: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },  // spotlight mask (fractions) + color/invert
        basemap: "osm:bright", // per-slide basemap (any map_type or IIIF info.json URL)
    },
    narration: { url, loop, offset, play: "auto"|"click", stopOnExit, stopAllPrevious },
    slidetimeout: 9000,        // per-slide autoplay dwell in ms (0 holds); default is the global autoplay
    imgoverlay: { url, extent, opacity },  // image overlay while the slide is active

When a slide's IIIF `info.json` cannot be loaded, `iiif: { width, height,
fallbackUrl }` paints the static image instead of a blank basemap. Without
stated dimensions the viewer probes the fallback image's natural size first,
but only for slideshow tours (15s timeout); other documents keep the logged
error path.

The player chrome is opt-in storymap options (absent means the default
layout): `textmode: "left"|"right"|"bottom"` with `textsize` (10–80 %),
`progressbar: "bar"|"dots"|"squares"|"block"|"thinblock"|"off"`,
`fxmode: "slide"|"fade"|"none"`, `mode: "static"` (stacked reading list with
scroll-spy map sync), `hudcolor`/`hudbgcolor`/`hudopacity`,
`shownav`/`show_headings`/`show_scrollbars`/`show_info` toggles and
`viewerheight: "400px"`. The same presentation round-trips through IIIF
manifests as `storymap:` terms — see
[docs/storymap-as-iiif-manifest.md](docs/storymap-as-iiif-manifest.md).

These presentation fields render **only for slideshow tours** (documents
loaded from that format, which set the internal `slideshow_source` marker).
Hand-written storymap documents and IIIF manifests keep the long-standing
rendering even when they name the new keys — captions always show, the
autoplay interval stays global, the panel keeps its default dock. Hosts may
pass `slideshow_source: true` explicitly as an escape hatch (e.g. in tests).

Images can now be used in place of map pins.
Use `image` inside the location object and include a url to use, together with
`use_custom_marker: true` in the location object (or set `use_custom_markers:
true` globally in the storymap options). Same goes for custom icons except you
need `icon` inside the location object.

### Limit the map to a bounding box

Set `map_bbox` to `[west, south, east, north]` (lon/lat) to constrain the map —
the view center stays inside the box, so the map cannot pan away from it:

    map_bbox: [-11, 34, 32, 71],   // or null (the default) to leave the map unconstrained

For image-space (IIIF) maps the coordinates are raw image pixels. When the
slide content panel is opaque (a solid background that hides the map behind it),
the initial fit accounts for the covered area so the story stays inside the
visible region. To limit the map to the left, visible half in landscape (with
an opaque slide panel instead of the gradient over the map), set
`map_area: "left"` (default `"full"`).

### Custom tile templates

`map_type` accepts absolute or relative tile URL templates and style JSON URLs:

    map_type: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    map_type: "./tiles/{z}/{x}/{y}.png",   // same-origin, works on subpaths + Electron
    map_type: "https://tiles.openfreemap.org/styles/bright",  // vector style

Any value containing `{z}` renders as a raster XYZ layer; a path without `{z}`
that looks like a URL/path renders as a vector style layer; anything else falls
back to classic OSM raster — except `"none"`, which builds no map at all and
runs the story as text and media only. A full template naming a known provider
(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) is credited to that
provider; anything else gets the generic "Map data" line (add your own via
`attribution`).

### Switching the basemap at runtime

`storymap.setMapOption("map_type", next)` / `setMapOptions({...})` rebuilds the
main tile layer **and** the minimap (`ol/control/OverviewMap`) layer, keeping
the overview fitted to the marker bounds (zoomify/IIIF extents preserved). The
current slide is re-fitted after the swap.

### Icons

Default pins use the bundled `vco-icons` font (`dist/css/icons/`, referenced via
relative `./icons/...` URLs from `dist/css/storymap.css`), so pins render on
subpath deploys, bundler consumers (Vite leaves absolute `/css/...` untouched)
Font themes (`font_css: "stock:<name>"`) resolve via `import.meta.url`, so they
only work script-tagged, unbundled. A bundler consumer imports the theme
instead (`import "@projektemacher/storymapjs/css/fonts/font.default.css"`)
and passes `font_css: false` for no injected `<link>`.

and `file://`/Electron hosts without extra configuration. Import the stylesheet
once (`import "@projektemacher/storymapjs/css/storymap.css"`).

## Custom HTML in slide content

Slide text is rendered as HTML: the `text` (and `headline`) fields accept
arbitrary markup. If the text contains no `<p>` tag, it is wrapped in one
automatically; otherwise it is used as-is. This means you can use links,
images, lists, emphasis and spans in your slides, e.g.:

    {
        "headline": "1920: An American in the Making",
        "text": "Immigrants arriving at <a href=\"https://example.org\">Ellis Island</a>.<br><span class='vco-note'>Photograph: Library of Congress.</span>"
    }

The `vco-note` span renders as a small grey note, like the built-in credits.

**Caution:** the text is sanitized, but sanitizing is a mitigation rather
than a guarantee. Prose and media formatting survive (`class`, `alt`, `width`,
table attributes, and so on), scripts and other executable tags are dropped
with their contents, event-handler attributes are stripped, every URL
attribute is checked to be `http(s)`, and `<iframe>` embeds are rebuilt into
a sandboxed, `no-referrer` element. `style`, `id` and `name` are _not_ allowed,
and a link's `target` is always forced to `_blank`. The same sanitizer covers
media credit, media caption, the navigation headline and the map attribution
line. Still: only load storymaps from sources you trust.

## GDPR consent for external services

Set the `consent_required` option to `true` to ask for permission before
anything is loaded from external services (media embeds such as YouTube,
Twitter or SoundCloud, slide narration audio, map tiles, and external font
CSS):

    {
        "consent_required": true,
        ...
    }

Each service asks with an Allow/Deny panel; answering one panel resolves every
pending panel of the same service. Denied services show a placeholder
instead of the media, and the map renders without tiles until they are
allowed.

Before the story loads, one dialog lists every external service it uses (map
tiles, media services including slide narration, external fonts) with three
choices: **Allow all**, **Decline all**, or a decision per service. A story
with no map (`map_type: "none"`) has no tile row to answer. The dialog is
skipped once every service has a stored decision; per-service panels still
appear for services discovered later (e.g. a preloaded slide).

Decisions are stored in `localStorage` under `storymapjs-consent` and have no
expiry — clearing site data asks again.

The consent labels are **not** fully translated. `src/language/locale/en.json`
defines every string; 28 bundled locales fall back to English for the keys
they lack — most are missing one, a handful are missing around ten (the
per-service consent prompts and the fullscreen button labels). Run
`npm run check:locales` to see the current state — it reports the gap per
locale and is expected to be runnable without failing.

## Troubleshooting

If a storymap fails to render, open the browser console: the viewer logs
fetch and validation errors (e.g. "could not load storymap data from ...").
The `error` event also fires for programmatic consumers. The full event
reference (payloads included) is [docs/events.md](docs/events.md).

## Accessibility

Supported, and covered by tests: text alternatives on slide images
(decorative `alt=""` included); real `<button>` menubar actions and slide
navigation; polite live-region slide announcements; reduced-motion handling
of the slide glide and autoplay; an embed page that does not disable zoom;
sanitized author tables that keep their semantics; slides hidden from
assistive tech while inactive (`aria-hidden` + `inert`), with a layer
switcher built from native checkboxes, radios and fieldsets; keyboard
operable map pins and message dismissal; a skip link to the slide content;
an autoplay pause/resume toggle; slide text pronounced in its own language
(`lang`); consent dialogs exposed with labels and focus; media errors
announced as alerts; and a motion kill-switch that also honors an
OS reduced-motion toggle flipped mid-story.

Known limitations (not fixed here): map markers are pointer-only; audio and
video have no viewer-side captions or transcripts; narration ships without a
transcript; focus moves only when the layer panel closes with Escape; labels
and announcements are hardcoded English; several muted text colors fall
below 4.5:1; third-party embeds are the vendor's conformance. No VPAT or
ACR is claimed — §508 conformance is decided per deliverable by an
external audit.

## Bundled credentials

The viewer ships no credentials. Mapbox/Stadia tiles need a token passed via
`map_access_token`, and `flickr.com/photos` API URLs need `api_key_flickr`
(both settable in the storymap options).
