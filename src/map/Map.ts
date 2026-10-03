import { mergeData, slideTransitionDuration } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { Browser } from "../core/Browser";
import type { Map as OlMap } from "ol";
import type { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import type Layer from "ol/layer/Layer";
import type OverviewMap from "ol/control/OverviewMap";
import type MapMarker from "./MapMarker";
import type { MarkerEventPayload } from "./MapMarker";
import type { ImagereadyPayload } from "./openlayers/Map.OpenLayers";
import type { LinePoint, ViewToOptions } from "./types";
import type {
    AnimationHandle,
    LatLngLiteral,
    StorymapData,
    StorymapOptions,
    StorymapSlide,
    StorymapSlideLocation,
} from "../types";
/*	Map
	Makes a Map

	Events:
	markerAdded
	markerRemoved


================================================ */

export interface MapEvents {
    change: { current_marker: number };
    loaded: StorymapData;
    added: StorymapData;
    removed: StorymapData;
    markerAdded: MapMarker;
    markerRemoved: MapMarker;
    markerclick: MarkerEventPayload;
    popupopen: MarkerEventPayload;
    popupclose: MarkerEventPayload;
    imageready: ImagereadyPayload;
    /** Deferred tile layers attached after a tile consent grant. */
    tilesallowed: undefined;
}

/** Wheel/scroll zoom bookkeeping (handles cleared via clearTimeout). */
interface ScrollState {
    start_time: number | null;
    timer?: ReturnType<typeof setTimeout>;
    timer_done?: ReturnType<typeof setTimeout>;
}

class MapBase {
    declare "_el": { container: HTMLElement; map: HTMLElement; map_mask: HTMLElement };
    declare "_loaded": { data: boolean; map: boolean };
    declare "_map": OlMap | null;
    declare "_mini_map": OverviewMap | null;
    declare "_markers": MapMarker[];
    /**
     * Zooms computed by the engine's `_calculateMarkerZooms`, keyed by
     * marker index. Kept off `marker.data` so navigating never mutates the
     * author's storymap document (`StoryMap.data` is that same object graph).
     */
    declare "_marker_zooms": (number | undefined)[];
    declare "zoom_min_max": { min: number | null; max: number | null };
    declare "_line": VectorLayer | null;
    declare "_line_active": VectorLayer | null;
    declare "current_marker": number;
    /** The wheel handler on the map element, stored for dispose(). */
    declare "_onWheelBound": ((e: WheelEvent) => void) | null;
    declare "bounds_array": number[][] | null;
    declare "_tile_layer": Layer | null;
    declare "_tile_layer_mini": Layer | null;
    declare "_image_layer": TileLayer | null;
    declare "data": StorymapData;
    declare "options": StorymapOptions;
    declare "animator": AnimationHandle | null;
    declare "_transition_duration": number;
    declare "timer": ReturnType<typeof setTimeout> | null;
    declare "touch_scale": number;
    declare "scroll": ScrollState;
    declare "fire": EventedInstance<MapEvents>["fire"];
    constructor(
        elem: string | HTMLElement,
        data?: Partial<StorymapData>,
        options?: Partial<StorymapOptions>,
    ) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            map: {} as HTMLElement,
            map_mask: {} as HTMLElement,
        };

        if (typeof elem === "object") {
            this._el.container = elem;
        } else {
            const found = Dom.get(elem);
            if (!found) {
                throw new Error("StoryMapJS: no element with id " + elem);
            }
            this._el.container = found;
        }

        // LOADED
        this._loaded = {
            data: false,
            map: false,
        };

        // MAP
        this._map = null;

        // MINI MAP
        this._mini_map = null;

        // Markers
        this._markers = [];
        this._marker_zooms = [];

        // Marker Zoom Miniumum and Maximum
        this.zoom_min_max = {
            min: null,
            max: null,
        };

        // Line
        this._line = null;
        this._line_active = null;

        // Current Marker
        this.current_marker = 0;

        // Markers Bounds Array
        this.bounds_array = null;

        // Map Tiles Layer
        this._tile_layer = null;

        // Map Tiles Layer for Mini Map
        this._tile_layer_mini = null;

        // Image Layer (for iiif)
        this._image_layer = null;

        // Data
        this.data = {
            uniqueid: "",
            slides: [{ test: "yes" }, { test: "yes" }, { test: "yes" }],
        };

        // Options — the map-owned subset only. StoryMap passes its own full
        // options object in (see the constructor), so `this.options` is a
        // complete StorymapOptions by the time anything reads it; these are
        // just the fallbacks for a standalone Map.
        this.options = {
            map_type: "osm:standard",
            map_as_image: false,
            map_mini: false,
            map_background_color: "#d9d9d9",
            map_access_token: "",
            overlays: [],
            overview_extent: null,
            iiif: {
                url: "",
                attribution: "",
            },
            skinny_size: 650,
            start_at_slide: 0,
            calculate_zoom: true, // Allow map to determine best zoom level between markers (recommended)
            line_follows_path: true, // Map history path follows default line, if false it will connect previous and current only
            line_color: "#333",
            line_color_inactive: "#000",
            line_weight: 5,
            line_opacity: 0.2,
            line_dash: "5,5",
            line_join: "miter",
            show_lines: true,
            show_history_line: true,
            map_center_offset: null, // takes object {top:0,left:0}
        } as unknown as StorymapOptions;

        // Animation
        this.animator = null;
        this._transition_duration = this.options.duration;

        // Timer
        this.timer = null;

        // Touchpad Events
        this.touch_scale = 1;
        this.scroll = {
            start_time: null,
        };

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        this._initLayout();
        this._initEvents();
        this._createMap();
        this._initData();
    }

    /*	Public
	================================================== */
    updateDisplay(w: number, h: number, animate?: boolean, d?: number, offset?: unknown): void {
        this._updateDisplay(w, h, animate, d, offset);
    }

    goTo(n: number, change?: boolean): void {
        if (n < this._markers.length && n >= 0) {
            let zoom;
            const previous_marker = this.current_marker;

            this.current_marker = n;

            // Scale the transition duration with the jump distance so that
            // out-of-order navigation glides instead of flicking
            this._transition_duration = slideTransitionDuration(previous_marker, n);

            const marker = this._markers[this.current_marker];

            // Stop animation
            if (this.animator) {
                this.animator.stop();
            }

            // Reset Active Markers
            this._resetMarkersActive();

            // Check to see if it's an overview
            if (marker.data.type && marker.data.type === "overview") {
                this._markerOverview();
            } else {
                // Make marker active
                marker.active(true);

                const target_location = marker.data.location ?? undefined;
                if (change) {
                    // Set Map View
                    if (target_location) {
                        this._viewTo(target_location, {
                            duration: this._transition_duration,
                        });
                    } else {
                        // nothing to show
                    }
                } else if (target_location) {
                    if (this._hasLocation(marker.data) || this._hasRegion(marker.data)) {
                        // Calculate Zoom
                        const here = marker.location();
                        zoom = here
                            ? this._calculateZoomChange(this._getMapCenter(true), here)
                            : undefined;

                        // Set Map View
                        this._viewTo(target_location, {
                            calculate_zoom: this.options.calculate_zoom,
                            zoom: zoom,
                            duration: this._transition_duration,
                        });

                        // Show Line
                        if (this.options.line_follows_path) {
                            if (
                                this.options.show_history_line &&
                                marker.data.real_marker &&
                                this._markers[previous_marker].data.real_marker
                            ) {
                                let lines_array: LinePoint[] = [];
                                // Accumulate from the first marker so the
                                // connections between previous slides stay
                                // marked (mirrors the backward branch, which
                                // settles at the traveled path 0..current).
                                // The end state is the full traveled path, but
                                // only the latest hop animates: grow_from is
                                // the already-traveled prefix 0..previous,
                                // which stays drawn while [prev..current]
                                // traces progressively (see _replaceLines).
                                let line_num = 0;
                                let retract_path_source: LinePoint[] | null = null;
                                let grow_path_source: LinePoint[] | null = null;
                                if (previous_marker < this.current_marker) {
                                    while (line_num < this.current_marker) {
                                        const loc = this._locationOf(this._markers[line_num].data);
                                        if (loc) {
                                            lines_array.push(loc);
                                        }

                                        line_num++;
                                    }
                                    grow_path_source = this._locationsUpTo(previous_marker);
                                } else if (previous_marker > this.current_marker) {
                                    // Backward navigation: the line retracts —
                                    // the end state is the traveled path from
                                    // the first marker to the current one, and
                                    // the far end pulls back from the old
                                    // marker to the new one (handled by the
                                    // map's retract animation).
                                    lines_array = this._locationsUpTo(this.current_marker);
                                    retract_path_source = this._locationsUpTo(previous_marker);
                                }

                                const marker_loc = this._locationOf(marker.data);
                                if (!retract_path_source && marker_loc) {
                                    lines_array.push(marker_loc);
                                }

                                this._replaceLines(this._line_active, lines_array, {
                                    duration: this._transition_duration,
                                    retractFrom: retract_path_source,
                                    growFrom: grow_path_source,
                                });
                            }
                        } else {
                            // Show Line — both endpoints need a real location.
                            // The path branch above guards every access with
                            // _hasLocation(); `real_marker` alone is not enough
                            // because a slide can carry a region only.
                            const from = this._locationOf(marker.data);
                            const to = this._locationOf(this._markers[previous_marker].data);
                            if (this.options.show_history_line && from && to) {
                                this._replaceLines(this._line_active, [from, to], {
                                    duration: this._transition_duration,
                                });
                            }
                        }
                    } else {
                        this._markerOverview();
                    }

                    // Fire Event — once per goTo(), for every branch above
                    this._onMarkerChange();
                }
            }
        }
    }

    /**
     * Alias over the OpenLayers view: `storymap.map.getView().animate({center})`
     * (remember `ol/proj` does not apply in image mode — see `isImageSpace()`).
     */
    panTo(loc: LatLngLiteral, animate?: boolean): void {
        this._panTo(loc, animate);
    }

    /** Alias over the OpenLayers view: `storymap.map.getView().animate({zoom})`. */
    zoomTo(z: number, animate?: boolean): void {
        this._zoomTo(z, animate);
    }

    /**
     * Alias over the OpenLayers view: `storymap.map.getView().animate(...)`,
     * or `.fit(extent, {size})` for a region stop (`location.region`).
     */
    viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void {
        this._viewTo(loc, opts);
    }

    /** Alias over the OpenLayers view: `view.getZoomForResolution(resolution)`. */
    getBoundsZoom(
        m1: LatLngLiteral,
        m2: LatLngLiteral,
        inside?: boolean,
        padding?: unknown,
    ): number | undefined {
        return this._getBoundsZoom(m1, m2, inside, padding);
    }

    /**
     * Alias over the OpenLayers view: `view.fit(extent, {size})` over all
     * marker positions. Also reachable from the menubar's overview button.
     */
    markerOverview(): void {
        this._markerOverview();
    }

    /**
     * The viewer's own marker zoom ladder — no OpenLayers equivalent (it also
     * writes the computed zoom onto the current markers).
     */
    calculateMarkerZooms(): void {
        this._calculateMarkerZooms();
    }

    /**
     * The minimap is built with the constructor; reach it with `getMinimap()`
     * (an OpenLayers `OverviewMap` control) rather than re-creating it.
     */
    createMiniMap(): void {
        this._createMiniMap();
    }

    setMapOffset(left: number, top: number): void {
        // Update Component Displays
        if (!this.options.map_center_offset) {
            this.options.map_center_offset = { left: left, top: top };
        } else {
            this.options.map_center_offset.left = left;
            this.options.map_center_offset.top = top;
        }
    }

    calculateMinMaxZoom(): void {
        for (let i = 0; i < this._markers.length; i++) {
            const zoom = this._markerZoom(i);
            if (typeof zoom === "number") {
                this.updateMinMaxZoom(zoom);
            }
        }
    }

    /**
     * The zoom to use for min/max bounds at marker `index`: the value
     * computed by the engine when there is one, else the zoom authored on
     * the slide. The engine overrides this to serve its computed-zoom store
     * so `StoryMap.data` is never written to.
     */
    _markerZoom(index: number): number | undefined {
        return this._markers[index]?.data.location?.zoom;
    }

    updateMinMaxZoom(zoom: number): void {
        // `!x` treated a legitimate zoom level of 0 as "not measured yet" and
        // then re-ran the min/max comparison against null, which coerces to 0.
        // Test for null explicitly so zoom 0 is a real bound.
        if (this.zoom_min_max.max === null) {
            this.zoom_min_max.max = zoom;
        }

        if (this.zoom_min_max.min === null) {
            this.zoom_min_max.min = zoom;
        }

        if (this.zoom_min_max.max < zoom) {
            this.zoom_min_max.max = zoom;
        }
        if (this.zoom_min_max.min > zoom) {
            this.zoom_min_max.min = zoom;
        }
    }

    initialMapLocation(): void {
        if (this._loaded.data && this._loaded.map) {
            // don't clobber navigation that already happened while the map was
            // still loading (the first loadend can arrive late)
            if (this.current_marker === 0) {
                this.goTo(this.options.start_at_slide, true);
            }
        }
    }

    /*	Adding, Hiding, Showing etc
	================================================== */

    /**
     * @deprecated No-op since 0.9.x upstream (the original Leaflet engine
     * defined an empty body too) and shadowed by the `DomMixed` mixin. To
     * hide the map, toggle the OpenLayers target:
     * `storymap.map.getTargetElement().style.display = "none"`.
     */
    show(): void {}

    /**
     * @deprecated See {@link show} — no-op since 0.9.x upstream. Use
     * `storymap.map.getTargetElement().style.display = "none"`.
     */
    hide(): void {}

    /*	Adding and Removing Markers
	================================================== */
    createMarkers(array: StorymapSlide[]): void {
        this._createMarkers(array);
    }

    createMarker(d: StorymapSlide): void {
        this._createMarker(d);
    }

    _destroyMarker(marker: MapMarker): void {
        this._removeMarker(marker);
        const index = this._markers.indexOf(marker);
        if (index === -1) {
            return;
        }
        this._markers.splice(index, 1);
        // `marker_number` is the marker's index into this array and is what
        // _onMarkerClick hands to goTo(), so every marker after the removed
        // one has to shift down or clicks navigate to the wrong slide
        for (let i = index; i < this._markers.length; i++) {
            this._markers[i].marker_number = i;
        }
        this.fire("markerRemoved", marker);
    }

    _createMarkers(array: StorymapSlide[]): void {
        for (let i = 0; i < array.length; i++) {
            this._createMarker(array[i]); // this must be called even for overview which has no marker or other logic must be fixed.
            if (this._hasLocation(array[i]) && this.options.show_lines) {
                this._addToLine(this._line, array[i]);
            }
        }
    }

    /**
     * A slide has a real location: lat and lon are both numbers — lat 0 and
     * lon 0 are valid coordinates and must not be treated as missing.
     */
    _hasLocation(d: StorymapSlide): boolean {
        return this._locationOf(d) !== null;
    }

    /**
     * The {lat, lon} points of every marker from the first up to and
     * including `n`, skipping the ones without a real location. This was four
     * near-identical loops building the same thing.
     */
    private _locationsUpTo(n: number): LinePoint[] {
        const points: LinePoint[] = [];
        for (let idx = 0; idx <= n && idx < this._markers.length; idx++) {
            const loc = this._locationOf(this._markers[idx].data);
            if (loc) {
                points.push(loc);
            }
        }
        return points;
    }

    /**
     * The slide's {lat, lon} point, or null when it has no real location.
     *
     * Preferred over testing `_hasLocation()` and then reading
     * `data.location.lat`: a boolean guard does not narrow the property for
     * the type checker, so the old form had to be trusted and re-checked by
     * hand at every one of its dozen call sites.
     */
    _locationOf(d: StorymapSlide): LatLngLiteral | null {
        const loc = d.location;
        if (!loc || typeof loc.lat !== "number" || typeof loc.lon !== "number") {
            return null;
        }
        return { lat: loc.lat, lon: loc.lon };
    }

    /**
     * Image region stop: the slide carries an xywh region ([x, y, w, h]
     * image pixels). Only the OpenLayers engine applies it (image mode);
     * the region never contributes to route lines.
     */
    _hasRegion(d: StorymapSlide): boolean {
        return !!d.location && Array.isArray(d.location.region) && d.location.region.length === 4;
    }

    /*	Map Specific
	================================================== */

    /*	Map Specific Create
		================================================== */
    // Extend this map class and use this to create the map using preferred API
    _createMap(): void {}

    /*	Mini Map Specific Create
		================================================== */
    // Extend this map class and use this to create the map using preferred API
    _createMiniMap(): void {}

    /*	Map Specific Marker
		================================================== */

    // Specific Marker Methods based on preferred Map API
    _createMarker(d?: StorymapSlide): void {
        const marker = {} as MapMarker;
        marker.on("markerclick", this._onMarkerClick);
        this._addMarker(marker);
        this._markers.push(marker);
        marker.marker_number = this._markers.length - 1;
        this.fire("markerAdded", marker);
    }

    _addMarker(marker: MapMarker): void {}

    _removeMarker(marker: MapMarker): void {}

    _resetMarkersActive(): void {
        for (let i = 0; i < this._markers.length; i++) {
            this._markers[i].active(false);
        }
    }

    _calculateMarkerZooms(): void {}

    /*	Map Specific Line
		================================================== */

    _createLine(d?: StorymapSlide): unknown {
        return { data: d };
    }

    /** Append a slide's location to a route line. Takes the *slide*, not a
     *  point — the engine reads `d.location`. */
    _addToLine(line: VectorLayer | null, d: StorymapSlide): void {}

    _replaceLines(
        line: VectorLayer | null,
        d: LinePoint[],
        animate?: {
            duration: number;
            retractFrom?: LinePoint[] | null;
            growFrom?: LinePoint[] | null;
        },
    ): void {}

    _addLineToMap(line: VectorLayer): void {}

    /*	Map Specific Methods
		================================================== */

    _panTo(loc: LatLngLiteral, animate?: boolean): void {}

    _zoomTo(z: number, animate?: boolean): void {}

    _viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void {}

    _updateMapDisplay(animate?: boolean, d?: number): void {}

    _refreshMap(): void {}

    _getMapZoom(): number {
        return 1;
    }

    _getMapCenter(correct_for_center?: boolean): LatLngLiteral {
        return { lat: 0, lon: 0 };
    }

    /**
     * The `ease` option as an OpenLayers easing function.
     *
     * `ease` is documented as either a function or a name, so the cast to
     * OpenLayers' expected shape was repeated at all ten `view.animate()` call
     * sites.
     */
    protected get _easing(): ((t: number) => number) | undefined {
        return this.options.ease as ((t: number) => number) | undefined;
    }

    /**
     * Zoom that fits the two given points, or `undefined` when the engine
     * cannot compute one. Mirrors `getRouteDistance`: the base class is the
     * no-op template, the OpenLayers subclass returns a real value.
     */
    _getBoundsZoom(
        m1: LatLngLiteral,
        m2: LatLngLiteral,
        inside?: boolean,
        padding?: unknown,
    ): number | undefined {
        return undefined;
    }

    _markerOverview(duration?: number): void {}

    /**
     * Great-circle length of the route through all markers in kilometers;
     * `undefined` when the map cannot compute it or there are fewer than two
     * markers (issue #341).
     */
    getRouteDistance(): number | undefined {
        return undefined;
    }

    /*	Events
	================================================== */
    _onMarkerChange(e?: unknown): void {
        this.fire("change", { current_marker: this.current_marker });
    }

    _onMarkerClick(e: { marker_number: number }): void {
        if (this.current_marker !== e.marker_number) {
            this.goTo(e.marker_number, false);
        }
        // Re-fired (after navigation) so hosts can tell a marker click
        // apart from programmatic navigation: `change` alone does not say
        // *how* the story moved.
        this.fire("markerclick", { marker_number: e.marker_number });
    }

    _onMarkerPopupOpen(e: { marker_number: number }): void {
        this.fire("popupopen", { marker_number: e.marker_number });
    }

    _onMarkerPopupClose(e: { marker_number: number }): void {
        this.fire("popupclose", { marker_number: e.marker_number });
    }

    _onMapLoaded(e?: unknown): void {
        // OpenLayers fires `loadend` after every finished tile-load cycle, not
        // just the first render — without this guard every navigation would
        // snap the map back to the start slide once its tiles arrive
        if (this._loaded.map) {
            return;
        }
        this._loaded.map = true;

        if (this.options.calculate_zoom) {
            this.calculateMarkerZooms();
        }

        this.calculateMinMaxZoom();

        if (this.options.map_mini && !Browser.touch) {
            this.createMiniMap();
        }

        this.initialMapLocation();
        this.fire("loaded", this.data);
    }

    _onWheel(e: WheelEvent): void {
        // borrowed from http://jsbin.com/qiyaseza/5/edit
        if (e.ctrlKey) {
            const s = Math.exp(-e.deltaY / 100);
            this.touch_scale *= s;
            e.preventDefault();
            e.stopPropagation();
        }

        if (!this.scroll.start_time) {
            this.scroll.start_time = +new Date();
        }

        const time_left = Math.max(40 - (+new Date() - this.scroll.start_time), 0);

        clearTimeout(this.scroll.timer);

        this.scroll.timer = setTimeout(() => {
            this._scollZoom();
        }, time_left);
    }

    _scollZoom(e?: unknown): void {
        const current_zoom = this._getMapZoom();

        this.scroll.start_time = null;
        clearTimeout(this.scroll.timer);
        clearTimeout(this.scroll.timer_done);

        this.scroll.timer_done = setTimeout(() => {
            this._scollZoomDone();
        }, 1000);

        this.zoomTo(Math.round(current_zoom * this.touch_scale));
    }

    _scollZoomDone(e?: unknown): void {
        this.touch_scale = 1;
    }

    /*	Private Methods
	================================================== */

    _calculateZoomChange(
        origin: LatLngLiteral,
        destination: LatLngLiteral,
        correct_for_center?: boolean,
    ): number | undefined {
        return this._getBoundsZoom(origin, destination, correct_for_center);
    }

    _updateDisplay(w?: number, h?: number, animate?: boolean, d?: number, offset?: unknown): void {
        // Update Map Display
        this._updateMapDisplay(animate, d);
    }

    /** Re-apply runtime-changed options (no-op in the base class) */
    applyOptions(_keys: string[]): void {}

    _initLayout(): void {
        // Create Layout
        this._el.map_mask = Dom.create("div", "vco-map-mask", this._el.container);

        if (this.options.map_as_image) {
            this._el.map = Dom.create(
                "div",
                "vco-map-display vco-mapimage-display",
                this._el.map_mask,
            );
        } else {
            this._el.map = Dom.create("div", "vco-map-display", this._el.map_mask);
        }
    }

    _initData(): void {
        if (this.data.slides) {
            this._createMarkers(this.data.slides);
            this._afterCreateMarkers();
            this._resetMarkersActive();
            if (this._markers.length > 0) {
                this._markers[this.current_marker].active(true);
            }
            this._loaded.data = true;
        }
    }

    /** Hook after marker creation (overridden per engine as needed) */
    _afterCreateMarkers(): void {}

    _initEvents(): void {
        // stored so the engine's dispose() can detach it (an inline arrow
        // would have no other handle)
        this._onWheelBound = (e: WheelEvent) => {
            this._onWheel(e);
        };
        this._el.map.addEventListener("wheel", this._onWheelBound);
    }
}

const EventedMapBase = Evented<MapEvents, typeof MapBase>(MapBase);

export default class Map extends DomMixed<MapEvents, typeof EventedMapBase>(EventedMapBase) {
    constructor(...args: ConstructorParameters<typeof MapBase>) {
        super(...args);
    }
}

export { Map };
