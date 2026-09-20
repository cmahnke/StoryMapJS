import { mergeData, updateData, urljoin } from "../core/Util";
import { loadCSS } from "../core/Load";
import { validateStorymapAndReport } from "./validate";
import { isPresentation3Manifest, manifestToStorymapData } from "./iiif";
import Dom from "../dom/Dom";
import Ease from "../animation/Ease";
import { setLanguage } from "../language/Language";
import { Evented, type EventedInstance } from "../core/mixins";
import OpenLayersMap from "../map/openlayers/Map.OpenLayers";
import MenuBar from "../ui/MenuBar";
import StorySlider from "../slider/StorySlider";
import { Browser } from "../core/Browser";
import Animate from "morpheus";
import { DomEvent } from "../dom/DomEvent";
import type { Map as OlMap } from "ol";
import type { AnimationHandle, StorymapData, StorymapDataWrapper, StorymapOptions } from "../types";

type StoryMapListener = (e: unknown) => void;

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
class StoryMapBase {
    declare "_loaded": { storyslider: boolean; map: boolean };
    declare mouseEventToLatLng: (e: unknown) => unknown;
    declare mouseEventToLayerPoint: (e: unknown) => unknown;
    declare "on": EventedInstance["on"];
    declare "version": string;
    declare "ready": boolean;
    declare "_el": {
        container: HTMLElement;
        menubar: HTMLElement;
        map: HTMLElement;
        storyslider: HTMLElement;
    };
    declare "_storyslider": StorySlider;
    declare "_map": OpenLayersMap;
    declare "map": OlMap;
    declare "_menubar": MenuBar;
    declare "data": StorymapData;
    declare "options": StorymapOptions;
    declare "current_slide": number;
    declare "animator_map": AnimationHandle | null;
    declare "animator_storyslider": AnimationHandle | null;
    declare "_resize_observer": ResizeObserver | null;
    declare "_resize_timer": ReturnType<typeof setTimeout> | null;
    declare "fire": EventedInstance["fire"];
    declare "hasEventListeners": EventedInstance["hasEventListeners"];

    // TODO: mixin
    // includes: VCO.Events,

    /*	Private Methods
	================================================== */
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
    constructor(
        elem: string | HTMLElement,
        data: string | StorymapDataWrapper | Record<string, unknown>,
        options?: Partial<StorymapOptions>,
        listeners?: Record<string, StoryMapListener | StoryMapListener[]>,
    ) {
        for (const key in listeners) {
            const callbacks = listeners[key];
            if (typeof callbacks == "function") {
                this.on(key, callbacks);
            } else {
                for (const idx in callbacks) {
                    if (typeof callbacks[idx] == "function") {
                        this.on(key, callbacks[idx]);
                    } else {
                        console.log(
                            "WARNING: Ignoring invalid callback '" +
                                callbacks[idx] +
                                "' defined for " +
                                "listener '" +
                                key +
                                "' in StoryMap constructor",
                        );
                    }
                }
            }
        }

        // Version
        this.version = "0.1.16";

        // Ready
        this.ready = false;

        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            storyslider: {} as HTMLElement,
            map: {} as HTMLElement,
            menubar: {} as HTMLElement,
        };

        // Determine Container Element
        if (typeof elem === "object") {
            this._el.container = elem;
        } else {
            this._el.container = Dom.get(elem);
        }

        // Slider
        this._storyslider = {} as StorySlider;

        // Map
        this._map = {} as OpenLayersMap;
        this.map = {} as OlMap; // For direct access to Leaflet Map

        // Menu Bar
        this._menubar = {} as MenuBar;

        // Loaded State
        this._loaded = { storyslider: false, map: false };

        // Data Object
        // Test Data compiled from http://www.pbs.org/marktwain/learnmore/chronology.html
        this.data = {} as StorymapData;

        this.options = {
            script_path: StoryMap.SCRIPT_PATH,
            height: this._el.container.offsetHeight,
            width: this._el.container.offsetWidth,
            layout: "landscape", // portrait or landscape
            base_class: "",
            default_bg_color: { r: 256, g: 256, b: 256 },
            map_size_sticky: 2.5, // Set as division 1/3 etc
            map_center_offset: null, // takes object {top:0,left:0}
            less_bounce: false, // Less map bounce when calculating zoom, false is good when there are clusters of tightly grouped markers
            start_at_slide: 0,
            call_to_action: false,
            call_to_action_text: "",
            menubar_height: 0,
            skinny_size: 650,
            // animation
            duration: 1000,
            ease: Ease.easeInOutQuint,
            // interaction
            dragging: true,
            trackResize: true,
            map_type: "", // "osm:standard",
            attribution: "",
            map_mini: true,
            map_subdomains: "",
            map_as_image: false,
            map_access_token:
                "pk.eyJ1IjoibnVrbmlnaHRsYWIiLCJhIjoiczFmd0hPZyJ9.Y_afrZdAjo3u8sz_r8m2Yw", // default
            map_background_color: "#d9d9d9",
            use_custom_markers: false,
            iiif: {
                url: "",
                attribution: "",
            },
            map_height: 300,
            storyslider_height: 600,
            slide_padding_lr: 45, // padding on slide of slide
            slide_default_fade: "0%", // landscape fade
            menubar_default_y: 0,
            path_gfx: "gfx",
            map_popup: false,
            zoom_distance: 100,
            calculate_zoom: true, // Allow map to determine best zoom level between markers (recommended)
            line_follows_path: true, // Map history path follows default line, if false it will connect previous and current only
            line_color: "#c34528", //"#DA0000",
            line_color_inactive: "#CCC",
            line_join: "miter",
            line_weight: 3,
            line_opacity: 0.8,
            line_dash: "5,5",
            show_lines: true,
            show_history_line: true,
            api_key_flickr: "8f2d5becf7b6ba46570741620054b507",
            font_css: "stock:default",
            language: "en",
        } as StorymapOptions;

        // Animation Objects
        this.animator_map = null;
        this.animator_storyslider = null;
        this._resize_observer = null;
        this._resize_timer = null;

        // Merge Options -- legacy, in case people still need to pass in
        mergeData(this.options, options);

        // Current Slide (after the options merge so start_at_slide applies)
        this.current_slide = this.options.start_at_slide;

        this._initData(data);

        return this;
    }

    /* Initialize the data
	================================================== */
    _initData(data: string | StorymapDataWrapper | Record<string, unknown>) {
        if (typeof data === "string") {
            fetch(data)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " " + response.statusText);
                    }
                    return response.json();
                })
                .then((result: unknown) => {
                    if (isPresentation3Manifest(result)) {
                        this.data = manifestToStorymapData(result);
                    } else {
                        validateStorymapAndReport(result, data);
                        this.data = (result as StorymapDataWrapper).storymap;
                    }
                    this._initOptions();
                })
                .catch((err: unknown) => {
                    console.error("StoryMapJS: could not load storymap data from " + data, err);
                    this.fire("error", { message: String(err), source: data });
                });
        } else if (typeof data === "object") {
            if (isPresentation3Manifest(data)) {
                this.data = manifestToStorymapData(data);
            } else {
                const wrapper = data as StorymapDataWrapper;
                validateStorymapAndReport(wrapper);
                if (wrapper.storymap) {
                    this.data = wrapper.storymap;
                } else {
                    console.error("StoryMapJS: data must have a storymap property");
                }
            }
            this._initOptions();
        } else {
            console.error("StoryMapJS: data has unknown type");
            this._initOptions();
        }
    }

    /* Initialize the options
	================================================== */
    _initOptions() {
        // Grab options from storymap data
        updateData(this.options, this.data);

        if (this.options.layout === "landscape") {
            this.options.map_center_offset = { left: -200, top: 0 };
        }
        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            this.options.map_size_sticky = 2;
        }
        if (this.options.map_as_image) {
            this.options.calculate_zoom = false;
        }

        // handle removed zoomify type
        if (this.options.map_type === "zoomify") {
            console.error(
                "StoryMapJS: map_type 'zoomify' has been removed; use map_type 'iiif' with options.iiif.url instead.",
            );
        }

        // handle Stamen change
        if (this.options.map_type.startsWith("stamen")) {
            const old_type = this.options.map_type;
            if (old_type === "stamen:watercolor") {
                this.options.map_type = "ch-watercolor";
            } else {
                this.options.map_type = "osm:standard";
            }
            console.log(`Deprecated map_type ${old_type}; using ${this.options.map_type}`);
        }

        this._loadLanguage();
    }

    /*	Load Language
	================================================== */

    _loadLanguage() {
        setLanguage(this.options.language);
        this._loadFontCss();
        this._onDataLoaded();
    }

    /*  Load the font theme stylesheet
    ================================================== */
    _loadFontCss() {
        let font = this.options.font_css || "stock:default";
        if (font.startsWith("stock:")) {
            const font_name = font.split(":")[1] || "default";
            // resolved against the library location: one directory up from
            // src/main.ts (dev) and js/storymap.js (build) in both cases
            font = new URL("../css/fonts/font." + font_name + ".css", import.meta.url).href;
        } else if (!/^(http|https|\/\/)/.test(font)) {
            font = urljoin(this.options.script_path, font);
        }
        if (font) {
            loadCSS(font, () => {
                this._onFontLoaded(font);
            });
        }
    }

    _onFontLoaded(font: string) {
        this.fire("fontLoaded", { font: font });
    }

    /*	Navigation
	================================================== */
    /**
     * Navigate to a slide by index.
     *
     * @param n - Zero-based slide index; the map animates to the slide's
     *   marker (or the overview when `n` is 0 for storymaps with one).
     */
    goTo(n: number) {
        if (n !== this.current_slide) {
            this.current_slide = n;
            this._storyslider.goTo(this.current_slide);
            this._map.goTo(this.current_slide);
        }
    }

    /**
     * Re-measure the container and re-layout the map, slider and menubar.
     * Called automatically on resize (see the `trackResize` option).
     */
    updateDisplay() {
        if (this.ready) {
            this._updateDisplay();
        }
    }

    /**
     * Change a single map option at runtime and apply its effect immediately.
     *
     * Runtime-changeable options: `map_type` (rebuilds the tile layer),
     * `show_lines`, `line_color`, `line_color_inactive`, `line_weight`,
     * `line_opacity`, `line_dash`, `line_join`, `line_follows_path`,
     * `show_history_line` (restyled instantly), `map_center_offset` (applied on
     * the next navigation), `duration`, `ease`, `calculate_zoom`,
     * `map_background_color`. All other options only take effect on the next
     * navigation or require re-creating the StoryMap.
     */
    setMapOption(name: string, value: unknown) {
        this.setMapOptions({ [name]: value } as Partial<StorymapOptions>);
    }

    /**
     * Change several map options at runtime (see setMapOption).
     */
    setMapOptions(options: Partial<StorymapOptions>) {
        mergeData(this.options, options);
        if (this._map && this._map.options) {
            mergeData(this._map.options, options);
            this._map.applyOptions(Object.keys(options));
        } else {
            for (const key of Object.keys(options)) {
                (this.options as Record<string, unknown>)[key] = (
                    options as Record<string, unknown>
                )[key];
            }
        }
        if (this.ready) {
            this.updateDisplay();
        }
    }

    /*	Private Methods
	================================================== */

    // Initialize the layout
    _initLayout() {
        this._el.container.className += " vco-storymap";
        this.options.base_class = this._el.container.className;

        // Create Layout
        this._el.menubar = Dom.create("div", "vco-menubar", this._el.container);
        this._el.map = this._resolveMapElement();
        if (!this._el.map) {
            this._el.map = Dom.create("div", "vco-map", this._el.container);
        }
        this._el.storyslider = Dom.create("div", "vco-storyslider", this._el.container);

        // Initial Default Layout
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;
        this._el.map.style.height = "1px";
        this._el.storyslider.style.top = "1px";

        // Create Map using preferred Map API
        this._map = new OpenLayersMap(this._el.map, this.data, this.options);
        this.map = this._map._map; // For access to the OpenLayers map.
        this._map.on("loaded", this._onMapLoaded, this);

        // Map Background Color
        this._el.map.style.backgroundColor = this.options.map_background_color;

        // Create Menu Bar
        this._menubar = new MenuBar(this._el.menubar, this._el.container, this.options);

        // Create StorySlider
        this._storyslider = new StorySlider(this._el.storyslider, this.data, this.options);
        this._storyslider.on("loaded", this._onStorySliderLoaded, this);
        this._storyslider.on("title", this._onTitle, this);
        this._storyslider.init();

        // LAYOUT
        if (this.options.layout === "portrait") {
            // Set Default Component Sizes
            this.options.map_height = this.options.height / this.options.map_size_sticky;
            this.options.storyslider_height =
                this.options.height - this._el.menubar.offsetHeight - this.options.map_height - 1;
            this._menubar.setSticky(0);
        } else {
            this.options.menubar_height = this._el.menubar.offsetHeight;
            // Set Default Component Sizes
            this.options.map_height = this.options.height;
            this.options.storyslider_height =
                this.options.height - this._el.menubar.offsetHeight - 1;
            this._menubar.setSticky(this.options.menubar_height);
        }

        // Update Display
        this._updateDisplay(this.options.map_height, true, 2000);

        // Animate Menu Bar to Default Location
        this._menubar.show(2000);
    }

    _initEvents() {
        // Sidebar Events
        this._menubar.on("collapse", this._onMenuBarCollapse, this);
        this._menubar.on("back_to_start", this._onBackToStart, this);
        this._menubar.on("overview", this._onOverview, this);

        // StorySlider Events
        this._storyslider.on("change", this._onSlideChange, this);
        this._storyslider.on("colorchange", this._onColorChange, this);

        // Map Events
        this._map.on("change", this._onMapChange, this);
    }

    // Update View
    _updateDisplay(map_height?: number, animate?: boolean, d?: number) {
        let duration = this.options.duration,
            display_class = this.options.base_class;

        if (d) {
            duration = d;
        }

        // Update width and height
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;

        // Check if skinny
        if (this.options.width <= this.options.skinny_size) {
            this.options.layout = "portrait";
            //display_class += " vco-skinny";
        } else {
            this.options.layout = "landscape";
        }

        // Map Height
        if (map_height) {
            this.options.map_height = map_height;
        }

        // Detect Mobile and Update Orientation on Touch devices
        if (Browser.touch) {
            this.options.layout = Browser.orientation();
            display_class += " vco-mobile";
        }

        // LAYOUT
        if (this.options.layout === "portrait") {
            display_class += " vco-skinny";
            // Map Offset
            this._map.setMapOffset(0, 0);

            this.options.map_height = this.options.height / this.options.map_size_sticky;
            this.options.storyslider_height = this.options.height - this.options.map_height - 1;
            this._menubar.setSticky(0);

            // Portrait
            display_class += " vco-layout-portrait";

            if (animate) {
                // Animate Map
                if (this.animator_map) {
                    this.animator_map.stop();
                }

                this.animator_map = Animate(this._el.map, {
                    height: this.options.map_height + "px",
                    duration: duration,
                    easing: Ease.easeOutStrong,
                    complete: () => {
                        this._map.updateDisplay(
                            this.options.width,
                            this.options.map_height,
                            animate,
                            d,
                            this.options.menubar_height,
                        );
                    },
                });

                // Animate StorySlider
                if (this.animator_storyslider) {
                    this.animator_storyslider.stop();
                }
                this.animator_storyslider = Animate(this._el.storyslider, {
                    height: this.options.storyslider_height + "px",
                    duration: duration,
                    easing: Ease.easeOutStrong,
                });
            } else {
                // Map
                this._el.map.style.height = Math.ceil(this.options.map_height) + "px";

                // StorySlider
                this._el.storyslider.style.height = this.options.storyslider_height + "px";
            }

            // Update Component Displays
            this._menubar.updateDisplay(this.options.width, this.options.height, animate);
            this._map.updateDisplay(this.options.width, this.options.height, false);
            this._storyslider.updateDisplay(
                this.options.width,
                this.options.storyslider_height,
                animate,
                this.options.layout,
            );
        } else {
            // Landscape
            display_class += " vco-layout-landscape";

            this.options.menubar_height = this._el.menubar.offsetHeight;

            // Set Default Component Sizes
            this.options.map_height = this.options.height;
            this.options.storyslider_height = this.options.height;
            this._menubar.setSticky(this.options.menubar_height);

            // Set Sticky state of MenuBar
            this._menubar.setSticky(this.options.menubar_height);

            this._el.map.style.height = this.options.height + "px";

            // Update Component Displays
            this._map.setMapOffset(-(this.options.width / 4), 0);

            // StorySlider
            this._el.storyslider.style.top = "0";
            this._el.storyslider.style.height = this.options.storyslider_height + "px";

            this._menubar.updateDisplay(this.options.width, this.options.height, animate);
            this._map.updateDisplay(this.options.width, this.options.height, animate, d);
            this._storyslider.updateDisplay(
                this.options.width / 2,
                this.options.storyslider_height,
                animate,
                this.options.layout,
            );
        }

        if ((this.options.language as unknown as { direction?: string }).direction === "rtl") {
            display_class += " vco-rtl";
        }

        // Apply class
        this._el.container.className = display_class;
    }

    /*	Events
	================================================== */

    _onDataLoaded(e?: unknown) {
        this.fire("dataloaded");
        this._initLayout();
        this._initEvents();
        this._initResizeHandling();
        this.ready = true;
    }

    /*  Resize handling
    ================================================== */
    _initResizeHandling() {
        if (!this.options.trackResize) {
            return;
        }
        // Debounce so that continuous resizes don't trigger a layout storm
        const onResize = () => {
            if (this._resize_timer) {
                clearTimeout(this._resize_timer);
            }
            this._resize_timer = setTimeout(() => {
                this.updateDisplay();
            }, 200);
        };
        if (typeof ResizeObserver !== "undefined") {
            // covers containers resized by their embedding layout
            this._resize_observer = new ResizeObserver(onResize);
            this._resize_observer.observe(this._el.container);
        }
        window.addEventListener("resize", onResize);
    }

    /**
     * Resolve a caller-supplied map element (options.map_options.element).
     * The passed element is "replaced by the real one": it is adopted as the
     * map container (given the vco-map class) and moved into place between
     * the menubar and the story slider.
     */
    _resolveMapElement(): HTMLElement | null {
        const element = this.options.map_options?.element;
        if (!element) {
            return null;
        }
        const el = typeof element === "string" ? Dom.get(element) : element;
        if (!el) {
            console.error("StoryMapJS: map_options.element not found: " + String(element));
            return null;
        }
        el.classList.add("vco-map");
        this._el.menubar.after(el);
        return el;
    }

    _onTitle(e: unknown) {
        this.fire("title", e);
    }

    _onColorChange(e: { color?: unknown; image?: unknown }) {
        if (e.color || e.image) {
            this._menubar.setColor(true);
        } else {
            this._menubar.setColor(false);
        }
    }

    _onSlideChange(e: { current_slide: number }) {
        if (this.current_slide !== e.current_slide) {
            this.current_slide = e.current_slide;
            this._map.goTo(this.current_slide);
            this.fire("change", { current_slide: this.current_slide }, this);
        }
    }

    _onMapChange(e: { current_marker: number }) {
        if (this.current_slide !== e.current_marker) {
            this.current_slide = e.current_marker;
            this._storyslider.goTo(this.current_slide);
            this.fire("change", { current_slide: this.current_slide }, this);
        }
    }

    _onOverview(e?: unknown) {
        this._map.markerOverview();
    }

    _onBackToStart(e?: unknown) {
        this.current_slide = 0;
        this._map.goTo(this.current_slide);
        this._storyslider.goTo(this.current_slide);
        this.fire("change", { current_slide: this.current_slide }, this);
    }

    _onMenuBarCollapse(e: { y: number }) {
        this._updateDisplay(e.y, true);
    }

    _onMouseClick(e?: Event) {}

    _fireMouseEvent(e: Event) {
        if (!this._loaded) {
            return;
        }

        let type = e.type;
        type = type === "mouseenter" ? "mouseover" : type === "mouseleave" ? "mouseout" : type;

        if (!this.hasEventListeners(type)) {
            return;
        }

        if (type === "contextmenu") {
            DomEvent.preventDefault(e);
        }

        this.fire(type, {
            latlng: "something", //this.mouseEventToLatLng(e),
            layerPoint: "something else", //this.mouseEventToLayerPoint(e)
        });
    }

    _onMapLoaded() {
        this._loaded.map = true;
        this._onLoaded();
    }

    _onStorySliderLoaded() {
        this._loaded.storyslider = true;
        this._onLoaded();
    }

    _onLoaded() {
        if (this._loaded.storyslider && this._loaded.map) {
            this.fire("loaded", this.data);
        }
    }
}

export default class StoryMap extends Evented(StoryMapBase) {
    declare static SCRIPT_PATH: string;

    constructor(...args: ConstructorParameters<typeof StoryMapBase>) {
        super(...args);
    }
}

// Calculates the script path and sets it as SCRIPT_PATH on the StoryMap class.
// import.meta.url works both for the source module (src/main.ts) and the built
// ESM bundle (js/storymap.js) — no UMD script tag sniffing needed.
(function (StoryMapClass) {
    StoryMapClass.SCRIPT_PATH = new URL("../", import.meta.url).href;
})(StoryMap);

export { StoryMap };
