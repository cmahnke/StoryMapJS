import { default as default_2 } from 'ol/control/OverviewMap';
import { default as default_3 } from 'ol/Overlay';
import { default as default_4 } from 'ol/tilegrid/TileGrid';
import { Extent } from 'ol/extent';
import { Map as Map_3 } from 'ol';
import { default as OlLayer } from 'ol/layer/Layer';
import { default as OlMap } from 'ol/Map';
import { default as OlProjection } from 'ol/proj/Projection';
import { default as OlSource } from 'ol/source/Source';
import { default as OlTileLayer } from 'ol/layer/Tile';
import { default as OlVectorLayer } from 'ol/layer/Vector';
import { default as OlView } from 'ol/View';
import { Style } from 'ol/style';
import { Tile } from 'ol/layer';
import { Vector } from 'ol/layer';
import { XYZ } from 'ol/source';

export declare interface AnimationHandle {
    stop: (jump?: boolean) => void;
}

/**
 * Per-StoryMap GDPR consent manager. When the `consent_required` option is
 * set, every external service (media embeds, map tiles, external font CSS)
 * asks for permission before anything is loaded.
 *
 * Decisions are remembered per service in localStorage with no expiry:
 * clearing site data is what makes the viewer ask again.
 */
declare class ConsentManager {
    private granted;
    private denied;
    /** unanswered asks per service (preloaded slides stack several) */
    private pending;
    /** the start-of-story dialog's row per service, so a decision made
     *  anywhere (including a standalone per-service ask) clears it */
    private startRows;
    /** every start-of-story dialog root we put on screen, so dispose() can
     *  take the whole thing down rather than just its rows */
    private startDialogs;
    /** set by dispose(); late answers are ignored rather than persisted */
    private disposed;
    constructor();
    /**
     * Seed the per-service state from localStorage, if present.
     *
     * Keys written by an earlier version are remapped onto the namespaced
     * form, so an existing visitor is not asked everything again after the
     * upgrade. The remap is written back once, which also clears the legacy
     * keys so they cannot drift out of sync later.
     */
    private restore;
    /**
     * Persist the per-service state to localStorage.
     *
     * A page can hold more than one viewer, and they all share this one
     * record — a visitor should not answer the same question twice for the
     * same service. So this *merges* into whatever is already stored instead
     * of replacing it: writing this viewer's full set back would silently
     * erase a decision a sibling viewer made, while that sibling still
     * believed otherwise. The merged result is then adopted, which is what
     * makes every viewer converge on the same decisions.
     */
    private persist;
    /** Replace the in-memory decision set with `state`, in place. */
    private adopt;
    /**
     * Re-read the shared record, so a decision the visitor made in a sibling
     * viewer is honoured here without having to reconstruct this one.
     */
    private sync;
    /**
     * Record a decision for one service and resolve every ask waiting on it.
     *
     * Both dialog shapes funnel through here, which is what keeps a service
     * from ending up in the granted *and* the denied set: the opposite set is
     * always cleared.
     */
    private decide;
    isGranted(service: string): boolean;
    isDenied(service: string): boolean;
    /** True when at least one of the services has no stored decision yet. */
    hasUnanswered(services: string[]): boolean;
    /**
     * Start-of-story consent dialog: lists every known external service
     * with per-service Allow/Deny, plus global "Allow all" / "Decline
     * all" buttons. Individual decisions reuse the per-service state
     * (pending slide asks resolve immediately); the dialog closes once
     * every service has a decision.
     */
    requestAll(services: ConsentService[], container: HTMLElement): void;
    /**
     * Ask the visitor for permission to load `service`, optionally naming the
     * `host` (shown in parentheses so they can see which domain is about to be
     * contacted). The ask is rendered into `container`; resolves
     * `true`/`false` on the visitor's decision, or immediately when the
     * service was already granted or denied.
     *
     * The service is stored and looked up by `service.key`; `service.label`
     * is only ever rendered.
     */
    request(service: ConsentService, host: string, container: HTMLElement): Promise<boolean>;
    /**
     * Release everything: drop the dialogs and settle every unanswered ask.
     *
     * `Media.loadMedia()` awaits `request()`. Without this, tearing the viewer
     * down while a panel was on screen left that `await` pending forever, and
     * the suspended frame kept the whole media subtree — DOM included — alive.
     * Unanswered asks resolve `false`, which is the same outcome as declining.
     */
    dispose(): void;
}

/**
 * An external service the viewer asks permission to load.
 *
 * `key` is the *only* thing ever persisted, and it is stable, namespaced and
 * never localized. `label` is display-only.
 *
 * These are two separate fields on purpose. The code used to pass a single
 * string that served as both, which had two consequences:
 *
 *  - the tile and font services used a *localized* string as the localStorage
 *    key, so translating `consent_service_tiles` would have silently
 *    invalidated every stored decision the moment the page language changed;
 *  - the per-slide panel used the media type *slug* as its display label, so
 *    it asked "Load content from youtube?" where the start-of-story dialog,
 *    20 lines away, correctly said "YouTube".
 *
 * With the pair split, passing a label where a key is expected is no longer
 * expressible.
 */
declare interface ConsentService {
    /** Stable, namespaced, non-localized. The only value that is stored. */
    key: string;
    /** Display name. Localized for tiles/fonts; a brand name for media. */
    label: string;
}

export declare type ContentState = {
    /** The canvas (or other resource) the state points at. */
    id: string;
    /**
     * `[x, y, w, h]` in canvas pixels, when the state names a part of the
     * canvas. Carried on the id as an `xywh=` fragment, which is the
     * Media Fragments spelling the spec uses in every region example.
     */
    region?: [number, number, number, number];
};

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
    cancel?: string;
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

/** What kind of imagery an `imageready` source carries. */
export declare type ImagereadyKind = "iiif" | "zoomify" | "tiles";

/**
 * Payload of the `imageready` event: the source that became usable, what
 * kind of imagery it is, and the layer carrying it (`null` when the source
 * outlives its layer).
 */
export declare interface ImagereadyPayload {
    source: {
        getState?(): string;
    };
    kind: ImagereadyKind;
    layer: OlLayer | null;
}

/** True when `data` is a Presentation API 3.0 Collection. */
export declare function isPresentation3Collection(data: unknown): boolean;

/**
 * True when `data` looks like a Presentation API 3.0 **Manifest**.
 *
 * A `Collection` is explicitly *not* one, even though it carries the same
 * `@context`. Detection used to accept anything with the P3 context, so a
 * Collection passed and its member Manifests were fed to `canvasToSlide` as if
 * they were Canvases — every member became a text-only slide, with no media, no
 * locations and no warning. `within`-style Collections are now handled by the
 * private `collectionToStorymapData` below, and anything else is rejected here.
 */
export declare function isPresentation3Manifest(data: unknown): boolean;

/**
 * UI strings for the active locale.
 *
 * English is the fallback for every missing key (see `getLanguage`), so
 * `messages` and `buttons` are guaranteed to be fully populated once a
 * language has been set — they are typed as required here rather than as
 * `Record<string, string> | undefined` so call sites do not need a null
 * check on every one of the ~30 `Language.messages.*` reads.
 *
 * The locale JSON files themselves are *not* complete: only `en.json` defines
 * every key, and 28 of the 29 bundled locales are missing 8-10 of them
 * (the per-service consent strings and the fullscreen button labels). The
 * runtime falls back to English per key, so this is a translation gap rather
 * than a defect — `npm run check:locales` reports it.
 */
export declare interface LanguageEntry {
    /** Display name of the language, e.g. "Deutsch". */
    name?: string;
    /** BCP 47 code, e.g. "de". */
    lang?: string;
    /** Writing direction; drives the `vco-rtl` layout. */
    direction?: "ltr" | "rtl";
    messages: Record<string, string>;
    buttons: Record<string, string>;
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
export declare interface LatLngLiteral {
    lat: number;
    lon: number;
    lng?: number;
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
 * Concurrent and repeat requests for the same URL share one `<link>`.
 *
 * @param url - The stylesheet URL.
 * @param options - Optional AbortSignal to cancel an in-flight load.
 * @returns Resolves when the stylesheet has loaded, rejects on error or abort.
 */
export declare function loadCSS(url: string, options?: LoadOptions): Promise<void>;

export declare interface LoadOptions {
    /** Abort the load (removes the element, rejects the promise). */
    signal?: AbortSignal;
}

/**
 * Converts a IIIF Presentation API 3.0 manifest into legacy StoryMapJS data
 * (the `storymap` object). Malformed or missing pieces are skipped; the
 * result always contains at least `{slides: []}`.
 */
export declare function manifestToStorymapData(manifest: unknown): StorymapData;

declare class Map_2 extends Map_base {
    constructor(...args: ConstructorParameters<typeof MapBase>);
}

declare const Map_base: {
    new (...args: any[]): {
        container(): HTMLElement;
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, unknown>;
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
        }[]> | undefined;
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
    /**
     * Zooms computed by the engine's `_calculateMarkerZooms`, keyed by
     * marker index. Kept off `marker.data` so navigating never mutates the
     * author's storymap document (`StoryMap.data` is that same object graph).
     */
    "_marker_zooms": (number | undefined)[];
    "zoom_min_max": {
        min: number | null;
        max: number | null;
    };
    "_line": Vector | null;
    "_line_active": Vector | null;
    "current_marker": number;
    "bounds_array": number[][] | null;
    "_tile_layer": OlLayer | null;
    "_tile_layer_mini": OlLayer | null;
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
    /**
     * Alias over the OpenLayers view: `storymap.map.getView().animate({center})`
     * (remember `ol/proj` does not apply in image mode — see `isImageSpace()`).
     */
    panTo(loc: LatLngLiteral, animate?: boolean): void;
    /** Alias over the OpenLayers view: `storymap.map.getView().animate({zoom})`. */
    zoomTo(z: number, animate?: boolean): void;
    /**
     * Alias over the OpenLayers view: `storymap.map.getView().animate(...)`,
     * or `.fit(extent, {size})` for a region stop (`location.region`).
     */
    viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void;
    /** Alias over the OpenLayers view: `view.getZoomForResolution(resolution)`. */
    getBoundsZoom(m1: LatLngLiteral, m2: LatLngLiteral, inside?: boolean, padding?: unknown): number | undefined;
    /**
     * Alias over the OpenLayers view: `view.fit(extent, {size})` over all
     * marker positions. Also reachable from the menubar's overview button.
     */
    markerOverview(): void;
    /**
     * The viewer's own marker zoom ladder — no OpenLayers equivalent (it also
     * writes the computed zoom onto the current markers).
     */
    calculateMarkerZooms(): void;
    /**
     * The minimap is built with the constructor; reach it with `getMinimap()`
     * (an OpenLayers `OverviewMap` control) rather than re-creating it.
     */
    createMiniMap(): void;
    setMapOffset(left: number, top: number): void;
    calculateMinMaxZoom(): void;
    /**
     * The zoom to use for min/max bounds at marker `index`: the value
     * computed by the engine when there is one, else the zoom authored on
     * the slide. The engine overrides this to serve its computed-zoom store
     * so `StoryMap.data` is never written to.
     */
    _markerZoom(index: number): number | undefined;
    updateMinMaxZoom(zoom: number): void;
    initialMapLocation(): void;
    /**
     * @deprecated No-op since 0.9.x upstream (the original Leaflet engine
     * defined an empty body too) and shadowed by the `DomMixed` mixin. To
     * hide the map, toggle the OpenLayers target:
     * `storymap.map.getTargetElement().style.display = "none"`.
     */
    show(): void;
    /**
     * @deprecated See {@link show} — no-op since 0.9.x upstream. Use
     * `storymap.map.getTargetElement().style.display = "none"`.
     */
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
    /**
     * The {lat, lon} points of every marker from the first up to and
     * including `n`, skipping the ones without a real location. This was four
     * near-identical loops building the same thing.
     */
    private _locationsUpTo;
    /**
     * The slide's {lat, lon} point, or null when it has no real location.
     *
     * Preferred over testing `_hasLocation()` and then reading
     * `data.location.lat`: a boolean guard does not narrow the property for
     * the type checker, so the old form had to be trusted and re-checked by
     * hand at every one of its dozen call sites.
     */
    _locationOf(d: StorymapSlide): LatLngLiteral | null;
    /**
     * Image region stop: the slide carries an xywh region ([x, y, w, h]
     * image pixels). Only the OpenLayers engine applies it (image mode);
     * the region never contributes to route lines.
     */
    _hasRegion(d: StorymapSlide): boolean;
    _createMap(): void;
    _createMiniMap(): void;
    _createMarker(d?: StorymapSlide): void;
    _addMarker(marker: MapMarker): void;
    _removeMarker(marker: MapMarker): void;
    _resetMarkersActive(): void;
    _calculateMarkerZooms(): void;
    _createLine(d?: StorymapSlide): unknown;
    /** Append a slide's location to a route line. Takes the *slide*, not a
     *  point — the engine reads `d.location`. */
    _addToLine(line: Vector | null, d: StorymapSlide): void;
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
    /**
     * The `ease` option as an OpenLayers easing function.
     *
     * `ease` is documented as either a function or a name, so the cast to
     * OpenLayers' expected shape was repeated at all ten `view.animate()` call
     * sites.
     */
    protected get _easing(): ((t: number) => number) | undefined;
    /**
     * Zoom that fits the two given points, or `undefined` when the engine
     * cannot compute one. Mirrors `getRouteDistance`: the base class is the
     * no-op template, the OpenLayers subclass returns a real value.
     */
    _getBoundsZoom(m1: LatLngLiteral, m2: LatLngLiteral, inside?: boolean, padding?: unknown): number | undefined;
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
    _calculateZoomChange(origin: LatLngLiteral, destination: LatLngLiteral, correct_for_center?: boolean): number | undefined;
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
        }[]> | undefined;
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
    /**
     * @deprecated No-op since 0.9.x upstream (the original marker defined an
     * empty body too). Markers are never individually hidden; use CSS on
     * `.vco-mapmarker`, or `active(false)` to dim one.
     */
    show(): void;
    /** @deprecated See {@link show} — no-op since 0.9.x upstream. */
    hide(): void;
    /**
     * @deprecated Never implemented, in the original viewer either: the base
     * `MapMarker._createPopup` had an empty body and the Leaflet override's
     * body was commented out, so the `map_popup` option that called it never
     * had any effect. Kept as a no-op so pre-0.10 code that calls it keeps
     * working. Render the slide text yourself, or use CSS on
     * `.vco-mapmarker` to show a label.
     */
    createPopup(_d?: MapMarkerData, _o?: StorymapOptions): void;
    addTo(m: unknown): void;
    removeFrom(m: unknown): void;
    updateDisplay(w: number, h: number, a?: boolean): void;
    createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    active(a: boolean): void;
    location(): LatLngLiteral | null;
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    _addTo(m: unknown): void;
    _removeFrom(m: unknown): void;
    _active(a: boolean): void;
    /**
     * The marker's coordinate, or null when it has none (an overview slide, or
     * a slide carrying only an image region). Every caller treats null as
     * "nothing to focus", so this is the honest shape — the previous
     * `{ lat: 0, lng: 0 }` was a real point at Null Island, spelled with a
     * longitude key nothing in the map read.
     */
    _location(): LatLngLiteral | null;
    _onMarkerClick(e?: unknown): void;
    _initLayout(): void;
    _updateDisplay(width: number, height: number, animate?: boolean): void;
}

/**
 * A marker's data: the slide it was created from, plus the `real_marker` flag
 * the marker sets once it has confirmed numeric lat/lon. A separate interface
 * used to drift from `StorymapSlide` (narrower `text`, its own `location`),
 * which then made `Map._createMarker(slide)` unassignable.
 */
declare type MapMarkerData = StorymapSlide & {
    real_marker?: boolean;
};

/** The resolved marker presentation: `marker.*` over `location.*`. */
declare interface MarkerPresentation {
    icon?: string;
    iconSize?: number[];
    image?: string;
    label?: string;
    popup: boolean;
    audioBadge: boolean;
    useCustomMarker?: boolean;
}

declare interface MediaInstance {
    addTo: (container: HTMLElement) => void;
    loadMedia: () => void;
    stopMedia: () => void;
    updateDisplay: (w?: number, h?: number, l?: string) => void;
    dispose?: () => void;
    on?: EventedInstance["on"];
    off?: EventedInstance["off"];
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

export declare type MediaTypeMatch = {
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
        container(): HTMLElement;
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, unknown>;
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
        }[]> | undefined;
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
     * Repaint the overview button label. An image map has no interactive
     * overview, so it gets the shorter wording.
     */
    _renderOverviewLabel(): void;
    /**
     * Repaint the "back to start" button label. Icon-only on mobile.
     */
    _renderBackToStartLabel(): void;
    /**
     * Repaint the collapse/expand toggle. Icon-only on mobile.
     */
    _renderCollapseLabel(collapsed: boolean): void;
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
    /**
     * Release the button listeners, the progress animation and the element.
     * Called by `StoryMap.dispose()`; the menubar must not be used afterwards.
     */
    dispose(): void;
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
        container(): HTMLElement;
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, unknown>;
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
        }[]> | undefined;
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
    /**
     * Release the click listener and drop the element. Called by
     * `StorySlider.dispose()`; the message must not be used afterwards.
     */
    dispose(): void;
}

declare interface MessageOptions {
    width: number;
    height: number;
    message_class: string;
    message_icon_class: string;
    [key: string]: unknown;
}

export { OlLayer }

export { OlMap }

export { OlProjection }

export { OlSource }

export { OlTileLayer }

export { OlVectorLayer }

export { OlView }

declare class OpenLayers extends Map_2 {
    "_map": OlMap;
    "_tile_layer": OlLayer;
    "_line": Vector;
    "_line_active": Vector;
    "_tile_layer_mini": OlLayer | null;
    "_mini_map": default_2;
    "_markers": OpenLayersMapMarker[];
    /** App-level stacked overlays (see the `overlays` option) */
    "_overlay_layers": OlLayer[];
    /**
     * The `overlays[]` entries that produced a layer, parallel to
     * `_overlay_layers`: a malformed entry is skipped, so the two arrays
     * can be shorter than the option list.
     */
    "_overlay_entries": StorymapOverlayLayer[];
    /** rAF handle of the running active-line draw animation */
    "_line_animation": number | null;
    /** Sources `imageready` has already been fired for. */
    "_imageready_fired": WeakSet<object>;
    _createMap(): void;
    /** Extra attribution fragments (e.g. overlay credits), always listed last. */
    "_extra_attributions": string[];
    /**
     * Append extra attribution fragments and refresh the line. Hosts with
     * custom layers use this instead of rewriting `.vco-map-attribution`.
     */
    setExtraAttributions(parts: string[]): void;
    /** The base tile layer (the one created for `map_type`), if consent has not deferred it. */
    getBaseLayer(): OlLayer | null;
    /** The stacked `overlays[]` layers, in `overlays[]` order. */
    getOverlayLayers(): OlLayer[];
    /** One stacked overlay layer by its `overlays[]` index, or `null`. */
    getOverlayLayer(index: number): OlLayer | null;
    /** The minimap's OpenLayers map (the `OverviewMap` control's inner map). */
    getMinimap(): OlMap | null;
    /** The full (inactive) route line layer. */
    getLine(): OlLayer | null;
    /** The highlighted route line layer drawn up to the current slide. */
    getLineActive(): OlLayer | null;
    /** The markers, in slide order (the index matches the slide index). */
    getMarkers(): OpenLayersMapMarker[];
    /** One marker by slide index, or `null`. */
    getMarker(index: number): OpenLayersMapMarker | null;
    /**
     * (Re)render the attribution line for the current map type. Called at
     * creation and on every `map_type` switch, which previously left the
     * initial text stale.
     */
    _updateAttribution(): void;
    _getAttribution(map_type: string): string[];
    /**
     * The provider credit for `map_type` as plain text (no HTML), for the
     * OpenLayers source `attributions`. Our own `.vco-map-attribution` line
     * stays the rendered default and uses the linked `_getAttribution`
     * version; this makes `source.getAttributions()` (and a consumer's
     * `ol/control/Attribution`) work instead of returning nothing.
     */
    _sourceAttributions(map_type: string): string[];
    /**
     * Create the tile layer and register its load handler. Deferred until
     * the visitor allows map tiles in consent mode.
     */
    _addTileLayer(): void;
    /**
     * Ask for tile consent, then attach the layers if allowed.
     */
    _requestTileConsent(consent: ConsentManager, tile_service: ConsentService): Promise<void>;
    /**
     * (Re)build the stacked raster overlays from the `overlays` option.
     * Overlays sit above the base tiles (z 1..n) and below the route lines
     * (z 10/11); every entry accepts any `map_type` value plus declarative
     * presentation, so hosts no longer capture and patch layer objects.
     * An entry carrying a `georeference` places a IIIF image on the
     * geographic map instead of stacking a tile source.
     */
    _buildOverlays(): void;
    /**
     * Build a stacked overlay from a IIIF Georeference Extension payload
     * (`overlays[].georeference`): the ground control points are fitted
     * affinely and the image is placed as a geographic extent, which
     * OpenLayers reprojects onto the view exactly like the IIIF basemap.
     *
     * The layer is returned empty and filled in asynchronously, mirroring
     * the `iiif` basemap path — only the fit (pure, synchronous) decides
     * whether a layer exists at all, so overlay indices stay stable.
     */
    _createGeoreferencedOverlay(entry: StorymapOverlayLayer): Tile | null;
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
    /**
     * Number of stacked overlay layers (see the `overlays` option). Alias:
     * `getOverlayLayers().length`.
     */
    getOverlayCount(): number;
    /**
     * Show or hide a stacked overlay by index (re-syncs attribution). The
     * index counts built layers, i.e. it skips malformed entries.
     *
     * Prefer `getOverlayLayer(index).setVisible(v)` on the layer itself; this
     * wrapper exists because it also re-syncs the attribution line and the
     * overlay blend mode, which a bare `setVisible()` does not.
     */
    setOverlayVisible(index: number, visible: boolean): void;
    /** Set a stacked overlay's opacity by index. */
    /**
     * Alias: `getOverlayLayer(index)?.setOpacity(opacity)`.
     */
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
        tileGrid: default_4;
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
    _createTileLayer(map_type: string): OlLayer;
    /**
     * A layer's source, or null when it has none. Custom `Layer` subclasses
     * passed through `_createTileLayer` (e.g. Allmaps' `WarpedMapLayer`)
     * deliberately have no `getSource`, so every read goes through here
     * instead of calling the method directly.
     */
    _sourceOf(layer: OlLayer | null | undefined): OlSource | null;
    /**
     * Move the map into another element, keeping OpenLayers in step.
     *
     * `DomMixed.addTo()` (the original semantics, unchanged: append the map
     * container, fire `added`) only moves DOM — the `ol/Map` still has the
     * viewport it measured at construction, so it would keep painting at the
     * old size. Re-attach the target, which `removeFrom()` detached, and
     * re-measure. The argument must be the new parent.
     */
    addTo(container: HTMLElement): this;
    /**
     * Move the map out of `container`. Untargets the OpenLayers map so it
     * does not render into a detached node; a later {@link addTo} re-attaches
     * it. The argument must be the current parent.
     */
    removeFrom(container: HTMLElement): this;
    /**
     * True when the map is a plain image in an `EPSG:4326` "image space"
     * rather than a geographic map: a IIIF image presented as a picture of
     * the world (`map_as_image`), not georeferenced.
     *
     * In this mode the view projection is `EPSG:4326` with degrees as
     * resolution and the view is fitted to the image extent, so
     * `getCenter()`/`getZoom()` are in degrees/pixels-per-degree — not
     * mercator metres. Marker locations are pixel offsets into the image,
     * not lat/lon. Georeferenced IIIF (`map_bbox` with `map_as_image`
     * omitted) is a normal mercator map; use `isImageSpace()` rather than
     * testing `map_type` to tell the two apart.
     */
    isImageSpace(): boolean;
    /**
     * Stop the line animation, drop the minimap control and dispose the
     * OpenLayers map. Called by `StoryMap.dispose()`; the engine must not be
     * used afterwards.
     */
    dispose(): void;
    /**
     * Fire `imageready` once `source` is usable (and immediately when it
     * already is). Image sources — IIIF, zoomify, the deferred tile layer —
     * attach asynchronously, so this is the only outward signal that the
     * imagery is really on the map; the `loaded` event can fire before the
     * source is attached at all.
     */
    _fireImageready(source: {
        getState?(): string;
    }, kind: ImagereadyKind, layer?: OlLayer): void;
    /** Computed zooms take precedence over the authored slide zoom. */
    _markerZoom(index: number): number | undefined;
    /**
     * The TileJSON metadata, but only when it is describing `url`.
     *
     * `tilejson` describes the map's tile source, so its `tiles` template is
     * the one the map_type resolved to. When it names a different template it
     * is not about this source, and neither the zoom ladder nor the initial
     * view should be taken from it.
     */
    _tilejsonFor(url: string): StorymapTilejson | undefined;
    /**
     * An XYZ source for a URL template, honouring the TileJSON metadata of the
     * map's own tile source if it is describing this template (§2.9).
     *
     * `minzoom`/`maxzoom` become the tile grid's zoom range, so OpenLayers asks
     * for levels the service actually has and stops past the ones it does not.
     * `scheme: "tms"` is the TMS row order, which is the same URL with the tile
     * row counted from the bottom.
     */
    _xyzSource(url: string): XYZ;
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
    _fitView(ol_map: OlMap, coords: number[][], duration?: number, clamp_to_bbox?: boolean): void;
    _calculateMarkerZooms(): void;
    /**
     * Stroke style for the route lines: the dash pattern and line join are
     * applied at init too, matching the original rendering (the lines are
     * dashed "5,5" by default, not solid).
     */
    _lineStyle(color: string): Style;
    _createLine(d?: StorymapSlide): Vector;
    _addLineToMap(line: Vector): void;
    _addToLine(line: Vector, d: StorymapSlide): void;
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
    /**
     * Image region stop: fit the xywh bbox ([x, y, w, h] image pixels —
     * the EPSG:4326 image space) with the shared animation options, then
     * keep the minimap collapse state in sync like `_viewTo`.
     */
    _fitRegion(region: [number, number, number, number], opts?: ViewToOptions): void;
    _toViewCoords(loc: LatLngLiteral): number[];
    _getMapZoom(): number;
    _getMapCenter(): LatLngLiteral;
    _getMapCenterOffset(location: LatLngLiteral, zoom: number): LatLngLiteral;
    _fromViewCoords(coord: number[], projection: OlProjection): LatLngLiteral;
    /**
     * May a tile-backed layer (base map, overlay, minimap, overview) be
     * created right now? Under `consent_required` that is only true once the
     * visitor has allowed the tile service. This was the same five-line
     * predicate at five call sites.
     */
    private _tilesAllowed;
    /** A slide's {lat, lon} when both are real numbers, else null. */
    private _latLngOf;
    /**
     * The map's pixel size, with a never-zero fallback.
     *
     * `getSize()` returns undefined until the map has a size, so the six
     * call sites that fitted an extent to the viewport all repeated the same
     * `(size[0] || 1)` guard — which silently fitted against a 1px viewport
     * rather than bailing out.
     */
    private _viewportSize;
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
    "_overlay": default_3;
    "_onMarkerClickBound": ((e: Event) => void) | null;
    /** marker.popup: the active marker opens its card when clicked. */
    "_popup_enabled": boolean;
    /** marker.audioBadge: flag a slide that has narration or audio media. */
    "_audio_badge": boolean;
    /**
     * The popup card while it is open. `declare` fields are undefined until
     * assigned, so every read below is a truthiness check, never `=== null`,
     * and there is no constructor to initialise them: `MapMarker`'s own
     * constructor already runs `_initLayout()` → `_createMarker()`, which
     * assigns the flags, and initialising afterwards would wipe them.
     */
    "_popup_el": HTMLElement | null;
    /** Escape-to-close, detached in dispose(). */
    "_onPopupKeyBound": ((e: KeyboardEvent) => void) | null;
    /** Mirrors `active()`, as a flag rather than a method reference. */
    "_is_active": boolean;
    /**
     * The merged marker presentation: `marker.*` wins, `location.*` is the
     * legacy spelling and still works (docs/plans/iiif-media-tours.md §2).
     * `location` also stays the carrier of geography, so lat/lon are read
     * from it alone — presentation never moves a marker.
     */
    _presentation(d?: MapMarkerData): MarkerPresentation;
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void;
    _createMarkerElement(d: MapMarkerData, o?: StorymapOptions): HTMLDivElement;
    /**
     * The marker's {lat, lon}, or null when it is a non-georeferenced marker
     * (an overview slide, or a slide with only an image region). `_createMarker`
     * already established this for a real marker, but returning it from one
     * place means the type checker can see it too.
     */
    latLon(): LatLngLiteral | null;
    _addTo(m: Map_3): void;
    _removeFrom(m: Map_3): void;
    /**
     * Terminal teardown: detach the click listener and drop the overlay and
     * element. Called by the map's dispose(); the marker must not be used
     * afterwards.
     */
    /**
     * Toggle the popup card for the *active* marker. Inactive markers keep
     * their original behaviour — a click navigates — so a popup never
     * swallows navigation on a map full of pins.
     *
     * The card is a DOM element parented to the marker element and positioned
     * with CSS, which is how it survives a move to the vector renderer
     * (docs/plans/issue-159-vector-markers.md): only the anchor is the
     * marker's, and that is `latLon()`.
     */
    _togglePopup(): void;
    _closePopup(): void;
    get popupOpen(): boolean;
    /**
     * Headline, a sanitized excerpt, the media thumb and an audio control.
     * Every piece of text goes through `sanitizeSlideText` — a slide's text
     * is untrusted input and a marker card is no different (the stored-XSS
     * audit made that lesson once; a label is attacker-controlled text like
     * any other).
     */
    _createPopupElement(): HTMLElement | null;
    /**
     * A small indicator on markers whose slide has narration or audio media
     * (the Micrio affordance). Recomputed on activation, because a slide's
     * media may only be known once it is resolved.
     */
    _updateAudioBadge(): void;
    dispose(): void;
    _active(a: boolean): void;
    _customIconAnchor(size?: number[]): number[];
    _location(): LatLngLiteral | null;
}

/** Wheel/scroll zoom bookkeeping (handles cleared via clearTimeout). */
declare interface ScrollState {
    start_time: number | null;
    timer?: ReturnType<typeof setTimeout>;
    timer_done?: ReturnType<typeof setTimeout>;
}

/**
 * Switch the active UI language. Synchronous: the viewer resolves its labels
 * while it is being constructed.
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
        container(): HTMLElement;
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, unknown>;
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
        }[]> | undefined;
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
    /** `call_to_action` is only created when the slide shows one. */
    "_el": SlideElements;
    "_media": MediaInstance | null;
    "_mediaclass": unknown;
    "_text": Text_2;
    "_state": {
        loaded: boolean;
    };
    "_scroll_hint": HTMLElement | null;
    "_scroll_hint_dismissed": boolean;
    "_onSlideScrollBound": EventListener;
    /** Every `media_ended` handler registered via `onMediaEnded`, kept so `dispose()` can remove them. */
    "_media_ended_fns": (() => void)[];
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
    /**
     * Release the slide's listeners, media and DOM. Called by
     * `StorySlider.dispose()`; the slide must not be used afterwards.
     */
    dispose(): void;
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
    /**
     * True when this slide's media is a timed, playable one (audio or video).
     * `autoplay_media` waits for such a slide's media to end instead of using
     * its timer; everything else keeps the timer.
     */
    hasPlayableMedia(): boolean;
    /**
     * Call `fn` when this slide's media finishes playing. A slide with no
     * media — or media that cannot end — never calls it, which is why
     * `autoplay_media` keeps its timer as a fallback rather than waiting on
     * an event that may not arrive.
     */
    onMediaEnded(fn: () => void): void;
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

/**
 * The slide's element cache. `call_to_action` is null until the slide is told
 * to show one (`addCallToAction`).
 */
declare type SlideElements = {
    container: HTMLElement;
    scroll_container: HTMLElement;
    background: HTMLElement;
    content_container: HTMLElement;
    content: HTMLElement;
    call_to_action: HTMLElement | null;
};

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
        container(): HTMLElement;
        show(animate?: unknown): void;
        hide(): void;
        addTo(container: HTMLElement): /*elided*/ any;
        removeFrom(container: HTMLElement): /*elided*/ any;
        setPosition(pos: Record<string, number>, el?: HTMLElement): /*elided*/ any;
        onLoaded(): void;
        onAdd(): void;
        onRemove(): void;
        _el: Record<string, unknown>;
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
        }[]> | undefined;
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
    /**
     * Release the listeners and the position animation. Called by
     * `StorySlider.dispose()`; the nav must not be used afterwards.
     */
    dispose(): void;
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
        }[]> | undefined;
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
 * import { StoryMap } from "@projektemacher/storymapjs";
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
        map: HTMLElement | null;
        storyslider: HTMLElement;
    };
    "_storyslider": StorySlider;
    "_map": OpenLayers | null;
    /** `map_type: "none"`: the story is text-and-media, with no map at all. */
    "_map_disabled": boolean;
    /**
     * The raw OpenLayers map. `null` until the map is built (the
     * constructor assigns it during data load) — check it, or use the
     * accessors, which return `null` until then.
     */
    "map": Map_3 | null;
    "_menubar": MenuBar;
    "data": StorymapData;
    "options": StorymapOptions;
    "current_slide": number;
    /**
     * The manifest this viewer was built from, kept so `loadAnnotations()` can
     * resolve its `seeAlso` targets. `null` for a storymap-JSON viewer, which
     * has no `seeAlso`.
     */
    "_raw_manifest": unknown | null;
    /**
     * The deep link the page was opened with, captured before anything can
     * rewrite the URL.
     *
     * This has to be read *early*. The slider's opening `goTo()` can reach
     * `_navigate()` before `_onLoaded()` runs, and `_navigate()` calls
     * `_syncHash()` — which would overwrite the incoming link with the current
     * slide before `_onLoaded()` ever looked at it. Whether that happens
     * depends on the order the slider and map finish loading, which is exactly
     * the kind of race that makes a deep link work most of the time.
     */
    "_initial_deep_link": {
        state: ContentState | null;
        hash: string;
    } | null;
    "animator_map": AnimationHandle | null;
    "animator_storyslider": AnimationHandle | null;
    "_autoplay_timer": ReturnType<typeof setTimeout> | null;
    "_transition_timer": ReturnType<typeof setTimeout> | null;
    "_autoplay_stopped": boolean;
    /** The narration player: one <audio> for the whole story, reused. */
    "_narration_el": HTMLAudioElement | null;
    /** Guards a stale play() from a slide change that already moved on. */
    "_narration_token": number;
    /** Whether narration consent was granted (asked once per story). */
    "_narration_allowed": boolean;
    /** True once the visitor has clicked/keyed: unmuted audio needs this. */
    "_user_gestured": boolean;
    /** The advance armed for the current slide (media-ended or the timer). */
    "_autoplay_advance": (() => void) | null;
    /** A narration that was skipped for want of a gesture, to retry later. */
    "_replayNarrationAfterGesture": boolean;
    "_hash_initialized": boolean;
    "_collapsed": boolean;
    /** the data source was a IIIF Presentation manifest (legacy zoomify options are ignored) */
    "_data_from_manifest": boolean;
    "_resize_observer": ResizeObserver | null;
    /** Stored so `dispose()` can remove them again (see AGENTS: no leaks) */
    "_on_resize": (() => void) | null;
    "_on_keydown_global": ((e: KeyboardEvent) => void) | null;
    "_on_fullscreen": (() => void) | null;
    "_on_hashchange": (() => void) | null;
    /** Set by `dispose()` so a second call returns early. */
    "_disposed": boolean;
    /** identity of this viewer's claim on the page-wide locale */
    "_language_holder": symbol;
    /** the locale the caller actually asked for, if any; see _loadLanguage */
    "_language_requested": string | undefined;
    /** bumped on interaction, so page-wide keys can pick one viewer */
    "_interaction": number;
    "_onInteraction": (() => void) | null;
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
    /**
     * The locale this viewer was actually asked for, or undefined when the
     * caller and the document both stayed silent.
     */
    _requestedLanguage(): string | undefined;
    refreshLanguage(code: string): void;
    /**
     * Repaint everything a runtime language switch affects: the menubar
     * labels and the `vco-rtl` class.
     *
     * This deliberately does *not* call `updateDisplay()`. A full re-layout
     * re-runs the slider's `goTo(current_slide)`, which goes through the
     * navigation path that re-arms autoplay — so calling it here silently
     * cancelled a pending autoplay tick and the story stopped advancing.
     */
    _applyLanguageLayout(): void;
    _loadFontCss(): Promise<void>;
    _onFontLoaded(font: string): void;
    /**
     * Navigate to a slide by index. Out-of-range indices are ignored, as is
     * the current index.
     *
     * @param n - Zero-based slide index; the map animates to the slide's
     *   marker. The overview is selected by the slide's own
     *   `type: "overview"`, not by its index.
     */
    goTo(n: number): void;
    /**
     * The single navigation path shared by programmatic navigation, the
     * slider's `change` event, the map's `change` event and "back to start".
     *
     * `navigate` names the single component that the bubble source already
     * moved; the other component follows. `navigated` says whether the caller
     * has *not* already reported the change outward, so the outward `change`
     * event fires exactly once per navigation (the bubble paths would
     * otherwise re-enter through the other component's handler).
     */
    private _navigate;
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
     * Runtime-changeable options: `map_type` (swaps one basemap for another and
     * rebuilds the main + minimap tile layers, keeping the overview fitted to
     * the marker bounds; it cannot add or remove a map, and `"none"` and
     * non-strings are declined), `overlays`
     * (rebuilds the stacked overlay layers), `show_lines`, `line_color`,
     * `line_color_inactive`, `line_weight`, `line_opacity`, `line_dash`,
     * `line_join`, `line_follows_path`, `show_history_line` (restyled
     * instantly), `map_center_offset` (applied on the next navigation),
     * `duration`, `ease`, `calculate_zoom`, `map_background_color`. All other
     * options only take effect on the next navigation or require re-creating
     * the StoryMap.
     */
    /**
     * Sugar over {@link setMapOptions} — `setMapOption(name, value)` is the
     * same call as `setMapOptions({ [name]: value })`.
     */
    setMapOption(name: string, value: unknown): void;
    /**
     * Show or hide a stacked overlay by index (see the `overlays` option).
     * Prefer `getOverlayLayer(index).setVisible(v)` on the layer itself; this
     * wrapper also re-syncs the attribution line and the overlay blend mode.
     */
    setOverlayVisible(index: number, visible: boolean): void;
    /**
     * Set a stacked overlay's opacity by index (see the `overlays` option).
     * Alias: `getOverlayLayer(index)?.setOpacity(opacity)`.
     */
    setOverlayOpacity(index: number, opacity: number): void;
    /**
     * Change several map options at runtime (see setMapOption).
     */
    setMapOptions(options: Partial<StorymapOptions>): void;
    /** The base tile layer, or `null` when deferred (tile consent not granted). */
    getBaseLayer(): OlLayer | null;
    /** The stacked `overlays[]` layers, in `overlays[]` order. */
    getOverlayLayers(): OlLayer[];
    /** One stacked overlay layer by its `overlays[]` index, or `null`. */
    getOverlayLayer(index: number): OlLayer | null;
    /** Number of stacked overlay layers (see the `overlays` option). */
    getOverlayCount(): number;
    /** The minimap's OpenLayers map (the `OverviewMap` control's inner map). */
    getMinimap(): Map_3 | null;
    /** The full (inactive) route line layer. */
    getLine(): OlLayer | null;
    /**
     * True when the map shows a IIIF image as a picture of the world
     * (`map_as_image`) rather than as a georeferenced map. In that mode the
     * view is `EPSG:4326` image space: `map.getView().getCenter()` is in
     * degrees, the resolution is in pixels per degree, and marker locations
     * are pixel offsets into the image. Ask this instead of checking
     * `map_type` — georeferenced IIIF (`map_bbox` without `map_as_image`)
     * is an ordinary mercator map.
     */
    isImageSpace(): boolean;
    /**
     * The `uniqueid` of a slide — the current one by default.
     *
     * A IIIF manifest supplies one per canvas (§2.3) and it is the only
     * identity a link can be built on, since an index moves when a slide is
     * inserted. A storymap-JSON slide usually has none, in which case this is
     * `null` rather than a generated id: a random one would be stable to nobody.
     */
    getSlideId(index?: number): string | null;
    /**
     * Read the annotation documents this manifest points at with `seeAlso` and
     * add the tour stops they carry.
     *
     * Explicit and asynchronous on purpose (§5.2). The alternative — following
     * `seeAlso` inside `manifestToStorymapData` — would mean one blocking
     * network round trip per referenced document before the viewer could paint
     * its first slide, against third-party servers the host may not want to
     * contact at all. Here the story stands on its own immediately and the
     * annotations arrive afterwards, behind a per-(id, type) cache, and
     * `annotationsloaded` fires when they are in.
     *
     * The stops are **appended**, not placed after the canvas they annotate.
     * A canvas's own annotations are inserted in position at parse time; doing
     * the same to a live tour would mean rebuilding the slider and every piece
     * of state that hangs off it, for an ordering nicety. A host that needs
     * the stops placed exactly can read them off the resolved value and place
     * them itself.
     *
     * @returns the stops that were added, keyed by canvas id, plus any
     *   `SearchService1` endpoint seen and any document that failed to load.
     */
    loadAnnotations(options?: {
        fetchImpl?: typeof fetch;
    }): Promise<{
        stops: StorymapSlide[];
        searchService: string | null;
        failed: string[];
    }>;
    /**
     * Release everything the viewer attached to the page: window/document
     * listeners, timers, the resize observer, running Web Animations, the
     * slider, the menubar, the map and the map markers. Use this when tearing
     * a storymap down (SPA route change, modal close).
     *
     * Teardown is terminal: the host container is emptied, `map` becomes
     * null, and the public methods (`goTo`, `setMapOptions`,
     * `createMiniMap`, ...) become no-ops rather than throwing. There is no
     * re-init path; build a new StoryMap on the same element instead.
     * Calling `dispose()` twice is a no-op.
     */
    dispose(): void;
    /* Excluded from this release type: element */
    /* Excluded from this release type: interaction */
    /** The highlighted route line drawn up to the current slide. */
    getLineActive(): OlLayer | null;
    /** The map markers, indexed by slide. */
    getMarkers(): OpenLayersMapMarker[];
    /** One map marker by slide index, or `null`. */
    getMarker(index: number): OpenLayersMapMarker | null;
    /**
     * Rebuild the minimap (`OverviewMap` control). The constructor already
     * builds it; this is for hosts that recreate it after a `map_type` swap
     * or a deferred tile-consent grant.
     */
    createMiniMap(): void;
    /**
     * Append attribution fragments and refresh the credit line (e.g. for a
     * custom layer added through `tile_source_factory`).
     */
    setExtraAttributions(parts: string[]): void;
    /**
     * Publish the text colour custom properties. Called from both the initial
     * layout and every runtime option change (issue #177) so the two paths
     * cannot drift.
     */
    _applyTextColors(): void;
    _initLayout(): void;
    _initEvents(): void;
    _onKeyDownGlobal(e: KeyboardEvent): void;
    _updateDisplay(map_height?: number, animate?: boolean, d?: number): void;
    _onDataLoaded(e?: unknown): void;
    /**
     * Start-of-story consent (issue: allow all / individually / decline
     * all): with `consent_required`, one dialog lists every external
     * service the story uses — map tiles, external web fonts and the media
     * services in the slides. Shown only while some service is unanswered;
     * per-service slide asks remain the fallback.
     */
    _startConsentAsk(): void;
    /**
     * Play the current slide's narration, if it has one.
     *
     * One `<audio>` element is reused for the whole story rather than a
     * player per slide, so switching slides cannot leave a recording playing
     * behind. Two things gate it:
     *
     * - **browser autoplay policy**: unmuted audio only plays after a user
     *   gesture, so before the first interaction the element is left paused
     *   and nothing is reported as broken. Re-arm on the first interaction.
     * - **consent**: the `media:narration` service is requested at start-up
     *   (see `_startConsentAsk`); a denied or unanswered service means no
     *   playback, and the story still works.
     */
    _playNarration(slide: StorymapSlide | undefined, allow_without_gesture?: boolean): void;
    _narrationElement(): HTMLAudioElement;
    _stopNarration(): void;
    /** A gesture has happened, so unmuted audio is allowed from now on. */
    _note_user_gesture_for_narration(): void;
    _has_user_gesture(): boolean;
    _startAutoplay(): void;
    /**
     * Arm autoplay for the current slide.
     *
     * With `autoplay_media` on and a slide whose media is playable audio or
     * video, the advance waits for that media to end instead of using the
     * `autoplay` millisecond timer. The timer is **kept as a fallback** in
     * that case too: a media element that never fires `ended` (a stalled
     * fetch, a codec the browser cannot play, or a slide whose media was
     * never loaded because the visitor skipped past it) would otherwise stop
     * the story dead. So both are armed, whichever fires first advances, and
     * the other is cleared.
     */
    _scheduleAutoplay(): void;
    _stopAutoplay(): void;
    /**
     * The current slide's `uniqueid`, or null when the data carries none.
     *
     * A storymap-JSON slide usually has no `uniqueid` — the slider generates
     * one per slide for its own DOM ids, but that is not a shareable identity,
     * so it is deliberately not used here. A IIIF manifest supplies one per
     * canvas (§2.3), and that is what a deep link should name.
     */
    _currentSlideId(): string | null;
    /** The current slide as a Content State, or null when it has no id. */
    _currentContentState(): ContentState | null;
    /**
     * Keep the URL in sync with the current slide: the `#slide-…` hash and,
     * when the slide has a shareable id, an `iiif-content` parameter (§5.1).
     *
     * The query string is rewritten rather than replaced, because pages like
     * the embed player and the test harness carry their own configuration in
     * it (`?url=…`, `?example=…`, `?manifest=…`).
     */
    _syncHash(): void;
    /**
     * A `#slide-…` hash or an `iiif-content` parameter deep-links the storymap
     * (applied on load + hashchange).
     *
     * The hash token is an index when it is all digits and a `uniqueid`
     * otherwise, which is unambiguous because an index never contains anything
     * else. The index form stays supported, so links shared before ids were
     * emitted keep working; they just stop being stable the moment a slide is
     * inserted.
     */
    _applyHashSlide(captured?: {
        state: ContentState | null;
        hash: string;
    } | null): boolean;
    /**
     * A content state or hash token as a slide index, or null when it names
     * nothing. A content state wins over the hash, being the standard spelling.
     */
    _resolveDeepLink(state: ContentState | null, hash: string): number | null;
    /** A canvas id as a slide index, or null. */
    _slideIndexById(id: string): number | null;
    _initResizeHandling(): void;
    /**
     * Resolve a caller-supplied map element (options.map_options.element).
     * The passed element is "replaced by the real one": it is adopted as the
     * map container (given the vco-map class) and moved into place between
     * the menubar and the story slider.
     */
    /**
     * The map pane, for the code paths that only run when there is a map.
     * `_el.map` is null exactly when the engine is; see `_map_required()`.
     */
    _map_el(): HTMLElement;
    /**
     * The map engine, for the code paths that only run when there is a map.
     * Throws rather than returning null: reaching one of these from a mapless
     * story is a bug in this class, and a loud one, rather than a layout that
     * quietly misbehaves. Public entry points use `this._map?.` instead.
     */
    _map_required(): OpenLayers;
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
        y?: number;
        collapsed?: boolean;
    }): void;
    _onMapLoaded(): void;
    _onStorySliderLoaded(): void;
    /**
     * Compute and display the great-circle distance of the marker route
     * (issue #341); hidden when `show_distance` is off.
     */
    _updateDistance(): void;
    /**
     * The URL is ours to own as soon as the story is: the deep link is read
     * and the hash is kept in step.
     *
     * This deliberately does **not** wait for the map. The map only reports
     * itself loaded on OpenLayers' first `loadend`, which is the first paint of
     * the base tiles — so a deep link used to be applied only once
     * `tile.openstreetmap.org` answered, and on a slow or unreachable tile
     * host it was never applied at all. Nothing about a URL depends on imagery:
     * the data and the slider are what it needs, and both are ready before the
     * map is. `_applyHashSlide` → `goTo` → `_navigate` already tolerates a map
     * that has not reported loaded, and the map re-syncs when it does.
     */
    _initHash(): void;
    _onLoaded(): void;
}

export declare interface StorymapData {
    uniqueid?: string;
    slides: StorymapSlide[];
    [key: string]: unknown;
}

export declare interface StorymapDataWrapper {
    storymap: StorymapData;
}

/**
 * The document {@link storymapToManifest} reads: the `{ "storymap": {...} }`
 * wrapper a `storymap.json` file is, with every member optional.
 *
 * The root is `Partial<StorymapData>` — every legacy key is optional and the
 * files in the wild carry more than the schema documents — or a plain record,
 * which is what a document read straight out of `JSON.parse` is. The wrapper
 * itself is open, because the legacy files also carry a root-level `font_css`
 * and the map configuration service prefers it over the key inside `storymap`.
 */
export declare interface StorymapDocument {
    storymap?: Partial<StorymapData> | Record<string, unknown>;
    [key: string]: unknown;
}

export declare interface StorymapError {
    path: string;
    message: string;
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
export declare interface StorymapGeoreference {
    /** IIIF Image API service base (or a full-size image URL) to place */
    url: string;
    /** Image width in pixels (the resourceCoords space) */
    width: number;
    /** Image height in pixels */
    height: number;
    /** Georeference annotation body: the GCP FeatureCollection */
    body: StorymapGeoreferenceBody;
}

export declare interface StorymapGeoreferenceBody {
    type?: string;
    /** `polynomial` with `order: 1`, or absent; other values are skipped */
    transformation?: {
        type?: string;
        options?: {
            order?: number;
        };
    };
    features: StorymapGroundControlPoint[];
}

/** One ground control point: an image pixel paired with a WGS84 position */
export declare interface StorymapGroundControlPoint {
    type?: string;
    properties?: {
        resourceCoords?: [number, number];
    };
    geometry?: {
        type?: string;
        coordinates?: number[];
    };
}

/** A IIIF Presentation 3 language map; only the neutral `none` tag is written. */
export declare interface StorymapLanguageMap {
    none: string[];
}

declare type StoryMapListener = (e: unknown) => void;

export declare interface StorymapManifest {
    "@context": string[];
    id: string;
    type: "Manifest";
    label: StorymapLanguageMap;
    behavior: string[];
    metadata: {
        label: StorymapLanguageMap;
        value: StorymapLanguageMap;
    }[];
    items: StorymapManifestCanvas[];
    structures?: StorymapManifestRange[];
    navPlace?: StorymapManifestFeatureCollection;
    service?: StorymapManifestService[];
    requiredStatement?: StorymapManifestStatement;
}

/** A painting annotation: the slide's own media, painted onto its canvas. */
export declare interface StorymapManifestAnnotation {
    id: string;
    type: "Annotation";
    motivation: string;
    /** The media caption, as the annotation's own `label` (§2.7). */
    label?: StorymapLanguageMap;
    /** The media credit (§2.7). P3 allows a single object, not an array. */
    requiredStatement?: StorymapManifestStatement;
    /** The media alt text (§2.7). */
    accessibilitySummary?: StorymapLanguageMap;
    body: StorymapManifestContentResource;
    target: string | StorymapManifestSpecificResource;
}

/** A canvas `background`: a painting annotation of the slide's backdrop (§2.6). */
export declare interface StorymapManifestBackground {
    id: string;
    type: "Annotation";
    motivation: "painting";
    body: StorymapManifestContentResource | StorymapManifestContentResource[];
    target: string;
}

export declare interface StorymapManifestCanvas {
    id: string;
    type: "Canvas";
    width: number;
    height: number;
    /** The slide's date, which P3 constrains to a plain string (§2.5). */
    navDate?: string;
    background?: StorymapManifestBackground;
    thumbnail?: StorymapManifestContentResource[];
    items: {
        id: string;
        type: "AnnotationPage";
        items: (StorymapManifestAnnotation | StorymapManifestGeoreferencing)[];
    }[];
    label?: StorymapLanguageMap;
    summary?: StorymapLanguageMap;
    /** An overview slide, which the map's `overview` type carries (§2.4). */
    "storymap:type"?: string;
    "storymap:mediaSrcset"?: unknown;
    "storymap:mediaSizes"?: unknown;
    navPlace?: StorymapManifestFeatureCollection;
}

/**
 * A content resource: a painting body, a thumbnail or a background.
 *
 * One permissive interface rather than a discriminated union, because the
 * emitter only writes these: the shapes it produces are the classified media
 * body, a IIIF `Image`, a `TextualBody` and a `Color`, and they are
 * distinguished by `type` for the reader, not for us.
 */
export declare interface StorymapManifestContentResource {
    id?: string;
    type: string;
    format?: string;
    width?: number;
    height?: number;
    value?: string;
    service?: StorymapManifestImageService[];
}

/** A navPlace FeatureCollection: a point for a location, a Polygon for a bbox. */
export declare interface StorymapManifestFeatureCollection {
    id: string;
    type: "FeatureCollection";
    features: {
        id: string;
        type: "Feature";
        geometry: {
            type: string;
            coordinates: number[] | number[][] | number[][][];
        };
        /** Marker presentation, described by navplace-properties.json (§3.3). */
        properties: Record<string, unknown>;
    }[];
}

/** A Georeference Extension annotation for a placed raster (§2.10). */
export declare interface StorymapManifestGeoreferencing {
    id: string;
    type: "Annotation";
    motivation: "georeferencing";
    target: {
        id: string;
        type: "Image";
        width: number;
        height: number;
        service: StorymapManifestImageService[];
    };
    requiredStatement?: StorymapManifestStatement;
    body: StorymapGeoreferenceBody;
}

/** A IIIF Image API service reference. */
export declare interface StorymapManifestImageService {
    id: string;
    type: string;
    profile: string;
}

/** One P3 `Range` over the canvases of a `slide.group` (§3.5). */
export declare interface StorymapManifestRange {
    id: string;
    type: "Range";
    label: StorymapLanguageMap;
    items: string[];
}

/**
 * The map configuration service entry, keyed by the `storymap:` terms.
 *
 * Open by necessity: the official validator's Manifest schema is
 * `additionalProperties: false`, which is exactly why the map configuration
 * travels on a service of its own rather than on the Manifest (§3.1).
 */
export declare interface StorymapManifestService {
    id: string;
    type: "Service";
    profile: string;
    [term: string]: unknown;
}

/** A painting annotation whose target is a region of a larger image (§2.8). */
export declare interface StorymapManifestSpecificResource {
    type: "SpecificResource";
    source: string;
    selector: {
        type: "ImageApiSelector";
        value: string;
    };
}

/** A `{label, value}` pair — the P3 shape for a caption, credit or rights line. */
export declare interface StorymapManifestStatement {
    label: StorymapLanguageMap;
    value: StorymapLanguageMap;
}

/** OpenLayers passthrough options (see StorymapOptions.map_options) */
export declare interface StorymapMapOptions {
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
    iiif: {
        url: string;
        attribution: string;
    };
    tilejson?: StorymapTilejson;
    /**
     * The `seeAlso` targets a IIIF manifest points at, recorded but not
     * fetched — see `loadSeeAlso()` (§5.2 of docs/plans/iiif-interop.md).
     */
    see_also?: {
        id: string;
        type: string;
    }[];
    map_height: number;
    storyslider_height: number;
    slide_padding_lr: number;
    slide_default_fade: string;
    menubar_default_y: number;
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
export declare interface StorymapOverlayLayer {
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
 * One slide of a storymap.
 *
 * The nullable members (`| null`) are not decoration: the storymap JSON uses
 * `null` to mean "explicitly absent" and the viewer seeds its own defaults
 * with `null` before the data is merged in, so a plain `?` would not type.
 */
export declare interface StorymapSlide {
    type?: string;
    date?: string | Record<string, unknown> | null;
    group?: string;
    /**
     * The language tag this slide's text was read in (§3.4 of
     * docs/plans/iiif-interop.md). A IIIF manifest states its text as a
     * language map; the reader picks the viewer's configured language and
     * reports which one it used, so a host can offer a language switch.
     * Absent for language-neutral (`none`) text, and for a single-language
     * storymap.
     */
    language?: string;
    location?: StorymapSlideLocation | null;
    media?: StorymapSlideMedia | null;
    marker?: StorymapSlideMarker | null;
    narration?: StorymapSlideNarration | null;
    text?: StorymapSlideText | null;
    background?: StorymapSlideBackground | string | null;
    uniqueid?: string | null;
    [key: string]: unknown;
}

export declare interface StorymapSlideBackground {
    url?: string | null;
    color?: string | null;
    opacity?: number;
}

export declare interface StorymapSlideLocation {
    lat?: number;
    lon?: number;
    zoom?: number;
    /**
     * Image region `[x, y, w, h]` in image pixels (IIIF xywh convention,
     * StrollView-style image stops): the view fits the region on
     * navigation; image maps (`map_type: "iiif"` + `map_as_image`) only.
     */
    region?: [number, number, number, number];
    line?: boolean;
    icon?: string;
    iconSize?: number[];
    image?: string;
    use_custom_marker?: boolean;
    [key: string]: unknown;
}

/**
 * Optional spoken narration for one slide, played through a dedicated audio
 * element rather than the slide's media frame — a tour stop usually has a
 * picture and a recording, not one media item. Storymap JSON only: the
 * closest manifest spelling is a `Sound` body, which currently lands in
 * `media.url` rather than here.
 */
/**
 * Per-slide marker presentation, consolidated. `location.*` keeps working as
 * the legacy spelling and `marker.*` wins when present — see
 * docs/plans/iiif-media-tours.md §2.
 *
 * In a IIIF manifest none of this is a `storymap:` term: it all arrives in the
 * `navPlace` Feature's `properties` bag (`icon`, `iconSize`, `image`, `name`,
 * `popup`, `audioBadge`), which is a GeoJSON foreign-member bag and so needs
 * no vocabulary registration.
 */
export declare interface StorymapSlideMarker {
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

export declare interface StorymapSlideMedia {
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
    [key: string]: unknown;
}

export declare interface StorymapSlideNarration {
    url: string;
    [key: string]: unknown;
}

export declare interface StorymapSlideText {
    headline?: string;
    text?: string;
    text_align?: string;
}

/**
 * TileJSON 2.1 tile source metadata, from a manifest's map configuration
 * service (§2.9 of docs/plans/iiif-interop.md).
 *
 * This is how a manifest states a tile source: `tiles` is the URL template and
 * the rest is the standard metadata around it, where a keyword basemap
 * (`osm`, `stadia`, `iiif`, …) has no such thing to say. `minzoom`,
 * `maxzoom`, `bounds` and `scheme` constrain the source; `center` and `zoom`
 * set the initial view.
 */
export declare interface StorymapTilejson {
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
 * Convert a legacy storymap document to a IIIF Presentation 3.0 manifest.
 *
 * The counterpart of `manifestToStorymapData()`: what that reads, this writes.
 * Nothing but the input is read, so the same document always produces the same
 * manifest — which is what makes regenerating `public/examples-iiif/` a no-op.
 *
 * @param name - The manifest's label, and the stem of its canonical id.
 * @param legacy - The `storymap.json` document (`{ "storymap": {...} }`).
 * @returns The manifest, ready to serialise.
 */
export declare function storymapToManifest(name: string, legacy: StorymapDocument): StorymapManifest;

declare class StorySlider extends StorySlider_base {
    constructor(...args: ConstructorParameters<typeof StorySliderBase>);
}

declare const StorySlider_base: {
    new (...args: any[]): {
        _vco_events?: Record<string, {
            action: unknown;
            context: unknown;
        }[]> | undefined;
        on(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        hasEventListeners(type: string): boolean;
        off(type: string, fn: unknown, context?: unknown): /*elided*/ any;
        fire(type: string, data?: unknown, target?: unknown): /*elided*/ any;
    };
} & typeof StorySliderBase;

declare class StorySliderBase {
    "_el": StorySliderElements;
    "_nav": {
        previous: SlideNav;
        next: SlideNav;
    };
    "slide_spacing": number;
    "_slides": Slide[];
    "_swipable": Swipable;
    "preloadTimer": ReturnType<typeof setTimeout> | undefined;
    "preloadIdleHandle": number | undefined;
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
    /**
     * Cancel the pending preload, whichever scheduling primitive queued it.
     *
     * The two handles are kept apart deliberately: they are both numbers, so
     * calling `clearTimeout` on an idle-callback handle "works" by accident
     * while actually leaking the callback, and the reverse leaves a live
     * timeout behind.
     */
    _cancelPreload(): void;
    /**
     * Release listeners, timers and running animations. Called by
     * `StoryMap.dispose()`; the slider must not be used afterwards.
     */
    dispose(): void;
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

/**
 * The slider's element cache. `live_region` only exists when the slide
 * announcements are enabled (the `a11y` option), so it starts out null.
 */
declare type StorySliderElements = {
    container: HTMLElement;
    /** Created in `_initLayout`; the slide background layer. */
    background: HTMLElement;
    slider_container_mask: HTMLElement;
    slider_container: HTMLElement;
    slider_item_container: HTMLElement;
    live_region: HTMLElement | null;
};

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
        }[]> | undefined;
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
    /**
     * Full teardown for `dispose()`: `disable()` only covers the listeners
     * `enable()` adds, but a gesture in flight also holds the `move`/`leave`
     * pair plus the momentum animation.
     */
    dispose(): void;
    stopMomentum(): void;
    updateConstraint(c: SwipableOptions["constraint"]): void;
    _onDragStart(e: LegacyEvent): void;
    _onDragEnd(e: LegacyEvent): void;
    _attachGestureListeners(): void;
    _detachGestureListeners(): void;
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
        }[]> | undefined;
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
 *
 * May return any `ol/layer/Layer` (used as-is — this is what lets a
 * third-party layer such as an Allmaps `WarpedMapLayer` render), a bare
 * `Source` (wrapped in a `TileLayer`), or `null`/`undefined` to fall
 * through to the default `map_type` handling.
 */
export declare type TileSourceFactory = (map_type: string, context: {
    options: StorymapOptions;
    createDefault: () => Tile;
}) => OlLayer | Tile | OlSource | null | undefined;

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

    /**
     * The library version, substituted from package.json by the Vite lib build
     * (see the `define` in vite.config.ts). Hard-coded here only so the
     * source type-checks; a dev-server run without the define falls back to
     * "unknown" at runtime via the typeof guard in StoryMap.
     */
    const __STORYMAP_VERSION__: string;
}
