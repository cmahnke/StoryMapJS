// Shared types for the StoryMapJS codebase.
import type { Tile as TileLayer } from "ol/layer";
import type Layer from "ol/layer/Layer";
import type Source from "ol/source/Source";

// ---------- Storymap data (exchange format) ----------

export interface StorymapSlideText {
    headline?: string;
    text?: string;
    text_align?: string;
}

export interface StorymapSlideLocation {
    lat?: number;
    lon?: number;
    zoom?: number;
    /**
     * Image region `[x, y, w, h]` in image pixels (IIIF xywh convention,
     * slideshow-style image stops): the view fits the region on
     * navigation; image maps (`map_type: "iiif"` + `map_as_image`) only.
     */
    region?: [number, number, number, number];
    /**
     * View rotation in degrees clockwise (slideshow `rotation`). Applied to
     * the map view on navigation; absent means north-up (0). Image and geo
     * maps alike; purely presentational. Honored only with
     * `slideshow_source`.
     */
    rotation?: number;
    /**
     * Per-slide image grading (slideshow `filters`): applied as a CSS
     * `filter()` on the map viewport. All fields optional; absent means
     * unfiltered. `hueRotate` is degrees (-180..180), `blur` is CSS pixels.
     * Honored only with `slideshow_source`.
     */
    filter?: StorymapSlideFilter;
    /**
     * Spotlight mask (slideshow `passepartout`): normalized viewport
     * fractions `{x, y, w, h}` (0..1) left visible while the rest is dimmed
     * with `color`. `invert` dims the inside instead of the outside.
     * Absent means no mask. Honored only with `slideshow_source`.
     */
    mask?: StorymapSlideMask;
    /**
     * Per-slide basemap override (multi-manifest slideshow tours): any
     * `map_type` value or IIIF `info.json` URL. Absent keeps the story
     * basemap. The layer is cached, so returning to a slide is free.
     * Honored only with `slideshow_source`.
     */
    basemap?: string;
    line?: boolean;
    icon?: string;
    iconSize?: number[];
    image?: string;
    use_custom_marker?: boolean;
    [key: string]: unknown;
}

/**
 * Declarative CSS filter grading for one slide (slideshow `filters`).
 * Rendered by `buildSlideFilter()`; unknown keys never reach CSS.
 */
export interface StorymapSlideFilter {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    sepia?: number;
    blur?: number;
    [key: string]: unknown;
}

/**
 * Spotlight mask geometry (slideshow `passepartout`). Fractions of the
 * visible map area; `color` is a `#rgb`/`#rrggbb`/`#rrggbbaa`/`rgb(a)` string.
 */
export interface StorymapSlideMask {
    x: number;
    y: number;
    w: number;
    h: number;
    color?: string;
    invert?: boolean;
    opacity?: number;
    [key: string]: unknown;
}

export type MediaTypeMatch = {
    type: string;
    name: string;
    match_str: string;
    // media type class constructor
    cls: new (data: StorymapSlideMedia, options: Record<string, unknown>) => unknown;
};

export interface StorymapSlideMedia {
    url?: string | null;
    caption?: string | null;
    credit?: string | null;
    /**
     * Accessible description of the media, used as the image's `alt` when the
     * media is an image. In IIIF this is the painting annotation's
     * `accessibilitySummary`.
     */
    alt?: string | null;
    thumb?: string | null;
    mediatype?: MediaTypeMatch | null;
    /**
     * WebVTT subtitle file for an audio or video slide, rendered as a
     * `<track kind="subtitles">`. IIIF has no subtitle term, so this stays a
     * storymap-JSON field; the authoring guide notes the
     * `TextualBody` + `format: text/vtt` shape we also accept.
     */
    subtitles?: string | null;
    /**
     * Start offset in seconds for audio/video media (slideshow `audio.offset`).
     * Applied once the media metadata is available; absent or negative means 0.
     * Honored only with `slideshow_source`.
     */
    offset?: number;
    /**
     * Loop audio/video media (slideshow `audio.loop`). Absent means no loop.
     * Honored only with `slideshow_source`.
     */
    loop?: boolean;
    /**
     * `auto` (default) plays on activation; `click` arms the media paused and
     * lets the visitor start it (slideshow `audio.play`). Absent means `auto`.
     * Honored only with `slideshow_source`.
     */
    play?: "auto" | "click";
    /**
     * Stop this media when leaving the slide (default true). `false` lets an
     * audio bed continue across slides (slideshow ambient audio). Honored
     * only with `slideshow_source`.
     */
    stopOnExit?: boolean;
    [key: string]: unknown;
}

/**
 * Per-slide marker presentation, consolidated. `location.*` keeps working as
 * the legacy spelling and `marker.*` wins when present.
 *
 * In a IIIF manifest none of this is a `storymap:` term: it all arrives in the
 * `navPlace` Feature's `properties` bag (`icon`, `iconSize`, `image`, `name`,
 * `popup`, `audioBadge`), which is a GeoJSON foreign-member bag and so needs
 * no vocabulary registration.
 */
export interface StorymapSlideMarker {
    icon?: string;
    iconSize?: number[];
    image?: string;
    /** The marker label; in a manifest this is `properties.name`. */
    label?: string;
    /** Show the popup card when this (active) marker is clicked. */
    popup?: boolean;
    /** Mark slides that carry narration or audio media with a small badge. */
    audioBadge?: boolean;
    [key: string]: unknown;
}

/**
 * Optional spoken narration for one slide, played through a dedicated audio
 * element rather than the slide's media frame — a tour stop usually has a
 * picture and a recording, not one media item. In a IIIF manifest this is a
 * `motivation: "supplementing"` Sound/Video body, read and written alongside
 * the painting annotation.
 */
export interface StorymapSlideNarration {
    url: string;
    /**
     * Loop the narration (slideshow `audio.loop`). Absent means no loop.
     * Note: a looping narration never fires `ended`, so `autoplay_media`
     * falls back to its millisecond timer for that slide. Honored only with
     * `slideshow_source`.
     */
    loop?: boolean;
    /**
     * Start offset in seconds (slideshow `audio.offset`), applied once the
     * audio metadata is available. Absent or negative means 0. Honored only
     * with `slideshow_source`.
     */
    offset?: number;
    /**
     * `auto` (default) plays on navigation; `click` arms the narration
     * paused and lets the visitor start it (slideshow `audio.play`).
     * Honored only with `slideshow_source`.
     */
    play?: "auto" | "click";
    /**
     * Stop the narration when leaving the slide (default true). `false`
     * keeps an audio bed playing across slides while the URL is unchanged
     * (slideshow ambient audio). Honored only with `slideshow_source`.
     */
    stopOnExit?: boolean;
    /**
     * Stop any other playing narration/ambient track before starting this
     * one (default true). `false` allows the ambient overlap of two tracks.
     * Honored only with `slideshow_source`.
     */
    stopAllPrevious?: boolean;
    [key: string]: unknown;
}

export interface StorymapSlideBackground {
    url?: string | null;
    color?: string | null;
    opacity?: number;
}

/**
 * One slide of a storymap.
 *
 * The nullable members (`| null`) are not decoration: the storymap JSON uses
 * `null` to mean "explicitly absent" and the viewer seeds its own defaults
 * with `null` before the data is merged in, so a plain `?` would not type.
 */
export interface StorymapSlide {
    type?: string;
    date?: string | Record<string, unknown> | null;
    group?: string;
    /**
     * The language tag this slide's text was read in. A IIIF manifest states its text as a
     * language map; the reader picks the viewer's configured language and
     * reports which one it used, so a host can offer a language switch.
     * Absent for language-neutral (`none`) text, and for a single-language
     * storymap.
     */
    language?: string;
    location?: StorymapSlideLocation | null;
    media?: StorymapSlideMedia | null;
    /**
     * Additional visible media for this slide (#358), rendered after `media`
     * in order. Items without a non-empty `url` are skipped, so a document
     * without this field renders identically. In a IIIF manifest these are
     * further `painting` annotations on the canvas; the slide layout
     * (`media_layout`) has no IIIF term and stays viewer-side.
     */
    media_extra?: StorymapSlideMedia[] | null;
    /**
     * Layout of a multi-media slide (#358): `stack` piles the items
     * vertically (the panel scrolls), `row` puts two items side by side.
     * Defaults to `stack`; `row` with anything but two items falls back to
     * `stack`. Ignored for a single media item.
     */
    media_layout?: "stack" | "row";
    marker?: StorymapSlideMarker | null;
    narration?: StorymapSlideNarration | null;
    text?: StorymapSlideText | null;
    background?: StorymapSlideBackground | string | null;
    uniqueid?: string | null;
    /**
     * Per-slide autoplay dwell in milliseconds (slideshow `slidetimeout`):
     * overrides the global `autoplay` interval for this slide; `0` holds on
     * this slide. Absent means the global interval. Honored only with
     * `slideshow_source`.
     */
    slidetimeout?: number;
    /**
     * Per-slide image overlay on the map (slideshow `imgoverlay`): a placed
     * image shown while this slide is active. Absent means no overlay.
     * Honored only with `slideshow_source`.
     */
    imgoverlay?: StorymapImageOverlay | null;
    [key: string]: unknown;
}

/**
 * A per-slide image overlay (slideshow `imgoverlay`). `url` is a full-size
 * image; `extent` pins it to `[west, south, east, north]` (lon/lat, or raw
 * image pixels on image-space maps) and defaults to the current view;
 * `size` scales it as a fraction of the viewport width; `opacity` is 0..1.
 */
export interface StorymapImageOverlay {
    url: string;
    size?: number;
    opacity?: number;
    extent?: [number, number, number, number];
    [key: string]: unknown;
}

export interface StorymapData {
    uniqueid?: string;
    slides: StorymapSlide[];
    [key: string]: unknown;
}

export interface StorymapDataWrapper {
    storymap: StorymapData;
}

// ---------- StoryMap / Map options ----------

/**
 * Custom tile layer/source factory (see
 * `StorymapOptions.tile_source_factory`). `createDefault` runs the
 * built-in `map_type` handling, so a factory can decorate or delegate.
 *
 * May return any `ol/layer/Layer` (used as-is — this is what lets a
 * third-party layer such as an Allmaps `WarpedMapLayer` render), a bare
 * `Source` (wrapped in a `TileLayer`), or `null`/`undefined` to fall
 * through to the default `map_type` handling.
 */
export type TileSourceFactory = (
    map_type: string,
    context: { options: StorymapOptions; createDefault: () => TileLayer },
) => Layer | TileLayer | Source | null | undefined;

export interface StorymapOptions {
    width: number;
    height: number;
    layout: string;
    base_class: string;
    default_bg_color: { r: number; g: number; b: number };
    map_size_sticky: number;
    map_center_offset: { left: number; top: number } | null;
    start_at_slide: number;
    call_to_action: boolean;
    call_to_action_text: string;
    menubar_height: number;
    /** Show a fullscreen toggle button in the menubar (default: true) */
    fullscreen: boolean;
    /** Show the map overview button in the menubar (default: true) */
    show_overview: boolean;
    /** Show the back-to-the-beginning button in the menubar (default: true) */
    show_back_to_start: boolean;
    skinny_size: number;
    duration: number;
    ease: unknown;
    trackResize: boolean;
    /**
     * Navigate slides with arrow keys anywhere on the page (default false:
     * arrows only work when the slide panel has focus). Form elements and
     * the map itself (which pans) are always skipped. Read at construction.
     */
    keyboard: boolean;
    /** Re-fetch the source file on every load, bypassing caches (issue #417) */
    nocache: boolean;
    /** Advance slides automatically every N milliseconds; 0 disables (issue #380) */
    autoplay: number;
    /**
     * With autoplay on, wait for the current slide's audio or video to end
     * before advancing instead of using the `autoplay` millisecond timer,
     * which stays as the fallback. Slides without playable media keep the
     * timer, so a mixed story never stalls.
     */
    autoplay_media: boolean;
    /** Show a progress bar in the menubar (issue #247) */
    show_progress: boolean;
    /**
     * Progress indicator style (slideshow `progressbar`): `false`/`"off"`
     * hides it (same as `show_progress: false`), `true`/`"bar"` is the
     * classic fill bar, `dots`/`squares` render one step per slide,
     * `block`/`thinblock` are fill-bar height variants. Absent means the
     * `show_progress` boolean decides and the style is `"bar"`. Honored
     * only with `slideshow_source`.
     */
    progressbar?: boolean | "bar" | "dots" | "squares" | "block" | "thinblock" | "off";
    /** Show the slide headline as a label on the active map marker (issue #243) */
    marker_labels: boolean;
    /** Default text alignment for slide text: left, center or right (issue #244) */
    text_align: "left" | "center" | "right";
    /**
     * Slide panel dock (slideshow `textmode`): which side the text panel
     * occupies in landscape. `"right"` (default) is the current layout;
     * `"left"` mirrors it; `"bottom"` docks the panel below the map.
     * Portrait layouts always behave like `"bottom"`. Honored only with
     * `slideshow_source`.
     */
    textmode?: "left" | "right" | "bottom";
    /**
     * Slide panel size as a percentage (slideshow `textsize`): percent of
     * the width for side docks, of the height for the bottom dock.
     * Range 10..80; absent keeps the built-in 50/50 split. Honored only
     * with `slideshow_source`.
     */
    textsize?: number;
    /** Override the overview fit center (issues #107, #271) */
    map_overview_center: { lat: number; lon: number } | null;
    map_type: string;
    /**
     * Custom OpenLayers tile layer/source factory (issue #473): consulted
     * by the tile layer factory before the built-in `map_type` switch, for
     * every base, overlay and minimap layer. Return a `TileLayer` (or a
     * bare `Source`, auto-wrapped in one) for custom handling — e.g. WMS —
     * or `null`/`undefined` to fall through to the default types.
     * Constructor- and runtime-only: functions cannot ride storymap JSON.
     */
    tile_source_factory: TileSourceFactory | null;
    attribution: string;
    /**
     * Stacked raster overlays above the base map, below the route lines.
     * Each entry accepts any `map_type` value (XYZ template, `osm:style`,
     * …) plus per-layer presentation; see StorymapOverlayLayer. Empty
     * (default) means base map only.
     */
    overlays: StorymapOverlayLayer[];
    /** Show the basemap/overlay switcher in the menubar (default false) */
    show_layers_control: boolean;
    /**
     * Selectable base maps for the layer switcher. Entry 0 is the initial
     * basemap unless `map_type` says otherwise; omit for an overlays-only
     * control. Constructor- and runtime-only when labels are functions
     * (functions cannot ride storymap JSON — see `label`).
     */
    basemaps?: StorymapBasemap[];
    map_mini: boolean;
    map_as_image: boolean;
    map_access_token: string;
    map_background_color: string;
    /**
     * Landscape map layout: `"full"` (default) spans the whole width with the
     * slide panel fading in over it (the map view is offset so markers clear
     * the panel); `"left"` limits the map to the left, visible half with an
     * opaque slide panel — no offset needed, fits and constraints align with
     * the visible area directly. Portrait layouts are unaffected.
     */
    map_area: "full" | "left";
    /**
     * Limit the map to a bounding box `[west, south, east, north]` (lon/lat;
     * raw image pixel coordinates for image-space maps). The view center is
     * constrained to the box; `null` (default) leaves the map unconstrained.
     */
    map_bbox: number[] | null;
    /**
     * Constrain the minimap overview to a bounding box `[west, south, east,
     * north]` in lon/lat (mercator maps only); `null` (default) leaves the
     * overview unconstrained.
     */
    overview_extent: [number, number, number, number] | null;
    /**
     * Legacy zoomify image pyramid (map_type: "zoomify"): the tiles are
     * placed at the standard mercator tile positions, stretched from the
     * world's top-left corner.
     */
    zoomify?:
        | {
              path?: string;
              width?: number;
              height?: number;
              tolerance?: number;
              attribution?: string;
          }
        | boolean;
    /**
     * Ask for permission before loading anything from external services
     * (media embeds, map tiles, external font CSS) — GDPR consent mode.
     * Decisions are remembered per service in `localStorage` under
     * `storymapjs-consent` with no expiry: clearing site data is what makes
     * the viewer ask again.
     */
    consent_required: boolean;
    /** Slide text color override, sets --vco-color-text (issue #177) */
    text_color: string;
    /** Slide panel background color override (issue #177) */
    text_background_color: string;
    /** Show the great-circle route distance in the menubar (issue #341) */
    show_distance: boolean;
    /**
     * Slide transition effect (slideshow `fxmode`): `"slide"` (default) is
     * the current glide, `"fade"` cross-fades slides, `"none"` jumps without
     * animation. `prefers-reduced-motion` still forces `"none"`. Honored
     * only with `slideshow_source`.
     */
    fxmode?: "slide" | "fade" | "none";
    /**
     * Reading mode (slideshow `mode`): `"standard"` (default) is the
     * slider; `"static"` stacks all slides in a scrollable list and follows
     * the map to the slide in view. Honored only with `slideshow_source`.
     */
    mode?: "standard" | "static";
    /**
     * HUD foreground color override (slideshow `hudcolor`): sets the
     * `--vco-hud-fg` CSS variable. Absent follows the theme. Honored only
     * with `slideshow_source`.
     */
    hudcolor?: string;
    /**
     * HUD background color override (slideshow `hudbgcolor`): sets the
     * `--vco-hud-bg` CSS variable. Absent follows the theme. Honored only
     * with `slideshow_source`.
     */
    hudbgcolor?: string;
    /**
     * HUD opacity percent 0..100 (slideshow `hudopacity`): applied to the
     * HUD background. Absent means fully opaque theme background. Honored
     * only with `slideshow_source`.
     */
    hudopacity?: number;
    /**
     * Show the previous/next slide navigation (slideshow `shownav`).
     * Default true; `false` hides the nav chrome (keyboard/AT navigation
     * still works, like `show_progress: false` keeps the story usable).
     * Honored only with `slideshow_source`.
     */
    shownav?: boolean;
    /**
     * Render slide headlines (slideshow `showheadings`). Default true;
     * `false` hides headline elements via CSS. Honored only with
     * `slideshow_source`.
     */
    show_headings?: boolean;
    /**
     * Show scrollbars in the slide panel (slideshow `showscrollbars`).
     * Default true; `false` hides them via CSS (content still scrolls).
     * Honored only with `slideshow_source`.
     */
    show_scrollbars?: boolean;
    /**
     * Fixed viewer height (slideshow `viewerheight`), e.g. `"400px"`:
     * applied as a container height override when set. Absent keeps the
     * measured-container behavior. Only `px`, `%` and `vh` units accepted.
     * Honored only with `slideshow_source`.
     */
    viewerheight?: string;
    /**
     * Show media captions and credits (slideshow `showinfo`). Default true;
     * `false` hides the caption/credit block. Honored only with
     * `slideshow_source`.
     */
    show_info?: boolean;
    /**
     * @internal Source marker: true when the loaded document came from a
     * slideshow tour (set programmatically by the viewer, never from data).
     * The slideshow-motivated presentation fields (location
     * rotation/filter/mask/basemap, narration/media playback bags,
     * slidetimeout, imgoverlay, and the player-chrome options above) render
     * only with this set — internal documents keep the long-standing
     * behavior. Absent from constructor defaults and schema, so storymap
     * data cannot inject it; it travels via options copies. Hosts may pass
     * it explicitly as an escape hatch.
     */
    slideshow_source?: boolean;
    /**
     * Raw OpenLayers map configuration. `controls` replaces the StoryMapJS
     * defaults, `interactions` are *added to* the viewer's own pan/zoom
     * interactions, and `view` is merged over the computed default view
     * and `element` (an HTMLElement or DOM id) replaces the auto-created map
     * container div.
     */
    map_options: StorymapMapOptions;
    calculate_zoom: boolean;
    line_follows_path: boolean;
    line_color: string;
    line_color_inactive: string;
    line_join: string;
    line_weight: number;
    line_opacity: number;
    line_dash: string;
    show_lines: boolean;
    show_history_line: boolean;
    use_custom_markers: boolean;
    /**
     * IIIF image service for image maps. `url` is the `info.json`; `width`
     * and `height` record the canvas size so region clamping and the static
     * fallback work without another fetch; `fallbackUrl` is a full-size
     * image used when `info.json` cannot be loaded (slideshow
     * `image_static`).
     */
    iiif: {
        url: string;
        attribution: string;
        width?: number;
        height?: number;
        fallbackUrl?: string;
    };
    tilejson?: StorymapTilejson;
    /**
     * The `seeAlso` targets a IIIF manifest points at, recorded but not
     * fetched — see `loadSeeAlso()`.
     */
    see_also?: { id: string; type: string }[];
    map_height: number;
    storyslider_height: number;
    slide_padding_lr: number;
    slide_default_fade: string;
    menubar_default_y: number;
    script_path: string;
    /**
     * Font theme stylesheet: `stock:<name>`, a URL/path, or `false` for no
     * injected stylesheet (the host bundles the theme itself).
     */
    font_css: string | false;
    language: string;
    /**
     * Colour theme: `"dark"` forces the dark palette, `"light"` pins the
     * light one (overriding an OS dark preference), unset follows
     * `prefers-color-scheme`. Construction-time only, like `map_type`.
     */
    theme?: "dark" | "light";
    api_key_flickr: string;
    [key: string]: unknown;
}

// ---------- animation ----------

export interface AnimateOptions extends Record<string, unknown> {
    duration?: number;
    easing?: unknown;
    complete?: unknown;
    left?: string | number;
    top?: string | number;
}

export interface AnimationHandle {
    stop: (jump?: boolean) => void;
}

// ---------- map ----------

/**
 * TileJSON 2.1 tile source metadata, from a manifest's map configuration
 * service.
 *
 * This is how a manifest states a tile source: `tiles` is the URL template and
 * the rest is the standard metadata around it, where a keyword basemap
 * (`osm`, `stadia`, `iiif`, …) has no such thing to say. `minzoom`,
 * `maxzoom`, `bounds` and `scheme` constrain the source; `center` and `zoom`
 * set the initial view.
 */
export interface StorymapTilejson {
    /** URL template, e.g. `https://tiles.example.org/{z}/{x}/{y}.png` */
    tiles: string | string[];
    /** Lowest zoom level the source has tiles for */
    minzoom?: number;
    /** Highest zoom level the source has tiles for */
    maxzoom?: number;
    /** `[west, south, east, north]`, WGS84 lon/lat, of the covered area */
    bounds?: [number, number, number, number];
    /** `xyz` (default) or `tms`, which flips the tile row order */
    scheme?: "xyz" | "tms";
    /** `[lon, lat, zoom]` of the map's default view */
    center?: [number, number, number];
}

/**
 * A selectable base map for the layer switcher (`StorymapOptions.basemaps`).
 */
export interface StorymapBasemap {
    /** Any `map_type` value. */
    map_type: string;
    /**
     * Control row label. Defaults to `map_type`. A function is re-invoked
     * on every `refreshLabels()` for host i18n (constructor options only —
     * see `StorymapOverlayLayer.label`).
     */
    label?: string | (() => string);
}

/**
 * A stacked raster overlay above the base map (StorymapOptions.overlays).
 * Presentation is declarative: hosts no longer need to reach into the
 * layer objects for blend modes, clips or stacking tweaks.
 */
export interface StorymapOverlayLayer {
    /**
     * Any `map_type` value the tile layer factory accepts. Required unless
     * the entry carries a `georeference` (a placed IIIF image instead of
     * a tile source).
     */
    map_type?: string;
    /** Layer opacity 0..1 (default 1) */
    opacity?: number;
    /** Initial visibility (default true) */
    visible?: boolean;
    /** Extra attribution fragment, listed while the overlay is visible */
    attribution?: string;
    /**
     * CSS class for the layer container. OpenLayers paints every layer
     * with the same class into one shared div/canvas, so a distinct
     * class isolates this layer (e.g. for blend modes). The class
     * replaces the default wholesale, so keep the `ol-layer` token
     * (e.g. `"ol-layer historic-sheet"`) unless you know why not.
     */
    className?: string;
    /** CSS mix-blend-mode for the layer container (needs className) */
    blendMode?: string;
    /**
     * Control row label for the layer switcher (`show_layers_control`).
     * Defaults to `map_type`. A function is re-invoked on every
     * `refreshLabels()` for host i18n — but only when the entry comes from
     * constructor options: `mergeData()` overwrites option keys with the
     * storymap JSON, so a document carrying `overlays` replaces function
     * labels with its own strings.
     */
    label?: string | (() => string);
    /**
     * Render the row checked and disabled: an overlay the visitor may add
     * back but not remove (e.g. a georeferenced scan the story is built on).
     * The control never toggles a locked entry.
     */
    locked?: boolean;
    /** false hides the row from the control without removing the overlay. */
    control?: boolean;
    /** Clip box `[west, south, east, north]` in lon/lat (mercator maps) */
    extent?: [number, number, number, number];
    /**
     * IIIF Georeference Extension placement instead of a tile source. The
     * ground control points are fitted affinely and the image is placed on
     * the geographic map, so this is the manifest-side equivalent of a
     * georeferenced raster overlay.
     */
    georeference?: StorymapGeoreference;
}

/**
 * A IIIF Georeference Extension annotation body plus the image it places
 * (`overlays[].georeference`). The `body` is the annotation payload of
 * `iiif.io/api/extension/georef` verbatim: a GeoJSON FeatureCollection of
 * ground control points pairing `properties.resourceCoords` (image pixels)
 * with `geometry.coordinates` (WGS84 lon/lat), optionally carrying a
 * `transformation` hint.
 *
 * The viewer fits the affine (first-order polynomial) case and places the
 * image with OpenLayers' reprojection, which requires an axis-aligned
 * placement; rotated or skewed sheets, higher-order polynomials and thin
 * plate splines are reported and skipped — see the "Geo-referenced layers"
 * section of docs/storymap-as-iiif-manifest.md.
 */
export interface StorymapGeoreference {
    /** IIIF Image API service base (or a full-size image URL) to place */
    url: string;
    /** Image width in pixels (the resourceCoords space) */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Georeference annotation body: the GCP FeatureCollection */
    body: StorymapGeoreferenceBody;
}

export interface StorymapGeoreferenceBody {
    type?: string;
    /** `polynomial` with `order: 1`, or absent; other values are skipped */
    transformation?: { type?: string; options?: { order?: number } };
    features: StorymapGroundControlPoint[];
}

/** One ground control point: an image pixel paired with a WGS84 position */
export interface StorymapGroundControlPoint {
    type?: string;
    properties?: { resourceCoords?: [number, number] };
    geometry?: { type?: string; coordinates?: number[] };
}

/** OpenLayers passthrough options (see StorymapOptions.map_options) */
export interface StorymapMapOptions {
    /** HTMLElement or DOM id that becomes the real map container */
    element?: HTMLElement | string;
    /** Merged over the default view configuration */
    view?: Record<string, unknown>;
    /** Replaces the default (empty) controls list */
    controls?: unknown[];
    /**
     * Added to the viewer's own pan/zoom interactions (not a replacement:
     * the viewer's defaults are always added). `controls` *is* a
     * replacement, since the viewer adds none of its own.
     */
    interactions?: unknown[];
    /** Any other ol/Map constructor option (layers, pixelRatio, ...) */
    [key: string]: unknown;
}

/**
 * A resolved geographic coordinate.
 *
 * `lat`/`lon` are required: this type is for points the map can actually
 * focus on. A *slide* may carry a `location` without coordinates (an image
 * region, an icon only) — that is `StorymapSlideLocation`, which keeps them
 * optional. `lng` is accepted as a legacy alias on input only.
 */
export interface LatLngLiteral {
    lat: number;
    lon: number;
    lng?: number;
}

/**
 * A marker's data: the slide it was created from, plus the `real_marker` flag
 * the marker sets once it has confirmed numeric lat/lon. A separate interface
 * used to drift from `StorymapSlide` (narrower `text`, its own `location`),
 * which then made `Map._createMarker(slide)` unassignable.
 */
export type MapMarkerData = StorymapSlide & {
    real_marker?: boolean;
};

export type IconSpec = {
    url: string;
    size: number[];
    anchor: number[];
};

// ---------- media ----------

export interface MediaState {
    loaded: boolean;
    [key: string]: unknown;
}

export interface LanguageStrings {
    [key: string]: unknown;
    loading: string;
    wikipedia: string;
    start: string;
}
