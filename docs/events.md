# Event reference

One table per emitter: the event name, its payload, when it fires, and who
can subscribe. This is the canonical list;
`docs/migration-from-knightlab.md` keeps only the migration differences.
payloads are also typed — see the `*Events` maps exported from
`src/main.ts` (e.g. `StoryMapEvents`), which make `storymap.on("chnage", …)`
a compile error and infer the handler parameter.

Every event object carries the payload fields plus the framework's own
`type` and `target`. `target` is always the object that fired — in
particular, a re-fired event's `target` is the re-firing viewer, not the
origin (a payload carrying its own `type`/`target` cannot displace them).

## `StoryMap` — subscribe on the viewer

| Event                               | Payload                                                                  | Fires when                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `change`                            | `{ current_slide, current_id }`                                          | any navigation completes (programmatic, slider, map, back-to-start); exactly once per navigation      |
| `loaded`                            | the storymap data                                                        | slider and map both loaded (mapless stories skip the map gate)                                        |
| `title`                             | `{ title }`                                                              | the story title resolves                                                                              |
| `dataloaded`                        | _none_                                                                   | the storymap document is read, before layout                                                          |
| `fontLoaded`                        | `{ font }`                                                               | the font theme finishes loading — or fails to (a missing theme never blocks the story)                |
| `transitionstart` / `transitionend` | `{ current_slide, duration }` / `{ current_slide }`                      | a slide glide starts / elapses (only the latest transition ever ends)                                 |
| `error`                             | `{ message, source, conflict? }`                                         | fetch/validation failure, or a second viewer claiming another locale (`conflict: true`)               |
| `imageready`                        | `{ source, kind, layer }` (`kind`: `"iiif"` \| `"zoomify"` \| `"tiles"`) | an image source is actually attached — the only signal the imagery exists (`loaded` can fire earlier) |
| `annotationsloaded`                 | `{ stops, searchService, failed }`                                       | `loadAnnotations()` appended external stops                                                           |
| `markerclick`                       | `{ marker_number, current_slide }`                                       | a marker is clicked (`change` alone does not say _how_ the story moved)                               |
| `popupopen` / `popupclose`          | `{ marker_number, current_slide }`                                       | a marker card opens / closes (button, Escape, deactivation, dispose)                                  |
| `basemapchange`                     | `{ map_type, previous }`                                                 | the layer switcher swapped the basemap                                                                |
| `overlaychange`                     | `{ index, visible }`                                                     | the layer switcher toggled an overlay                                                                 |

## `Map` (engine) — subscribe on `storymap._map`

`markerAdded` / `markerRemoved` fire **only here**, never on the viewer:

| Event                           | Payload                   | Fires when                                                                    |
| ------------------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| `change`                        | `{ current_marker }`      | the engine navigated (consumed internally to drive `_navigate`)               |
| `loaded`                        | the map data              | the engine loaded (guarded against OL `loadend` repeats)                      |
| `markerAdded` / `markerRemoved` | the marker                | marker created / destroyed                                                    |
| `markerclick`                   | `{ marker_number }`       | a marker is clicked (consumed internally to navigate; re-fired on the viewer) |
| `popupopen` / `popupclose`      | `{ marker_number }`       | a marker card opens / closes (re-fired on the viewer)                         |
| `imageready`                    | `{ source, kind, layer }` | a source is usable (re-fired on the viewer)                                   |

## Internal emitters

Consumed inside the viewer; a host generally observes their effects through
the `StoryMap` events above.

| Emitter       | Events                                                                                                                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StorySlider` | `change {current_slide, uniqueid}`, `loaded`, `title {title}`, `colorchange`, `slideAdded`, `nav_next` / `nav_previous` / `nav_left` / `nav_right`                                                             |
| `Slide`       | `background_change`, `call_to_action`, `loaded`, `added`, `removed`                                                                                                                                            |
| `SlideNav`    | `clicked`, `loaded`, `added`, `removed`                                                                                                                                                                        |
| `Media`       | `loaded`, `media_loaded`, `media_ended` (what `autoplay_media` waits for), `added`, `removed`                                                                                                                  |
| `Text`        | `loaded`, `added`, `removed`                                                                                                                                                                                   |
| `MapMarker`   | `markerclick`, `popupopen`, `popupclose` (all `{marker_number}`; consumed by the engine)                                                                                                                       |
| `MenuBar`     | `overview`, `back_to_start`, `fullscreen`, `collapse {y, collapsed}`, `basemapchange {map_type}`, `overlaychange {index, visible}` (the last two forwarded from the layer switcher and re-fired on the viewer) |
| `Message`     | `clicked` (consumed by the slider), `loaded`, `added`, `removed`                                                                                                                                               |
| `Swipable`    | `dragstart`, `dragend`, `dragmove`, `momentum`, `swipe_left` / `swipe_right` / `swipe_up` / `swipe_down`, `swipe_nodirection`                                                                                  |

`loaded` / `added` / `removed` come from the `DomMixed` mixin (`onLoaded` /
`onAdd` / `onRemove`); some emitters provide them without ever firing them.
