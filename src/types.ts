// Shared types for the StoryMapJS codebase.

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
    line?: boolean;
    icon?: string;
    iconSize?: number[];
    image?: string;
    use_custom_marker?: boolean;
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
    thumb?: string | null;
    mediatype?: MediaTypeMatch | null;
    [key: string]: unknown;
}

export interface StorymapSlideBackground {
    url?: string | null;
    color?: string | null;
    opacity?: number;
}

export interface StorymapSlide {
    type?: string;
    date?: string | Record<string, unknown> | null;
    group?: string;
    location?: StorymapSlideLocation;
    media?: StorymapSlideMedia;
    text?: StorymapSlideText;
    background?: StorymapSlideBackground | string | null;
    uniqueid?: string;
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

export interface StorymapOptions {
    width: number;
    height: number;
    layout: string;
    base_class: string;
    default_bg_color: { r: number; g: number; b: number };
    map_size_sticky: number;
    map_center_offset: { left: number; top: number } | null;
    less_bounce: boolean;
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
    dragging: boolean;
    trackResize: boolean;
    /** Re-fetch the source file on every load, bypassing caches (issue #417) */
    nocache: boolean;
    /** Advance slides automatically every N milliseconds; 0 disables (issue #380) */
    autoplay: number;
    /** Show a progress bar in the menubar (issue #247) */
    show_progress: boolean;
    /** Show the slide headline as a label on the active map marker (issue #243) */
    marker_labels: boolean;
    /** Default text alignment for slide text: left, center or right (issue #244) */
    text_align: "left" | "center" | "right";
    /** Override the overview fit center (issues #107, #271) */
    map_overview_center: { lat: number; lon: number } | null;
    map_type: string;
    attribution: string;
    /**
     * Stacked raster overlays above the base map, below the route lines.
     * Each entry accepts any `map_type` value (XYZ template, `osm:style`,
     * …) plus per-layer presentation; see StorymapOverlayLayer. Empty
     * (default) means base map only.
     */
    overlays: StorymapOverlayLayer[];
    map_mini: boolean;
    map_subdomains: string;
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
     * Grants are remembered per service in a cookie for 90 days.
     */
    consent_required: boolean;
    /** Slide text color override, sets --vco-color-text (issue #177) */
    text_color: string;
    /** Slide panel background color override (issue #177) */
    text_background_color: string;
    /** Show the great-circle route distance in the menubar (issue #341) */
    show_distance: boolean;
    /**
     * Raw OpenLayers map configuration. `controls` and `interactions` replace
     * the StoryMapJS defaults, `view` is merged over the computed default view
     * and `element` (an HTMLElement or DOM id) replaces the auto-created map
     * container div.
     */
    map_options: StorymapMapOptions;
    map_popup: boolean;
    zoom_distance: number;
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
    iiif: { url: string; attribution: string };
    map_height: number;
    storyslider_height: number;
    slide_padding_lr: number;
    slide_default_fade: string;
    menubar_default_y: number;
    path_gfx: string;
    script_path: string;
    font_css: string;
    language: string;
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
 * A stacked raster overlay above the base map (StorymapOptions.overlays).
 * Presentation is declarative: hosts no longer need to reach into the
 * layer objects for blend modes, clips or stacking tweaks.
 */
export interface StorymapOverlayLayer {
    /** Any `map_type` value the tile layer factory accepts */
    map_type: string;
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
    /** Clip box `[west, south, east, north]` in lon/lat (mercator maps) */
    extent?: [number, number, number, number];
}

/** OpenLayers passthrough options (see StorymapOptions.map_options) */
export interface StorymapMapOptions {
    /** HTMLElement or DOM id that becomes the real map container */
    element?: HTMLElement | string;
    /** Merged over the default view configuration */
    view?: Record<string, unknown>;
    /** Replaces the default (empty) controls list */
    controls?: unknown[];
    /** Replaces the default (empty) interactions list */
    interactions?: unknown[];
    /** Any other ol/Map constructor option (layers, pixelRatio, ...) */
    [key: string]: unknown;
}

export interface LatLngLiteral {
    lat: number | undefined;
    lon?: number | undefined;
    lng?: number | undefined;
}

export interface MapMarkerData {
    real_marker?: boolean;
    location?: StorymapSlideLocation;
    media?: StorymapSlideMedia & { mediatype?: MediaTypeMatch | null };
    text?: { headline?: string };
    type?: string;
    [key: string]: unknown;
}

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
