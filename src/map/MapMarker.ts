import { classMixin, mergeData } from "../core/Util";
import Events from "../core/Events";
import Ease from "../animation/Ease";
import type { Evented } from "./types";
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
================================================= */

export default class MapMarker {
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
    declare "fire": Evented["fire"];
    declare "on": Evented["on"];

    //includes: [VCO.Events],

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
        this.timer = {} as ReturnType<typeof setTimeout>;

        // Data
        this.data = {};

        // Options
        this.options = {
            // animation
            duration: 1000,
            ease: Ease.easeInSpline,
            width: 600,
            height: 600,
            map_popup: false,
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
    show(): void {}

    hide(): void {}

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

    createPopup(d?: MapMarkerData, o?: StorymapOptions): void {
        this._createPopup(d, o);
    }

    active(a: boolean): void {
        this._active(a);
    }

    location(): LatLngLiteral {
        return this._location();
    }

    /*	Marker Specific
		Specific to Map API
	================================================== */
    _createMarker(d?: MapMarkerData, o?: StorymapOptions): void {}

    _addTo(m: unknown): void {}

    _removeFrom(m: unknown): void {}

    _createPopup(d?: MapMarkerData, o?: StorymapOptions): void {}

    _active(a: boolean): void {}

    _location(): LatLngLiteral {
        return { lat: 0, lng: 0 };
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

classMixin(MapMarker, Events);
export { MapMarker };
