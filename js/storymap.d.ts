import { default as default_2 } from 'ol/control/OverviewMap';
import { default as default_3 } from 'ol/source/Source';
import { default as default_4 } from 'ol/Map';
import { default as default_5 } from 'ol/Overlay';
import { default as default_6 } from 'ol/tilegrid/TileGrid';
import { default as default_7 } from 'ol/proj/Projection';
import { Extent } from 'ol/extent';
import { Map as Map_3 } from 'ol';
import { Style } from 'ol/style';
import { Tile } from 'ol/layer';
import { Vector } from 'ol/layer';

declare interface AnimationHandle {
    stop: (jump?: boolean) => void;
}

/**
 * Per-StoryMap GDPR consent manager. When the `consent_required` option is
 * set, every external service (media embeds, map tiles, external font CSS)
 * asks for permission before anything is loaded. Decisions are remembered
 * per service in a cookie for 90 days — clearing cookies asks again.
 */
declare class ConsentManager {
    private granted;
    private denied;
    /** unanswered asks per service (preloaded slides stack several) */
    private pending;
    constructor();
    /** Seed the per-service state from the consent cookie, if present. */
    private restore;
    /** Persist the per-service state to the consent cookie. */
    private persist;
    isGranted(service: string): boolean;
    isDenied(service: string): boolean;
    /**
     * Ask the visitor for permission to load `service` (a human-readable
     * name like "YouTube" or "map tiles"), optionally naming the `host`.
     * The ask is rendered into `container`; resolves `true`/`false` on the
     * visitor's decision, or immediately when the service was already
     * granted or denied.
     */
    request(service: string, host: string, container: HTMLElement): Promise<boolean>;
}

declare interface DragData {
    sliding: boolean;
    direction: string | null;
    pagex: {
        start: number;
        end: number;
    };
    pagey: {
        start: number;
        end: number;
    };
    pos: {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    };
    new_pos: {
        x: number;
        y: number;
    };
    new_pos_parent: {
        x: number;
        y: number;
    };
    time: {
        start: number;
        end: number;
    };
    touch: boolean;
}

declare interface DragEventNames {
    down: string;
    up: string;
    leave: string;
    move: string;
}

/** Eventing members provided by the Evented mixin. */
declare interface EventedInstance {
    on: (type: string, fn: unknown, context?: unknown) => unknown;
    off: (type: string, fn: unknown, context?: unknown) => unknown;
    fire: (type: string, data?: unknown, target?: unknown) => unknown;
    hasEventListeners: (type: string) => boolean;
}

declare type IconSpec = {
    url: string;
    size: number[];
    anchor: number[];
};

declare interface LanguageEntry {
    buttons?: Record<string, string>;
    messages?: Record<string, string>;
    [key: string]: unknown;
}

declare interface LatLngLiteral {
    lat: number | undefined;
    lon?: number | undefined;
    lng?: number | undefined;
}

/** Legacy drag handlers historically mixed mouse and touch event surfaces. */
declare type LegacyEvent = Event & {
    originalEvent?: TouchEvent;
    targetTouches?: TouchList;
    pageX?: number;
    pageY?: number;
};

/** A point of the connection line: either a slide or a raw lat/lon pair. */
declare interface LinePoint {
    location?: StorymapSlideLocation;
    lat?: number;
    lon?: number;
}

/**
 * Append one stylesheet to the document head.
 *
 * @param url - The stylesheet URL.
 * @param options - Optional AbortSignal to cancel an in-flight load.
 * @returns Resolves when the stylesheet has loaded, rejects on error or abort.
 */
export declare function loadCSS(url: string, options?: LoadOptions): Promise<void>;

declare interface LoadOptions {
    /** Abort the load (removes the element, rejects the promise). */
    signal?: AbortSignal;
}

declare class Map_2 extends Map_base {
    constructor(...args: ConstructorParameters<typeof MapBase>);
}

declare const Map_base: {
    new (...args: any[]): {
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, HTMLElement>;
        data?: unknown;
        on: (type: string, fn: unknown, context?: unknown) => unknown;
        off: (type: string, fn: unknown, context?: unknown) => unknown;
        fire: (type: string, data?: unknown, target?: unknown) => unknown;
        hasEventListeners: (type: string) => boolean;
    };
} & {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof MapBase;

declare class MapBase {
    "_el": {
        container: HTMLElement;
        map: HTMLElement;
        map_mask: HTMLElement;
    };
    "_loaded": {
        data: boolean;
        map: boolean;
    };
    "_map": Map_3 | null;
    "_mini_map": default_2 | null;
    "_markers": MapMarker[];
    "zoom_min_max": {
        min: number | null;
        max: number | null;
    };
    "_line": Vector | null;
    "_line_active": Vector | null;
    "current_marker": number;
    "bounds_array": number[][] | null;
    "_tile_layer": Tile | null;
    "_tile_layer_mini": Tile | null;
    "_image_layer": Tile | null;
    "data": StorymapData;
    "options": StorymapOptions;
    "animator": AnimationHandle | null;
    "_transition_duration": number;
    "timer": ReturnType<typeof setTimeout> | null;
    "touch_scale": number;
    "scroll": ScrollState;
    "fire": EventedInstance["fire"];
    constructor(elem: string | HTMLElement, data?: Partial<StorymapData>, options?: Partial<StorymapOptions>);
    updateDisplay(w: number, h: number, animate?: boolean, d?: number, offset?: unknown): void;
    goTo(n: number, change?: boolean): void;
    panTo(loc: LatLngLiteral, animate?: boolean): void;
    zoomTo(z: number, animate?: boolean): void;
    viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void;
    getBoundsZoom(m1: LatLngLiteral, m2: LatLngLiteral, inside?: boolean, padding?: unknown): void;
    markerOverview(): void;
    calculateMarkerZooms(): void;
    createMiniMap(): void;
    setMapOffset(left: number, top: number): void;
    calculateMinMaxZoom(): void;
    updateMinMaxZoom(zoom: number): void;
    initialMapLocation(): void;
    show(): void;
    hide(): void;
    createMarkers(array: StorymapSlide[]): void;
    createMarker(d: StorymapSlide): void;
    _destroyMarker(marker: MapMarker): void;
    _createMarkers(array: StorymapSlide[]): void;
    /**
     * A slide has a real location: lat and lon are both numbers — lat 0 and
     * lon 0 are valid coordinates and must not be treated as missing.
     */
    _hasLocation(d: StorymapSlide): boolean;
    _createMap(): void;
    _createMiniMap(): void;
    _createMarker(d?: StorymapSlide): void;
    _addMarker(marker: MapMarker): void;
    _removeMarker(marker: MapMarker): void;
    _resetMarkersActive(): void;
    _calculateMarkerZooms(): void;
    _createLine(d?: StorymapSlide): unknown;
    _addToLine(line: Vector | null, d: LinePoint): void;
    _replaceLines(line: Vector | null, d: LinePoint[], animate?: {
        duration: number;
        retractFrom?: LinePoint[] | null;
        growFrom?: LinePoint[] | null;
    }): void;
    _addLineToMap(line: Vector): void;
    _panTo(loc: LatLngLiteral, animate?: boolean): void;
    _zoomTo(z: number, animate?: boolean): void;
    _viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void;
    _updateMapDisplay(animate?: boolean, d?: number): void;
    _refreshMap(): void;
    _getMapZoom(): number;
    _getMapCenter(correct_for_center?: boolean): LatLngLiteral;
    _getBoundsZoom(m1: LatLngLiteral, m2: LatLngLiteral, inside?: boolean, padding?: unknown): number;
    _markerOverview(duration?: number): void;
    /**
     * Great-circle length of the route through all markers in kilometers;
     * `undefined` when the map cannot compute it or there are fewer than two
     * markers (issue #341).
     */
    getRouteDistance(): number | undefined;
    _onMarkerChange(e?: unknown): void;
    _onMarkerClick(e: {
        marker_number: number;
    }): void;
    _onMapLoaded(e?: unknown): void;
    _onWheel(e: WheelEvent): void;
    _scollZoom(e?: unknown): void;
    _scollZoomDone(e?: unknown): void;
    _calculateZoomChange(origin: LatLngLiteral, destination: LatLngLiteral, correct_for_center?: boolean): number;
    _updateDisplay(w?: number, h?: number, animate?: boolean, d?: number, offset?: unknown): void;
    /** Re-apply runtime-changed options (no-op in the base class) */
    applyOptions(_keys: string[]): void;
    _initLayout(): void;
    _initData(): void;
    /** Hook after marker creation (overridden per engine as needed) */
    _afterCreateMarkers(): void;
    _initEvents(): void;
}

declare class MapMarker extends MapMarker_base {
    constructor(...args: ConstructorParameters<typeof MapMarkerBase>);
}

declare const MapMarker_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof MapMarkerBase;

declare class MapMarkerBase {
    "_el": Record<string, HTMLElement>;
    "_marker": HTMLDivElement;
    "_icon": IconSpec | HTMLDivElement | false;
    "_custom_icon": IconSpec | false;
    "_custom_icon_url": string;
    "_custom_image_icon": string | false;
    "marker_number": number;
    "media_icon_class": string;
    "timer": ReturnType<typeof setTimeout> | null;
    "data": MapMarkerData;
    "options": StorymapOptions;
    "animator": AnimationHandle | null;
    "fire": EventedInstance["fire"];
    constructor(data?: MapMarkerData, options?: Partial<StorymapOptions>);
    show(): void;
    hide(): void;
    addTo(m: unknown): void;
    removeFrom(m: unknown): void;
    updateDisplay(w: number, h: number, a?: boolean): void;
    createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    active(a: boolean): void;
    location(): LatLngLiteral;
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    _addTo(m: unknown): void;
    _removeFrom(m: unknown): void;
    _active(a: boolean): void;
    _location(): LatLngLiteral;
    _onMarkerClick(e?: unknown): void;
    _initLayout(): void;
    _updateDisplay(width: number, height: number, animate?: boolean): void;
}

declare interface MapMarkerData {
    real_marker?: boolean;
    location?: StorymapSlideLocation;
    media?: StorymapSlideMedia & {
        mediatype?: MediaTypeMatch | null;
    };
    text?: {
        headline?: string;
    };
    type?: string;
    [key: string]: unknown;
}

declare interface MediaInstance {
    addTo: (container: HTMLElement) => void;
    loadMedia: () => void;
    stopMedia: () => void;
    updateDisplay: (w?: number, h?: number, l?: string) => void;
    on?: EventedInstance["on"];
    _state?: {
        loaded?: boolean;
        eager?: boolean;
    };
}

/**
 * Resolve the media handler for a slide's media object: matches the URL (and
 * optional explicit `type`) against the supported media types — YouTube,
 * Vimeo, images, audio, video, ...
 *
 * @param m - The slide media definition.
 * @returns The matching media type entry, or `false` for unknown media.
 */
export declare function MediaType(m: StorymapSlideMedia): MediaTypeMatch | false;

declare type MediaTypeMatch = {
    type: string;
    name: string;
    match_str: string;
    cls: new (data: StorymapSlideMedia, options: Record<string, unknown>) => unknown;
};

declare class MenuBar extends MenuBar_base {
    constructor(...args: ConstructorParameters<typeof MenuBarBase>);
}

declare const MenuBar_base: {
    new (...args: any[]): {
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, HTMLElement>;
        data?: unknown;
        on: (type: string, fn: unknown, context?: unknown) => unknown;
        off: (type: string, fn: unknown, context?: unknown) => unknown;
        fire: (type: string, data?: unknown, target?: unknown) => unknown;
        hasEventListeners: (type: string) => boolean;
    };
} & {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof MenuBarBase;

declare class MenuBarBase {
    "_el": Record<string, HTMLElement>;
    "collapsed": boolean;
    "options": MenuBarOptions;
    "animator": Record<string, unknown>;
    "fire": EventedInstance["fire"];
    _fullscreenActive: boolean;
    constructor(elem: HTMLElement | string, parent_elem?: HTMLElement, options?: object);
    show(d?: number): void;
    hide(top: number): void;
    setSticky(y: number): void;
    setColor(inverted: boolean): void;
    /**
     * Reflect the fullscreen state in the button label/icon.
     */
    setFullscreenState(active: boolean): void;
    /**
     * Repaint every text label from the active language (see `setLanguage`).
     * Icon-only mobile buttons carry no text and are left untouched.
     */
    refreshLabels(): void;
    /**
     * Update the progress indicator (issue #247); no-op when disabled.
     */
    setProgress(current: number, total: number): void;
    /**
     * Update the route distance display (issue #341); no-op when disabled or
     * before the first reading.
     */
    setDistance(kilometers?: number): void;
    updateDisplay(w?: number, h?: number, a?: boolean): void;
    _onButtonOverview(e: Event): void;
    _onButtonBackToStart(e: Event): void;
    _onButtonFullscreen(e: Event): void;
    _onButtonCollapseMap(e: Event): void;
    _initLayout(): void;
    _updateDisplay(width?: number, height?: number, animate?: boolean): void;
}

declare interface MenuBarOptions {
    width: number;
    height: number;
    duration: number;
    ease: unknown;
    menubar_default_y: number;
    [key: string]: unknown;
}

declare class Message extends Message_base {
    constructor(...args: ConstructorParameters<typeof MessageBase>);
}

declare const Message_base: {
    new (...args: any[]): {
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, HTMLElement>;
        data?: unknown;
        on: (type: string, fn: unknown, context?: unknown) => unknown;
        off: (type: string, fn: unknown, context?: unknown) => unknown;
        fire: (type: string, data?: unknown, target?: unknown) => unknown;
        hasEventListeners: (type: string) => boolean;
    };
} & {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof MessageBase;

declare class MessageBase {
    "_el": Record<string, HTMLElement>;
    "options": MessageOptions;
    "data": Record<string, unknown>;
    "animator": Record<string, unknown>;
    "fire": EventedInstance["fire"];
    constructor(data?: Record<string, unknown>, options?: Record<string, unknown>, add_to_container?: HTMLElement);
    updateMessage(t: string): void;
    _updateMessage(t?: string): void;
    _onMouseClick(): void;
    _initLayout(): void;
    _initEvents(): void;
}

declare interface MessageOptions {
    width: number;
    height: number;
    message_class: string;
    message_icon_class: string;
    [key: string]: unknown;
}

declare class OpenLayers extends Map_2 {
    "_map": default_4;
    "_tile_layer": Tile;
    "_line": Vector;
    "_line_active": Vector;
    "_tile_layer_mini": Tile | null;
    "_mini_map": default_2;
    "_markers": OpenLayersMapMarker[];
    /** App-level stacked overlays (see the `overlays` option) */
    "_overlay_layers": Tile[];
    /** rAF handle of the running active-line draw animation */
    "_line_animation": number | null;
    _createMap(): void;
    /** Extra attribution fragments (e.g. overlay credits), always listed last. */
    "_extra_attributions": string[];
    /**
     * Append extra attribution fragments and refresh the line. Hosts with
     * custom layers use this instead of rewriting `.vco-map-attribution`.
     */
    setExtraAttributions(parts: string[]): void;
    /**
     * (Re)render the attribution line for the current map type. Called at
     * creation and on every `map_type` switch, which previously left the
     * initial text stale.
     */
    _updateAttribution(): void;
    _getAttribution(map_type: string): string[];
    /**
     * Create the tile layer and register its load handler. Deferred until
     * the visitor allows map tiles in consent mode.
     */
    _addTileLayer(): void;
    /**
     * Ask for tile consent, then attach the layers if allowed.
     */
    _requestTileConsent(consent: ConsentManager, tile_service: string): Promise<void>;
    /**
     * (Re)build the stacked raster overlays from the `overlays` option.
     * Overlays sit above the base tiles (z 1..n) and below the route lines
     * (z 10/11); every entry accepts any `map_type` value plus declarative
     * presentation, so hosts no longer capture and patch layer objects.
     */
    _buildOverlays(): void;
    /**
     * Convert a lon/lat clip box to view units. Only meaningful on
     * mercator maps; image-space maps (iiif/zoomify) and malformed
     * boxes yield null (no constraint).
     */
    _lonLatBboxToExtent(bbox: [number, number, number, number]): Extent | null;
    /**
     * Apply an overlay's blend mode to its layer container. The container
     * div only exists once the layer has rendered, so retry on later
     * frames (bounded: rendering settles within a frame or two of any
     * add/visibility change).
     */
    _paintOverlayBlend(entry: {
        className?: string;
        blendMode?: string;
    }, retries?: number): void;
    /** Refresh the attribution line with the visible overlays' credits. */
    _syncOverlayAttributions(): void;
    /** Number of stacked overlay layers (see the `overlays` option). */
    getOverlayCount(): number;
    /** Show or hide a stacked overlay by index (re-syncs attribution). */
    setOverlayVisible(index: number, visible: boolean): void;
    /** Set a stacked overlay's opacity by index. */
    setOverlayOpacity(index: number, opacity: number): void;
    /**
     * Map tiles were allowed: attach the main tile layer, create the
     * minimap's deferred layer if it was withheld, then re-fit.
     */
    _onTilesAllowed(): void;
    /**
     * Legacy zoomify image pyramid: the levels (image size per level), the
     * max zoom and the mercator bounds the image occupies (stretched from
     * the world's top-left corner, the original renderer's mapping).
     */
    _zoomifyPyramid(): {
        sizes: Array<[number, number]>;
        maxZoom: number;
        extent: number[];
        tileGrid: default_6;
    } | null;
    /**
     * The zoomify overview state: the best-fit pyramid level for a map
     * window (the level whose image, times the tolerance, fits the window —
     * the legacy `_getBestFitZoom`) and the image's mercator center.
     */
    _zoomifyOverview(mapSize: [number, number]): {
        zoom: number;
        center: number[];
    } | null;
    _createTileLayer(map_type: string): Tile;
    _createDefaultTileLayer(map_type: string): Tile;
    _createVectorStyleLayer(style_url: string): Tile;
    _createMiniMap(): void;
    _fitMiniMapToImage(): void;
    _createMarker(d: StorymapSlide): void;
    _addMarker(marker: OpenLayersMapMarker): void;
    /**
     * Position marker overlays on the unwrapped longitude path so they sit on
     * the same world copy as the fitted view and the line (issue #381).
     * Image-space coordinates are not degrees and stay untouched.
     */
    _afterCreateMarkers(): void;
    _removeMarker(marker: OpenLayersMapMarker): void;
    _getAllMarkersBounds(markers_array: OpenLayersMapMarker[]): number[][];
    /**
     * Normalize a longitude sequence so consecutive values differ by at most
     * 180 degrees: markers keep their raw coordinates (OpenLayers wraps the
     * display), but fits and lines use the unwrapped path (issue #381).
     */
    _unwrapLongitudes(lons: number[]): number[];
    _markerCoordsToViewCoords(coords: number[][]): number[][];
    /**
     * The View extent for the `map_bbox` option, or `null` when unset. The
     * view uses it with `constrainOnlyCenter` (see _createMap).
     */
    _bboxExtent(): number[] | null;
    /**
     * The slide content panel can be opaque — it then covers part of the map
     * and the effective visible area shrinks. Returns the pixel padding for
     * the covered side (right in landscape, bottom in portrait) so fits keep
     * the story inside the visible region; transparent panels and panels
     * that do not overlap the map (map_area "left") add nothing.
     */
    _opaquePanelPadding(): [number, number, number, number];
    /**
     * Fit the given coordinates. With `clamp_to_bbox` (the strict bbox
     * layout, map_area "left"), markers outside of the box are unreachable
     * by design — they must not skew the fit target, so the extent is
     * intersected with the box and the in-box markers compose the view.
     */
    _fitView(ol_map: default_4, coords: number[][], duration?: number, clamp_to_bbox?: boolean): void;
    _calculateMarkerZooms(): void;
    /**
     * Stroke style for the route lines: the dash pattern and line join are
     * applied at init too, matching the original rendering (the lines are
     * dashed "5,5" by default, not solid).
     */
    _lineStyle(color: string): Style;
    _createLine(d?: StorymapSlide): Vector;
    _addLineToMap(line: Vector): void;
    _addToLine(line: Vector, d: LinePoint): void;
    /**
     * Replace a line's geometry. With `animate.duration > 0` only the latest
     * hop animates, in sync with the view animation: the already-traveled
     * prefix stays drawn while the new segment traces progressively, so half
     * way through the pan the old connections are fully red and only half
     * the new hop is. Backward navigation mirrors this: the traveled prefix
     * stays drawn while the far end pulls back along the abandoned hop.
     */
    _replaceLines(line: Vector, array: LinePoint[], animate?: {
        duration: number;
        retractFrom?: LinePoint[] | null;
        growFrom?: LinePoint[] | null;
    }): void;
    /** Cancel a running active-line draw animation. */
    _cancelLineAnimation(): void;
    /** Total euclidean length of a path in view coordinates. */
    _pathLength(coords: number[][]): number;
    /**
     * The prefix of the path up to `length` (in view units), with the cut
     * point interpolated inside its segment.
     */
    _truncatePath(coords: number[][], length: number): number[][];
    _panTo(loc: LatLngLiteral, animate?: boolean): void;
    _zoomTo(z: number, animate?: boolean): void;
    _viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void;
    _toViewCoords(loc: LatLngLiteral): number[];
    _getMapZoom(): number;
    _getMapCenter(offset?: boolean): LatLngLiteral;
    _getMapCenterOffset(location: LatLngLiteral, zoom: number): LatLngLiteral;
    _fromViewCoords(coord: number[], projection: default_7): LatLngLiteral;
    _getBoundsZoom(origin: LatLngLiteral, destination: LatLngLiteral, correct_for_center?: boolean): number;
    _initialMapLocation(): void;
    /**
     * Great-circle (haversine) length of the route through all markers in
     * kilometers (issue #341).
     */
    getRouteDistance(): number | undefined;
    _markerOverview(duration?: number): void;
    /**
     * Swap the minimap's layer for the current `map_type` (mirrors the
     * initial `_createMiniMap` fitting: zoomify extent, IIIF image extent,
     * otherwise the marker bounds). No-op when no minimap exists yet.
     */
    _refreshMiniMapLayer(): void;
    /**
     * Re-apply runtime-changed options (driven by StoryMap.setMapOptions).
     * Only keys with an immediate effect are handled here; everything else is
     * picked up on the next navigation or layout pass.
     */
    applyOptions(keys: string[]): void;
    _updateMapDisplay(animate?: boolean, d?: number, instant?: boolean): void;
    _refreshMap(instant?: boolean): void;
    /**
     * Set the view synchronously (resize path): OL's animate() applies its
     * end state asynchronously which can leave marker overlays rendering
     * stale positions after a size change.
     */
    _setViewInstant(loc: StorymapSlideLocation, zoom: number): void;
}

declare class OpenLayersMapMarker extends MapMarker {
    "_overlay": default_5;
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    _createMarkerElement(d: MapMarkerData, o?: StorymapOptions): HTMLDivElement;
    _addTo(m: Map_3): void;
    _removeFrom(m: Map_3): void;
    _active(a: boolean): void;
    _customIconAnchor(size?: number[]): number[];
    _location(): LatLngLiteral;
}

/** Wheel/scroll zoom bookkeeping (handles cleared via clearTimeout). */
declare interface ScrollState {
    start_time: number | null;
    timer?: ReturnType<typeof setTimeout>;
    timer_done?: ReturnType<typeof setTimeout>;
}

/**
 * Switch the active UI language.
 *
 * @param code - A locale code for which a locale file exists (e.g. `"en"`).
 * @returns The language entry that is now active.
 */
export declare function setLanguage(code: string): LanguageEntry;

declare class Slide extends Slide_base {
    constructor(...args: ConstructorParameters<typeof SlideBase>);
}

declare const Slide_base: {
    new (...args: any[]): {
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, HTMLElement>;
        data?: unknown;
        on: (type: string, fn: unknown, context?: unknown) => unknown;
        off: (type: string, fn: unknown, context?: unknown) => unknown;
        fire: (type: string, data?: unknown, target?: unknown) => unknown;
        hasEventListeners: (type: string) => boolean;
    };
} & {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof SlideBase;

declare interface SlideBackgroundChange {
    color_value?: string;
    image?: boolean;
}

declare class SlideBase {
    "_el": Record<string, HTMLElement>;
    "_media": MediaInstance | null;
    "_mediaclass": unknown;
    "_text": Text_2;
    "_state": {
        loaded: boolean;
    };
    "_scroll_hint": HTMLElement | null;
    "_scroll_hint_dismissed": boolean;
    "has": SlideHas;
    "title": string;
    "data": StorymapSlide;
    "options": SlideOptions;
    "active": boolean;
    "animator": unknown;
    "fire": EventedInstance["fire"];
    "onLoaded": () => void;
    constructor(data: StorymapSlide, options: Record<string, unknown>, title_slide?: boolean);
    show(): void;
    hide(): void;
    setActive(is_active: boolean): void;
    updateDisplay(w?: number, h?: number, l?: string): void;
    loadMedia(): void;
    _eagerLoadImages(): void;
    stopMedia(): void;
    getBackground(): {
        image: boolean;
        color: boolean;
        color_value: string;
    };
    scrollToTop(): void;
    /**
     * Show a bouncing downward arrow when the slide content overflows
     * (scrollable) — the hint of "more below" for scrollbars that are not
     * visible until touched. Hidden after the first scroll of any kind;
     * tappable to scroll down one step.
     */
    _updateScrollHint(): void;
    _hideScrollHint(): void;
    _onScrollHintClick(): void;
    _onSlideScroll(): void;
    addCallToAction(str: string): void;
    _onCallToAction(e: Event): void;
    _initLayout(): void;
    _updateDisplay(width?: number, height?: number, layout?: string): void;
}

declare interface SlideHas {
    headline: boolean;
    text: boolean;
    media: boolean;
    title: boolean;
    background: {
        image: boolean;
        color: boolean;
        color_value: string;
    };
}

declare class SlideNav extends SlideNav_base {
    constructor(...args: ConstructorParameters<typeof SlideNavBase>);
}

declare const SlideNav_base: {
    new (...args: any[]): {
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, HTMLElement>;
        data?: unknown;
        on: (type: string, fn: unknown, context?: unknown) => unknown;
        off: (type: string, fn: unknown, context?: unknown) => unknown;
        fire: (type: string, data?: unknown, target?: unknown) => unknown;
        hasEventListeners: (type: string) => boolean;
    };
} & {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof SlideNavBase;

declare class SlideNavBase {
    "_el": Record<string, HTMLElement>;
    "mediatype": unknown;
    "data": SlideNavData;
    "options": SlideNavOptions;
    "animator": AnimationHandle | null;
    "animator_position": AnimationHandle | null;
    "fire": EventedInstance["fire"];
    constructor(data?: Partial<SlideNavData>, options?: Partial<SlideNavOptions>, add_to_container?: HTMLElement);
    update(d?: Partial<SlideNavData>): void;
    setColor(inverted: boolean): void;
    updatePosition(pos: Record<string, number | string>, use_percent: boolean, duration: number, ease: unknown, start_value: number, return_to_default: boolean): void;
    _onUpdatePositionComplete(return_to_default: boolean): void;
    _onMouseClick(): void;
    _update(d?: Partial<SlideNavData>): void;
    _initLayout(): void;
    _initEvents(): void;
    _onKeyDown(e: Event): void;
}

declare interface SlideNavData {
    title: string;
    description: string;
    date?: string;
    [key: string]: unknown;
}

declare interface SlideNavOptions {
    direction: string;
    [key: string]: unknown;
}

declare interface SlideOptions {
    duration: number;
    slide_padding_lr: number;
    ease: unknown;
    width: number;
    height: number;
    skinny_size: number;
    media_name?: string;
    media_type?: string;
    [key: string]: unknown;
}

export declare class StoryMap extends StoryMap_base {
    /**
     * The library base path (the directory containing the module).
     * Derived from `import.meta.url`, which works both for the source module
     * (src/main.ts) and the built ESM bundle (js/storymap.js).
     */
    static SCRIPT_PATH: string;
    constructor(...args: ConstructorParameters<typeof StoryMapBase>);
}

declare const StoryMap_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof StoryMapBase;

/**
 * Interactive StoryMap viewer.
 *
 * Renders a storymap JSON document (or a IIIF Presentation 3 manifest) into an
 * element: an OpenLayers map on one side and a slide slider on the other.
 *
 * @example
 * ```ts
 * import { StoryMap } from "storymapjs";
 * // from an inline data object
 * const map = new StoryMap("embed", { storymap: { ... } }, { start_at_slide: 2 });
 * // or straight from a source file (storymap JSON or IIIF manifest)
 * const map2 = new StoryMap(document.getElementById("embed"), "./my-storymap.json");
 * ```
 */
declare class StoryMapBase {
    "_loaded": {
        storyslider: boolean;
        map: boolean;
    };
    "on": EventedInstance["on"];
    "version": string;
    "ready": boolean;
    "_el": {
        container: HTMLElement;
        menubar: HTMLElement;
        map: HTMLElement;
        storyslider: HTMLElement;
    };
    "_storyslider": StorySlider;
    "_map": OpenLayers;
    "map": Map_3;
    "_menubar": MenuBar;
    "data": StorymapData;
    "options": StorymapOptions;
    "current_slide": number;
    "animator_map": AnimationHandle | null;
    "animator_storyslider": AnimationHandle | null;
    "_autoplay_timer": ReturnType<typeof setTimeout> | null;
    "_transition_timer": ReturnType<typeof setTimeout> | null;
    "_autoplay_stopped": boolean;
    "_hash_initialized": boolean;
    /** the data source was a IIIF Presentation manifest (legacy zoomify options are ignored) */
    "_data_from_manifest": boolean;
    "_resize_observer": ResizeObserver | null;
    "_resize_timer": ReturnType<typeof setTimeout> | null;
    "fire": EventedInstance["fire"];
    "hasEventListeners": EventedInstance["hasEventListeners"];
    /**
     * Create a StoryMap inside the given element.
     *
     * @param elem - The container element, or its DOM id.
     * @param data - Either an inline storymap document (`{ storymap: ... }`),
     *   an inline IIIF Presentation 3 manifest, or the URL of a source file
     *   (storymap JSON or IIIF manifest) that is fetched automatically.
     * @param options - Optional {@link StorymapOptions} overrides (map type,
     *   lines, fonts, animation, raw OpenLayers options via `map_options`...).
     * @param listeners - Optional event listeners keyed by event name
     *   (`change`, `title`, `loaded`, ...) attached on creation.
     */
    constructor(elem: string | HTMLElement, data: string | StorymapDataWrapper | Record<string, unknown>, options?: Partial<StorymapOptions>, listeners?: Record<string, StoryMapListener | StoryMapListener[]>);
    _initData(data: string | StorymapDataWrapper | Record<string, unknown>): void;
    _loadDataFromUrl(url: string, source: string): Promise<void>;
    _initOptions(): void;
    _loadLanguage(): void;
    refreshLanguage(code: string): void;
    _loadFontCss(): Promise<void>;
    _onFontLoaded(font: string): void;
    /**
     * Navigate to a slide by index.
     *
     * @param n - Zero-based slide index; the map animates to the slide's
     *   marker (or the overview when `n` is 0 for storymaps with one).
     */
    goTo(n: number): void;
    /**
     * Announce a slide transition: `transitionstart` now (with the glide
     * duration both animations were started with) and `transitionend` once
     * it elapses. Restarts on every navigation, so only the latest
     * transition ever ends.
     */
    _beginTransition(duration: number): void;
    /**
     * Re-measure the container and re-layout the map, slider and menubar.
     * Called automatically on resize (see the `trackResize` option).
     */
    updateDisplay(): void;
    /**
     * Change a single map option at runtime and apply its effect immediately.
     *
     * Runtime-changeable options: `map_type` (rebuilds the main + minimap tile
     * layers, keeping the overview fitted to the marker bounds), `overlays`
     * (rebuilds the stacked overlay layers), `show_lines`, `line_color`,
     * `line_color_inactive`, `line_weight`, `line_opacity`, `line_dash`,
     * `line_join`, `line_follows_path`, `show_history_line` (restyled
     * instantly), `map_center_offset` (applied on the next navigation),
     * `duration`, `ease`, `calculate_zoom`, `map_background_color`. All other
     * options only take effect on the next navigation or require re-creating
     * the StoryMap.
     */
    setMapOption(name: string, value: unknown): void;
    /**
     * Show or hide a stacked overlay by index (see the `overlays` option).
     */
    setOverlayVisible(index: number, visible: boolean): void;
    /**
     * Set a stacked overlay's opacity by index (see the `overlays` option).
     */
    setOverlayOpacity(index: number, opacity: number): void;
    /**
     * Change several map options at runtime (see setMapOption).
     */
    setMapOptions(options: Partial<StorymapOptions>): void;
    _initLayout(): void;
    _initEvents(): void;
    _onKeyDownGlobal(e: KeyboardEvent): void;
    _updateDisplay(map_height?: number, animate?: boolean, d?: number): void;
    _onDataLoaded(e?: unknown): void;
    _startAutoplay(): void;
    _scheduleAutoplay(): void;
    _stopAutoplay(): void;
    /** Keep the URL hash in sync with the current slide (#slide-N). */
    _syncHash(): void;
    /** A #slide-N hash deep-links the storymap (applied on load + hashchange). */
    _applyHashSlide(): boolean;
    _initResizeHandling(): void;
    /**
     * Resolve a caller-supplied map element (options.map_options.element).
     * The passed element is "replaced by the real one": it is adopted as the
     * map container (given the vco-map class) and moved into place between
     * the menubar and the story slider.
     */
    _resolveMapElement(): HTMLElement | null;
    _onTitle(e: unknown): void;
    _onColorChange(e: {
        color?: unknown;
        image?: unknown;
    }): void;
    _onSlideChange(e: {
        current_slide: number;
    }): void;
    _onMapChange(e: {
        current_marker: number;
    }): void;
    _updateProgress(): void;
    _onOverview(e?: unknown): void;
    /**
     * Toggle the native fullscreen API on the storymap container and keep the
     * menubar button state in sync.
     */
    _onFullscreenToggle(e?: unknown): void;
    _onFullscreenChange(): void;
    _onBackToStart(e?: unknown): void;
    _onMenuBarCollapse(e: {
        y: number;
    }): void;
    _onMapLoaded(): void;
    _onStorySliderLoaded(): void;
    /**
     * Compute and display the great-circle distance of the marker route
     * (issue #341); hidden when `show_distance` is off.
     */
    _updateDistance(): void;
    _onLoaded(): void;
}

declare interface StorymapData {
    uniqueid?: string;
    slides: StorymapSlide[];
    [key: string]: unknown;
}

export declare interface StorymapDataWrapper {
    storymap: StorymapData;
}

declare interface StorymapError {
    path: string;
    message: string;
}

declare type StoryMapListener = (e: unknown) => void;

/** OpenLayers passthrough options (see StorymapOptions.map_options) */
declare interface StorymapMapOptions {
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

export declare interface StorymapOptions {
    width: number;
    height: number;
    layout: string;
    base_class: string;
    default_bg_color: {
        r: number;
        g: number;
        b: number;
    };
    map_size_sticky: number;
    map_center_offset: {
        left: number;
        top: number;
    } | null;
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
    /** Show a progress bar in the menubar (issue #247) */
    show_progress: boolean;
    /** Show the slide headline as a label on the active map marker (issue #243) */
    marker_labels: boolean;
    /** Default text alignment for slide text: left, center or right (issue #244) */
    text_align: "left" | "center" | "right";
    /** Override the overview fit center (issues #107, #271) */
    map_overview_center: {
        lat: number;
        lon: number;
    } | null;
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
    zoomify?: {
        path?: string;
        width?: number;
        height?: number;
        tolerance?: number;
        attribution?: string;
    } | boolean;
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
    iiif: {
        url: string;
        attribution: string;
    };
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

/**
 * A stacked raster overlay above the base map (StorymapOptions.overlays).
 * Presentation is declarative: hosts no longer need to reach into the
 * layer objects for blend modes, clips or stacking tweaks.
 */
declare interface StorymapOverlayLayer {
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

export declare interface StorymapSlide {
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

declare interface StorymapSlideBackground {
    url?: string | null;
    color?: string | null;
    opacity?: number;
}

declare interface StorymapSlideLocation {
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

declare interface StorymapSlideMedia {
    url?: string | null;
    caption?: string | null;
    credit?: string | null;
    thumb?: string | null;
    mediatype?: MediaTypeMatch | null;
    [key: string]: unknown;
}

declare interface StorymapSlideText {
    headline?: string;
    text?: string;
    text_align?: string;
}

declare class StorySlider extends StorySlider_base {
    constructor(...args: ConstructorParameters<typeof StorySliderBase>);
}

declare const StorySlider_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof StorySliderBase;

declare class StorySliderBase {
    "_el": Record<string, HTMLElement>;
    "_nav": {
        previous: SlideNav;
        next: SlideNav;
    };
    "slide_spacing": number;
    "_slides": Slide[];
    "_swipable": Swipable;
    "preloadTimer": ReturnType<typeof setTimeout>;
    "_message": Message;
    "current_slide": number;
    "current_bg_color": string | null;
    "data": Partial<StorymapData>;
    "options": StorySliderOptions;
    "animator": AnimationHandle | null;
    "animator_background": AnimationHandle | null;
    "fire": EventedInstance["fire"];
    "_loaded": boolean;
    "hasEventListeners": EventedInstance["hasEventListeners"];
    constructor(elem: HTMLElement | string, data: Partial<StorymapData>, options?: Partial<StorySliderOptions>, init?: boolean);
    init(): void;
    updateDisplay(w?: number, h?: number, a?: unknown, l?: string): void;
    createSlide(d: StorymapSlide): void;
    createSlides(array: StorymapData["slides"]): void;
    _createSlides(array: StorymapData["slides"]): void;
    _createSlide(d: StorymapSlide, title_slide?: boolean): void;
    _addSlide(slide: Slide): void;
    goToId(n: string | number, fast?: boolean, displayupdate?: boolean): void;
    goTo(n: number, fast?: boolean, displayupdate?: boolean): void;
    preloadSlides(): void;
    getNavInfo(slide: Slide): {
        title: string;
        description: string;
    };
    next(): void;
    previous(): void;
    showNav(nav_obj: SlideNav, show: boolean): void;
    changeBackground(bg: SlideBackgroundChange): void;
    fadeInBackground(bg_css: string): void;
    _updateDisplay(width?: number, height?: number, animate?: unknown, layout?: string): void;
    _introInterface(): void;
    _initLayout(): void;
    _initEvents(): void;
    _onKeyDown(e: Event): void;
    _initData(): void;
    _onBackgroundChange(e: SlideBackgroundChange): void;
    _onMessageClick(e?: unknown): void;
    _onSwipeNoDirection(e?: unknown): void;
    _onNavigation(e: {
        direction: string;
    }): void;
    _onSlideAdded(e?: unknown): void;
    _onSlideChange(displayupdate?: boolean): void;
    _onLoaded(): void;
}

declare interface StorySliderOptions {
    id?: string;
    layout: string;
    width: number;
    height: number;
    default_bg_color: {
        r: number;
        g: number;
        b: number;
    };
    slide_padding_lr: number;
    start_at_slide: number;
    slide_default_fade: string;
    duration: number;
    ease: unknown;
    skinny_size?: number;
    call_to_action?: boolean;
    call_to_action_text?: string;
    dragging?: boolean;
    trackResize?: boolean;
    [key: string]: unknown;
}

declare class Swipable extends Swipable_base {
    constructor(...args: ConstructorParameters<typeof SwipableBase>);
}

declare const Swipable_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof SwipableBase;

declare class SwipableBase {
    "mousedrag": DragEventNames;
    "touchdrag": DragEventNames;
    "_el": Record<string, HTMLElement>;
    "options": SwipableOptions;
    "animator": AnimationHandle | null;
    "dragevent": DragEventNames;
    "data": DragData;
    "fire": EventedInstance["fire"];
    constructor(drag_elem: HTMLElement, move_elem?: HTMLElement, options?: Record<string, unknown>);
    enable(e?: LegacyEvent): void;
    disable(): void;
    stopMomentum(): void;
    updateConstraint(c: SwipableOptions["constraint"]): void;
    _onDragStart(e: LegacyEvent): void;
    _onDragEnd(e: LegacyEvent): void;
    _onDragMove(e: LegacyEvent): void;
    _momentum(): void;
    _animateMomentum(): void;
}

declare interface SwipableOptions {
    snap: boolean;
    enable: {
        x: boolean;
        y: boolean;
    };
    constraint: {
        top: number | boolean;
        bottom: number | boolean;
        left: number | boolean;
        right: number | boolean;
    };
    momentum_multiplier: number;
    duration: number;
    ease: unknown;
}

declare class Text_2 extends Text_base {
    constructor(...args: ConstructorParameters<typeof TextBase>);
}

declare const Text_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]>;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof TextBase;

declare class TextBase {
    "_el": Record<string, HTMLElement>;
    "data": TextData;
    "options": TextOptions;
    "fire": EventedInstance["fire"];
    constructor(data: TextData, options?: TextOptions, add_to_container?: HTMLElement);
    show(): void;
    hide(): void;
    addTo(container: HTMLElement): void;
    removeFrom(container: HTMLElement): void;
    headlineHeight(): number;
    addDateText(str: string): void;
    onLoaded(): void;
    onAdd(): void;
    onRemove(): void;
    _initLayout(): void;
}

declare interface TextData {
    uniqueid?: string | null;
    headline?: string;
    text?: string;
    text_align?: string;
    date?: {
        created_time?: string;
        [key: string]: unknown;
    } | null;
}

declare interface TextOptions {
    title?: boolean;
    text_align?: string;
}

/**
 * Custom tile layer/source factory (see
 * `StorymapOptions.tile_source_factory`). `createDefault` runs the
 * built-in `map_type` handling, so a factory can decorate or delegate.
 */
declare type TileSourceFactory = (map_type: string, context: {
    options: StorymapOptions;
    createDefault: () => Tile;
}) => Tile | default_3 | null | undefined;

/** Validate storymap JSON (the object containing a "storymap" property). */
export declare function validateStorymap(data: unknown): StorymapError[];

/** Validate and report all errors to the JavaScript console. Returns true when valid. */
export declare function validateStorymapAndReport(data: unknown, source?: string): boolean;

/** Options accepted by viewTo/_viewTo. */
declare interface ViewToOptions {
    calculate_zoom?: boolean;
    duration?: number;
    zoom?: number;
}

export { }

// Externally loaded script globals (YouTube/SoundCloud player APIs).
// Everything the library or the test harness touches on window is typed
// at its usage site instead.

declare global {
    // Externally loaded script globals
    const YT: {
        Player: new (el: HTMLElement | string, opts: unknown) => unknown;
        PlayerState: Record<string, number>;
    };
    const SC: {
        Widget: (el: HTMLElement) => { pause(): void };
    };
}
