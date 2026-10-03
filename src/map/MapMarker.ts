import { mergeData } from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import { easeInSpline } from "../animation/easings";
import type {
    AnimationHandle,
    IconSpec,
    LatLngLiteral,
    MapMarkerData,
    StorymapOptions,
} from "../types";
/*	MapMarker
	Creates a marker. Takes a data object and
	populates the marker with content.
================================================== */

/** A marker event payload: the marker by slide index. */
export interface MarkerEventPayload {
    marker_number: number;
}

export interface MapMarkerEvents {
    markerclick: MarkerEventPayload;
    popupopen: MarkerEventPayload;
    popupclose: MarkerEventPayload;
}

class MapMarkerBase {
    declare "_el": Record<string, HTMLElement>;
    declare "_marker": HTMLDivElement;
    declare "_icon": IconSpec | HTMLDivElement | false;
    declare "_custom_icon": IconSpec | false;
    declare "_custom_icon_url": string;
    declare "_custom_image_icon": string | false;
    declare "marker_number": number;
    declare "media_icon_class": string;
    declare "timer": ReturnType<typeof setTimeout> | null;
    declare "data": MapMarkerData;
    declare "options": StorymapOptions;
    declare "animator": AnimationHandle | null;
    declare "fire": EventedInstance<MapMarkerEvents>["fire"];

    /*	Constructor
	================================================== */
    constructor(data?: MapMarkerData, options?: Partial<StorymapOptions>) {
        // DOM Elements
        this._el = {
            container: {} as HTMLElement,
            content_container: {} as HTMLElement,
            content: {} as HTMLElement,
        };

        // Components
        this._marker = {} as HTMLDivElement;

        // Icon
        this._icon = {} as HTMLDivElement;
        this._custom_icon = false;
        this._custom_icon_url = "";
        this._custom_image_icon = false;

        // Marker Number
        this.marker_number = 0;

        // Media Icon
        this.media_icon_class = "";

        // Timer
        this.timer = null;

        // Data
        this.data = {};

        // Options
        this.options = {
            // animation
            duration: 1000,
            ease: easeInSpline,
            width: 600,
            height: 600,
        } as StorymapOptions;

        // Animation Object
        this.animator = null;

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        this._initLayout();
    }

    /*	Public
	================================================== */

    /**
     * @deprecated No-op since 0.9.x upstream (the original marker defined an
     * empty body too). Markers are never individually hidden; use CSS on
     * `.vco-mapmarker`, or `active(false)` to dim one.
     */
    show(): void {}

    /** @deprecated See {@link show} — no-op since 0.9.x upstream. */
    hide(): void {}

    /**
     * @deprecated Never implemented, in the original viewer either: the base
     * `MapMarker._createPopup` had an empty body and the Leaflet override's
     * body was commented out, so the `map_popup` option that called it never
     * had any effect. Kept as a no-op so pre-0.10 code that calls it keeps
     * working. Render the slide text yourself, or use CSS on
     * `.vco-mapmarker` to show a label.
     */
    createPopup(_d?: MapMarkerData, _o?: StorymapOptions): void {}

    addTo(m: unknown): void {
        this._addTo(m);
    }

    removeFrom(m: unknown): void {
        this._removeFrom(m);
    }

    updateDisplay(w: number, h: number, a?: boolean): void {
        this._updateDisplay(w, h, a);
    }

    createMarker(d?: MapMarkerData, o?: StorymapOptions): void {
        this._createMarker(d, o);
    }

    active(a: boolean): void {
        this._active(a);
    }

    location(): LatLngLiteral | null {
        return this._location();
    }

    /*	Marker Specific
		Specific to Map API
	================================================== */
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void {}

    _addTo(m: unknown): void {}

    _removeFrom(m: unknown): void {}

    _active(a: boolean): void {}

    /**
     * The marker's coordinate, or null when it has none (an overview slide, or
     * a slide carrying only an image region). Every caller treats null as
     * "nothing to focus", so this is the honest shape — the previous
     * `{ lat: 0, lng: 0 }` was a real point at Null Island, spelled with a
     * longitude key nothing in the map read.
     */
    _location(): LatLngLiteral | null {
        return null;
    }

    /*	Events
	================================================== */
    _onMarkerClick(e?: unknown): void {
        this.fire("markerclick", { marker_number: this.marker_number });
    }

    /*	Private Methods
	================================================== */
    _initLayout(): void {
        this._createMarker(this.data, this.options);
    }

    // Update Display
    _updateDisplay(width: number, height: number, animate?: boolean): void {}
}

export default class MapMarker extends Evented<MapMarkerEvents, typeof MapMarkerBase>(
    MapMarkerBase,
) {
    constructor(...args: ConstructorParameters<typeof MapMarkerBase>) {
        super(...args);
    }
}

export { MapMarker };
