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
Knight Lab release.

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
back to classic OSM raster.

### Switching the basemap at runtime

`storymap.setMapOption("map_type", next)` / `setMapOptions({...})` rebuilds the
main tile layer **and** the minimap (`ol/control/OverviewMap`) layer, keeping
the overview fitted to the marker bounds (zoomify/IIIF extents preserved). The
current slide is re-fitted after the swap.

### Icons

Default pins use the bundled `vco-icons` font (`dist/css/icons/`, referenced via
relative `./icons/...` URLs from `dist/css/storymap.css`), so pins render on
subpath deploys, bundler consumers (Vite leaves absolute `/css/...` untouched)
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

**Caution:** the text is rendered raw — it is not sanitized. Only load
storymaps from sources you trust.

## GDPR consent for external services

Set the `consent_required` option to `true` to ask for permission before
anything is loaded from external services (media embeds such as YouTube,
Twitter or SoundCloud, map tiles, and external font CSS):

    {
        "consent_required": true,
        ...
    }

Each service asks with an Allow/Deny panel; answering one panel resolves every
pending panel of the same service. If a decision was already stored in the
cookie, the panel is skipped entirely. Denied services show a placeholder
instead of the media, and the map renders without tiles until they are
allowed. Decisions are stored in a cookie (`storymapjs-consent`) for 90
days — clearing cookies asks again.

## Troubleshooting

If a storymap fails to render, open the browser console: the viewer logs
fetch and validation errors (e.g. "could not load storymap data from ...").
The `error` event also fires for programmatic consumers.

## Bundled credentials

The viewer ships no credentials. Mapbox/Stadia tiles need a token passed via
`map_access_token`, and `flickr.com/photos` API URLs need `api_key_flickr`
(both settable in the storymap options).
