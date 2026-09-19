// Shared types for the StoryMapJS codebase.

// ---------- Storymap data (exchange format) ----------

export interface StorymapSlideText {
    headline?: string;
    text?: string;
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
    url?: string;
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
    skinny_size: number;
    relative_date: boolean;
    duration: number;
    ease: unknown;
    dragging: boolean;
    trackResize: boolean;
    map_type: string;
    attribution: string;
    map_mini: boolean;
    map_subdomains: string;
    map_as_image: boolean;
    map_access_token: string;
    map_background_color: string;
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
    zoomify: { path: string; width: string; height: string; tolerance: number; attribution: string };
    script_path: string;
    language: string;
    api_key_flickr: string;
    [key: string]: unknown;
}

// ---------- animation ----------

export interface AnimateOptions extends Record<string, unknown> {
    duration?: number;
    easing?: unknown;
    complete?: () => void;
    left?: string | number;
    top?: string | number;
    bezier?: unknown;
}

export interface AnimationHandle {
    stop: (jump?: boolean) => void;
}

// ---------- map ----------

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
    playing?: boolean;
    [key: string]: unknown;
}

export interface LanguageStrings {
    [key: string]: unknown;
    loading: string;
    wikipedia: string;
    start: string;
}
