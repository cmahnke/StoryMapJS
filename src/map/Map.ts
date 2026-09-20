import { mergeData } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { Browser } from "../core/Browser";
import type { Map as OlMap } from "ol";
import type { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import type OverviewMap from "ol/control/OverviewMap";
import type MapMarker from "./MapMarker";
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
    declare "zoom_min_max": { min: number | null; max: number | null };
    declare "_line": VectorLayer | null;
    declare "_line_active": VectorLayer | null;
    declare "current_marker": number;
    declare "bounds_array": number[][] | null;
    declare "_tile_layer": TileLayer | null;
    declare "_tile_layer_mini": TileLayer | null;
    declare "_image_layer": TileLayer | null;
    declare "data": StorymapData;
    declare "options": StorymapOptions;
    declare "animator": AnimationHandle | null;
    declare "_transition_duration": number;
    declare "timer": ReturnType<typeof setTimeout> | null;
    declare "touch_scale": number;
    declare "scroll": ScrollState;
    declare "fire": EventedInstance["fire"];
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
            this._el.container = Dom.get(elem);
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

        //Options
        this.options = {
            map_type: "osm:standard",
            map_as_image: false,
            map_mini: false,
            map_background_color: "#d9d9d9",
            map_subdomains: "",
            map_access_token: "",
            iiif: {
                url: "",
                attribution: "",
            },
            skinny_size: 650,
            less_bounce: true,
            path_gfx: "gfx",
            start_at_slide: 0,
            map_popup: false,
            zoom_distance: 100,
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
        } as StorymapOptions;

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
            const steps = Math.abs(n - previous_marker);
            this._transition_duration = Math.max(600, Math.min(1000 + steps * 120, 2000));

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
                if (!change) {
                    this._onMarkerChange();
                }
            } else {
                // Make marker active
                marker.active(true);

                if (change) {
                    // Set Map View
                    if (marker.data.location) {
                        this._viewTo(marker.data.location, {
                            duration: this._transition_duration,
                        });
                    } else {
                        // nothing to show
                    }
                } else {
                    if (marker.data.location && marker.data.location.lat) {
                        // Calculate Zoom
                        zoom = this._calculateZoomChange(
                            this._getMapCenter(true),
                            marker.location(),
                        );

                        // Set Map View
                        this._viewTo(marker.data.location, {
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
                                const lines_array = [];
                                let line_num = previous_marker,
                                    point;

                                if (line_num < this.current_marker) {
                                    while (line_num < this.current_marker) {
                                        if (
                                            this._markers[line_num].data.location &&
                                            this._markers[line_num].data.location.lat
                                        ) {
                                            point = {
                                                lat: this._markers[line_num].data.location.lat,
                                                lon: this._markers[line_num].data.location.lon,
                                            };
                                            lines_array.push(point);
                                        }

                                        line_num++;
                                    }
                                } else if (line_num > this.current_marker) {
                                    while (line_num > this.current_marker) {
                                        if (
                                            this._markers[line_num].data.location &&
                                            this._markers[line_num].data.location.lat
                                        ) {
                                            point = {
                                                lat: this._markers[line_num].data.location.lat,
                                                lon: this._markers[line_num].data.location.lon,
                                            };
                                            lines_array.push(point);
                                        }

                                        line_num--;
                                    }
                                }

                                lines_array.push({
                                    lat: marker.data.location.lat,
                                    lon: marker.data.location.lon,
                                });

                                this._replaceLines(this._line_active, lines_array, {
                                    duration: this._transition_duration,
                                });
                            }
                        } else {
                            // Show Line
                            if (
                                this.options.show_history_line &&
                                marker.data.real_marker &&
                                this._markers[previous_marker].data.real_marker
                            ) {
                                this._replaceLines(
                                    this._line_active,
                                    [
                                        {
                                            lat: marker.data.location.lat,
                                            lon: marker.data.location.lon,
                                        },
                                        {
                                            lat: this._markers[previous_marker].data.location.lat,
                                            lon: this._markers[previous_marker].data.location.lon,
                                        },
                                    ],
                                    { duration: this._transition_duration },
                                );
                            }
                        }
                    } else {
                        this._markerOverview();
                        if (!change) {
                            this._onMarkerChange();
                        }
                    }

                    // Fire Event
                    this._onMarkerChange();
                }
            }
        }
    }

    panTo(loc: LatLngLiteral, animate?: boolean): void {
        this._panTo(loc, animate);
    }

    zoomTo(z: number, animate?: boolean): void {
        this._zoomTo(z, animate);
    }

    viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void {
        this._viewTo(loc, opts);
    }

    getBoundsZoom(m1: LatLngLiteral, m2: LatLngLiteral, inside?: boolean, padding?: unknown): void {
        this._getBoundsZoom(m1, m2, inside, padding); // (LatLngBounds[, Boolean, Point]) -> Number
    }

    markerOverview(): void {
        this._markerOverview();
    }

    calculateMarkerZooms(): void {
        this._calculateMarkerZooms();
    }

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
            if (this._markers[i].data.location && this._markers[i].data.location.zoom) {
                this.updateMinMaxZoom(this._markers[i].data.location.zoom);
            }
        }
    }

    updateMinMaxZoom(zoom: number): void {
        if (!this.zoom_min_max.max) {
            this.zoom_min_max.max = zoom;
        }

        if (!this.zoom_min_max.min) {
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
            this._initialMapLocation();
        }
    }

    /*	Adding, Hiding, Showing etc
	================================================== */
    show(): void {}

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
        for (let i = 0; i < this._markers.length; i++) {
            if (this._markers[i] === marker) {
                this._markers.splice(i, 1);
            }
        }
        this.fire("markerRemoved", marker);
    }

    _createMarkers(array: StorymapSlide[]): void {
        for (let i = 0; i < array.length; i++) {
            this._createMarker(array[i]); // this must be called even for overview which has no marker or other logic must be fixed.
            if (array[i].location && array[i].location.lat && this.options.show_lines) {
                this._addToLine(this._line, array[i]);
            }
        }
    }

    _createLines(array: StorymapSlide[]): void {}

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

    _addToLine(line: VectorLayer | null, d: LinePoint): void {}

    _replaceLines(line: VectorLayer | null, d: LinePoint[], animate?: { duration: number }): void {}

    _addLineToMap(line: VectorLayer): void {}

    /*	Map Specific Methods
		================================================== */

    _panTo(loc: LatLngLiteral, animate?: boolean): void {}

    _zoomTo(z: number, animate?: boolean): void {}

    _viewTo(loc: StorymapSlideLocation, opts?: ViewToOptions): void {}

    _updateMapDisplay(animate?: boolean, d?: number): void {}

    _refreshMap(): void {}

    _getMapLocation(m: LatLngLiteral): unknown {
        return { x: 0, y: 0 };
    }

    _getMapZoom(): number {
        return 1;
    }

    _getMapCenter(correct_for_center?: boolean): LatLngLiteral {
        return { lat: 0, lng: 0 };
    }

    _getBoundsZoom(
        m1: LatLngLiteral,
        m2: LatLngLiteral,
        inside?: boolean,
        padding?: unknown,
    ): number {
        return undefined;
    }

    _markerOverview(duration?: number): void {}

    _initialMapLocation(): void {}

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
            //e.preventDefault();
            //e.stopPropagation(e);
        }, time_left);
    }

    _scollZoom(e?: unknown): void {
        const current_zoom = this._getMapZoom();

        this.scroll.start_time = null;
        //VCO.DomUtil.addClass(this._el.container, 'vco-map-touch-zoom');
        clearTimeout(this.scroll.timer);
        clearTimeout(this.scroll.timer_done);

        this.scroll.timer_done = setTimeout(() => {
            this._scollZoomDone();
        }, 1000);

        this.zoomTo(Math.round(current_zoom * this.touch_scale));
    }

    _scollZoomDone(e?: unknown): void {
        //VCO.DomUtil.removeClass(this._el.container, 'vco-map-touch-zoom');
        this.touch_scale = 1;
    }

    /*	Private Methods
	================================================== */

    _calculateZoomChange(
        origin: LatLngLiteral,
        destination: LatLngLiteral,
        correct_for_center?: boolean,
    ): number {
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
            this._initialMapLocation();
        }
    }

    /** Hook after marker creation (overridden per engine as needed) */
    _afterCreateMarkers(): void {}

    _initEvents(): void {
        this._el.map.addEventListener("wheel", (e) => {
            this._onWheel(e);
        });

        //this.on("wheel", this._onWheel, this);
    }
}

export default class Map extends DomMixed(Evented(MapBase)) {
    constructor(...args: ConstructorParameters<typeof MapBase>) {
        super(...args);
    }
}

export { Map };
