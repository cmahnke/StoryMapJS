# StoryMapJS: Maps that tell stories.

[StoryMapJS](http://storymap.knightlab.com) is a simple tool to help you tell stories with maps. If you're not a programmer, you don't need to spend much time on the GitHub page—instead, go [StoryMapJS](http://storymap.knightlab.com)

If you want information on creating JSON with your own code and embedding it, see the ["Advanced"](http://storymap.knightlab.com/advanced.html) documentation on the StoryMap website.

## Development

See DEVELOPMENT.md to get setup for local development of StoryMapJS. This
repository is the viewer library only (TypeScript + Vite + OpenLayers);
StoryMap JSON is validated against the schema in `schema/` on load and via
`npm run validate`.

## Contributing language translations

StoryMap's older sibling, [TimelineJS](http://timeline.knightlab.com) has proven internationally popular, in part because users have contributed translation support for dozens of languages. StoryMap is also ready to be used in languages other than English, but once again, we'll need your help.

For each language, we need a simple file with a name like `xx.json`, where `xx` is the two letter code for the language. (Technically, it's the ISO 639-1 code—you can find a [list of them on Wikipedia](http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).) The file defines a JSON object with language specific translations. To make one for your language, copy one of the existing files (like [this one for Spanish](https://github.com/NUKnightLab/StoryMapJS/blob/master/src/language/locale/es.json)) and edit the quoted strings. Please _don't_ change the "keys"—the unquoted strings. If you know how to use GitHub to make a pull request, that's the best way to submit it to us. If that's not your thing, you can [add a comment to this support thread](https://knightlab.zendesk.com/entries/33066836-Help-us-translate-StoryMapJS-into-other-languages) and upload your translation as an attachment.

## GigaPixel

Images are rendered so when set to be map_as_image the entire image is shown. When set as cartography the zoom will set so that all the markers fit.

Points are set to only display on mouseover in image mode, but you can set map_as_image to false in the config options to always show the points. The points are hidden when the intent is an image so that nothing obstructs the image the viewer is looking at. Looking at a painting is hard with a bunch of points on it.

## Map Options

To disable connecting lines on maps use the StoryMap options: "Treat as Image" (as opposed to the default, "Treat as Cartography")

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
Use `image` inside the location object and include a url to use. `use_custom_markers` also has to be set to `true` in the story map options. Same goes for custom icons except you need `icon` inside the location object and include a url to use.

### Limit the map to a bounding box

Set `map_bbox` to `[west, south, east, north]` (lon/lat) to constrain the map —
nothing outside of the box can be visible:

    map_bbox: [-11, 34, 32, 71],   // or null (the default) to leave the map unconstrained

For image-space (gigapixel) maps the coordinates are raw image pixels. When the
slide content panel is opaque (a solid background that hides the map behind it),
the initial fit accounts for the covered area so the story stays inside the
visible region.

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

Each service asks once per page load with an Allow/Deny panel; answering one
panel resolves every pending panel of the same service. Denied services show a
placeholder instead of the media, and the map renders without tiles until they
are allowed. Nothing is persisted — every page load asks again.

## Troubleshooting

Users may be directed to our userinfo page to help with troubleshooting. This page provides information about the user's account and saved storymaps. The endpoint is `https://storymap.knightlab.com/userinfo/`
