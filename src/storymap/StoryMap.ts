import { mergeData, slideTransitionDuration, updateData, prefersReducedMotion } from "../core/Util";
import { loadCSS } from "../core/Load";
import { validateStorymapAndReport } from "./validate";
import { isPresentation3Manifest, manifestToStorymapData } from "./iiif";
import {
    ConsentManager,
    consentManagerOf,
    fontService,
    mediaService,
    narrationService,
    tileService,
    type ConsentService,
} from "./Consent";
import Dom from "../dom/Dom";
import { easeInOutQuint, easeOutStrong } from "../animation/easings";
import {
    setLanguage,
    isRtl,
    currentLanguageCode,
    claimLanguage,
    releaseLanguage,
    isLanguageConflict,
} from "../language/Language";
import {
    markInteraction,
    ownsPageEvent,
    registerParticipant,
    unregisterParticipant,
} from "../core/viewers";
import MediaType from "../media/MediaType";
import { Evented, type EventedInstance } from "../core/mixins";
import OpenLayersMap from "../map/openlayers/Map.OpenLayers";
import MenuBar from "../ui/MenuBar";
import StorySlider from "../slider/StorySlider";
import { Browser } from "../core/Browser";
import Animate from "../animation/tween";
import type { Map as OlMap } from "ol";
import type OlLayer from "ol/layer/Layer";
import type OpenLayersMapMarker from "../map/openlayers/MapMarker.OpenLayers";
import type {
    AnimationHandle,
    StorymapData,
    StorymapDataWrapper,
    StorymapOptions,
    StorymapSlide,
} from "../types";

/** Map height in pixels while the menubar has collapsed the map (portrait only). */
const COLLAPSED_MAP_HEIGHT = 1;

type StoryMapListener = (e: unknown) => void;

/**
 * Resolve a `font_css` value to an absolute stylesheet URL.
 *
 * - `stock:<name>` resolves against the library location.
 * - Absolute URLs pass through untouched.
 * - Anything else resolves against the page URL, so hosts can reference
 *   themes vendored into their own public dir (e.g. "fonts/font.css").
 */
export function resolveFontCssUrl(font: string): string {
    if (font.startsWith("stock:")) {
        const font_name = font.split(":")[1] || "default";
        // A crafted name ("stock:../../secret") would otherwise resolve to an
        // arbitrary same-origin file next to the bundle, because the name is
        // concatenated into a URL path. Only accept a bare theme name.
        if (!/^[a-z0-9-]+$/i.test(font_name)) {
            console.warn(
                "StoryMapJS: ignoring font_css with an invalid stock theme name",
                font_name,
            );
            return new URL("../css/fonts/font.default.css", import.meta.url).href;
        }
        // resolved against the library location: one directory up from
        // src/main.ts (dev) and js/storymap.js (build) in both cases
        return new URL("../css/fonts/font." + font_name + ".css", import.meta.url).href;
    }
    // Absolute URL, protocol-relative, or a data: URL. Note this must be a
    // real URL test, not a `/^(http|https|\/\/)/` prefix check: the old prefix
    // test false-positived on a relative path that merely *starts* with those
    // letters (e.g. "httpfonts.css"), which raised a spurious consent prompt
    // for a same-origin file.
    if (/^[a-z][a-z0-9+.-]*:/i.test(font) || font.startsWith("//")) {
        return font;
    }
    return new URL(font, document.baseURI).href;
}

/** True when `url` points off-origin (or at a data: URL) and needs a consent ask. */
export function isExternalUrl(url: string): boolean {
    // data:/blob: are not off-origin but are not a theme stylesheet either
    if (/^(data|blob):/i.test(url)) {
        return true;
    }
    try {
        return new URL(url, document.baseURI).origin !== window.location.origin;
    } catch {
        // unparseable: treat as external, so we err towards asking
        return true;
    }
}

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
class StoryMapBase {
    declare "_loaded": { storyslider: boolean; map: boolean };
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
    /**
     * The raw OpenLayers map. `null` until the map is built (the
     * constructor assigns it during data load) — check it, or use the
     * accessors, which return `null` until then.
     */
    declare "map": OlMap | null;
    declare "_menubar": MenuBar;
    declare "data": StorymapData;
    declare "options": StorymapOptions;
    declare "current_slide": number;
    declare "animator_map": AnimationHandle | null;
    declare "animator_storyslider": AnimationHandle | null;
    declare "_autoplay_timer": ReturnType<typeof setTimeout> | null;
    declare "_transition_timer": ReturnType<typeof setTimeout> | null;
    declare "_autoplay_stopped": boolean;
    /** The narration player: one <audio> for the whole story, reused. */
    declare "_narration_el": HTMLAudioElement | null;
    /** Guards a stale play() from a slide change that already moved on. */
    declare "_narration_token": number;
    /** Whether narration consent was granted (asked once per story). */
    declare "_narration_allowed": boolean;
    /** True once the visitor has clicked/keyed: unmuted audio needs this. */
    declare "_user_gestured": boolean;
    /** The advance armed for the current slide (media-ended or the timer). */
    declare "_autoplay_advance": (() => void) | null;
    /** A narration that was skipped for want of a gesture, to retry later. */
    declare "_replayNarrationAfterGesture": boolean;
    declare "_hash_initialized": boolean;
    declare "_collapsed": boolean;
    /** the data source was a IIIF Presentation manifest (legacy zoomify options are ignored) */
    declare "_data_from_manifest": boolean;
    declare "_resize_observer": ResizeObserver | null;
    /** Stored so `dispose()` can remove them again (see AGENTS: no leaks) */
    declare "_on_resize": (() => void) | null;
    declare "_on_keydown_global": ((e: KeyboardEvent) => void) | null;
    declare "_on_fullscreen": (() => void) | null;
    declare "_on_hashchange": (() => void) | null;
    /** Set by `dispose()` so a second call returns early. */
    declare "_disposed": boolean;
    /** identity of this viewer's claim on the page-wide locale */
    declare "_language_holder": symbol;
    /** the locale the caller actually asked for, if any; see _loadLanguage */
    declare "_language_requested": string | undefined;
    /** bumped on interaction, so page-wide keys can pick one viewer */
    declare "_interaction": number;
    declare "_onInteraction": (() => void) | null;
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
        // build-time constant from package.json (see vite.config.ts); the
        // typeof guard keeps a dev-server run without the define working
        this.version =
            typeof __STORYMAP_VERSION__ === "string" ? __STORYMAP_VERSION__ : "0.0.0-dev";

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
            const found = Dom.get(elem);
            if (!found) {
                throw new Error("StoryMapJS: no element with id " + elem);
            }
            this._el.container = found;
        }

        // Slider
        this._storyslider = {} as StorySlider;

        // Map
        this._map = {} as OpenLayersMap;
        // direct access to the OpenLayers map; null until it is built
        this.map = null;

        // Menu Bar
        this._menubar = {} as MenuBar;

        // Loaded State
        this._loaded = { storyslider: false, map: false };

        // Data Object
        // Test Data compiled from http://www.pbs.org/marktwain/learnmore/chronology.html
        this.data = {} as StorymapData;

        this.options = {
            script_path: StoryMap.SCRIPT_PATH,
            // raw OpenLayers Map/View options passed through (see map_options
            // in the README); empty by default, and the OL code reads it
            // defensively because the option is also settable from JSON
            map_options: {},
            height: this._el.container.offsetHeight,
            width: this._el.container.offsetWidth,
            layout: "landscape", // portrait or landscape
            base_class: "",
            default_bg_color: { r: 255, g: 255, b: 255 },
            map_size_sticky: 2.5, // Set as division 1/3 etc
            map_center_offset: null, // takes object {top:0,left:0}
            less_bounce: false, // Less map bounce when calculating zoom, false is good when there are clusters of tightly grouped markers
            start_at_slide: 0,
            call_to_action: false,
            call_to_action_text: "",
            menubar_height: 0,
            fullscreen: true,
            show_overview: true,
            show_back_to_start: true,
            skinny_size: 650,
            // animation
            duration: 1000,
            ease: easeInOutQuint,
            // interaction
            dragging: true,
            trackResize: true,
            keyboard: false,
            nocache: false,
            autoplay: 0,
            autoplay_media: false,
            show_progress: false,
            marker_labels: false,
            text_align: "left",
            map_overview_center: null,
            map_type: "", // "osm:standard",
            tile_source_factory: null,
            attribution: "",
            map_mini: true,
            map_subdomains: "",
            map_as_image: false,
            // no bundled credentials: pass map_access_token in the options
            // if you use Mapbox/Stadia tiles, api_key_flickr for flickr API
            // URLs
            map_access_token: "",
            map_background_color: "#d9d9d9",
            map_area: "full", // "left" limits the map to the visible half (landscape)
            map_bbox: null,
            // options the map also declares: updateData only copies keys
            // that already exist here, so storymap JSON could not reach them
            overview_extent: null,
            overlays: [],
            consent_required: false,
            zoomify: undefined,
            text_color: "",
            text_background_color: "",
            show_distance: false,
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
            api_key_flickr: "", // no bundled key: pass api_key_flickr in the options
            font_css: "stock:default",
            language: "en",
        } as StorymapOptions;

        // Animation Objects
        this.animator_map = null;
        this.animator_storyslider = null;
        this._resize_observer = null;
        this._on_resize = null;
        this._on_keydown_global = null;
        this._on_fullscreen = null;
        this._on_hashchange = null;
        this._disposed = false;
        this._language_holder = Symbol("storymap");
        this._language_requested = undefined;
        this._interaction = 0;
        this._onInteraction = null;
        this._resize_timer = null;
        this._autoplay_timer = null;
        this._transition_timer = null;
        this._autoplay_stopped = false;
        this._narration_el = null;
        this._narration_token = 0;
        this._narration_allowed = true;
        this._user_gestured = false;
        this._replayNarrationAfterGesture = false;
        this._autoplay_advance = null;
        this._hash_initialized = false;
        this._collapsed = false;

        // The caller's own `language`, read before the merge: afterwards
        // options.language is always set (the default is "en"), so "asked for
        // German" and "never mentioned a language" are indistinguishable.
        this._language_requested =
            typeof options?.language === "string" && options.language !== ""
                ? options.language
                : undefined;

        // Merge Options -- legacy, in case people still need to pass in
        mergeData(this.options, options);

        // Current Slide — the constructor options have been merged, but the
        // storymap *data* has not (issue #305). _initData -> _initOptions
        // merges the data in afterwards, and the data may carry a
        // start_at_slide of its own, so re-read it there rather than
        // freezing the constructor value here.
        this.current_slide = this.options.start_at_slide;

        this._initData(data);

        return this;
    }

    /* Initialize the data
	================================================== */
    _initData(data: string | StorymapDataWrapper | Record<string, unknown>) {
        // legacy zoomify options are only honored for storymap JSON sources —
        // a IIIF Presentation manifest cannot carry them
        this._data_from_manifest = false;
        if (typeof data === "string") {
            // issue #417: optional cache-busting re-fetch of the source file
            const url =
                this.options.nocache === true
                    ? data + (data.includes("?") ? "&" : "?") + "_=" + Date.now()
                    : data;
            void this._loadDataFromUrl(url, data);
        } else if (typeof data === "object") {
            if (isPresentation3Manifest(data)) {
                this._data_from_manifest = true;
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

    /* Load storymap data from a URL
	================================================== */
    async _loadDataFromUrl(url: string, source: string) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " " + response.statusText);
            }
            const result: unknown = await response.json();
            if (isPresentation3Manifest(result)) {
                this._data_from_manifest = true;
                this.data = manifestToStorymapData(result);
            } else {
                validateStorymapAndReport(result, source);
                const wrapper = result as StorymapDataWrapper;
                if (!wrapper.storymap) {
                    throw new Error("StoryMapJS: data must have a storymap property");
                }
                this.data = wrapper.storymap;
            }
            this._initOptions();
        } catch (err: unknown) {
            if (isLanguageConflict(err)) {
                // a second viewer on this page asked for another locale. This
                // is a configuration error, not a failed fetch, and reporting
                // it as one would send the host looking for a 404.
                console.error((err as Error).message);
                this.fire("error", { message: (err as Error).message, source, conflict: true });
                return;
            }
            console.error("StoryMapJS: could not load storymap data from " + source, err);
            this.fire("error", { message: String(err), source });
        }
    }

    /* Initialize the options
	================================================== */
    _initOptions() {
        // Grab options from storymap data
        updateData(this.options, this.data);

        // issue #305: the data may override start_at_slide. The constructor
        // read it before this merge, and the slider's opening goTo() fires
        // before _initEvents() attaches our change listener — so nothing
        // else resynchronises the field, leaving the hash, the progress bar
        // and current_slide disagreeing with the visible slide.
        this.current_slide = this.options.start_at_slide;

        // legacy zoomify options only work with storymap JSON sources — a
        // IIIF Presentation manifest cannot carry them
        if (this._data_from_manifest) {
            delete this.options.zoomify;
        }

        if (this.options.layout === "landscape") {
            // map_area "left": the map is limited to the visible half with an
            // opaque slide panel — no offset needed (the view center is the
            // visible center already); "full" (default) offsets the view so
            // markers clear the panel that fades in over the map
            if (this.options.map_area !== "left") {
                this.options.map_center_offset = { left: -200, top: 0 };
            } else {
                this.options.map_center_offset = { left: 0, top: 0 };
            }
        }
        if (this.options.map_type === "iiif" && this.options.map_as_image) {
            this.options.map_size_sticky = 2;
        }
        // legacy zoomify stories are image maps too — the map window is half
        // the height (the original renderer's layout)
        if (this.options.map_type === "zoomify") {
            this.options.map_size_sticky = 2;
        }
        if (this.options.map_as_image) {
            this.options.calculate_zoom = false;
        }

        // legacy zoomify support: rendered by the map via the image pyramid
        // (options.zoomify) — deprecated, a JS warning points at iiif
        if (this.options.map_type === "zoomify") {
            console.warn(
                "StoryMapJS: map_type 'zoomify' is a legacy image-pyramid basemap; consider map_type 'iiif' with options.iiif.url instead.",
            );
            const zoomify_opts = this.options.zoomify;
            if (typeof zoomify_opts !== "object" || !zoomify_opts.path) {
                console.error(
                    "StoryMapJS: map_type 'zoomify' needs a zoomify image pyramid (path, width, height) in the storymap data.",
                );
            }
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
        // the locale chunk is fetched on demand, so the language is not
        // available synchronously; layout proceeds with the English defaults
        // and the labels are repainted once the locale arrives.
        //
        // The claim is what makes a second viewer on this page safe: the UI
        // strings are one module-level binding, so a conflicting locale would
        // otherwise repaint this viewer in the other viewer's language. It
        // throws rather than warn, before any of this viewer's DOM exists.
        //
        // The document may carry its own `language` (updateData merges the
        // document's keys into the options), so that counts as a request too.
        const requested = this._requestedLanguage();
        if (requested === undefined) {
            // Nobody asked for a locale, so adopt whatever the page is already
            // using. Claiming the "en" default instead would conflict with a
            // sibling that did ask — a host that called setLanguage("de") and
            // then built a viewer with no `language` option used to get
            // English, silently repainting its German sibling's chrome.
            claimLanguage(currentLanguageCode(), this._language_holder);
        } else {
            claimLanguage(requested, this._language_holder);
            setLanguage(requested);
        }
        this._onDataLoaded();
    }

    /**
     * The locale this viewer was actually asked for, or undefined when the
     * caller and the document both stayed silent.
     */
    _requestedLanguage(): string | undefined {
        // the document wins, because updateData merges it over the options, so
        // a document-level `language` is what options.language ends up holding
        const fromDocument = (this.data as { language?: unknown } | null | undefined)?.language;
        if (typeof fromDocument === "string" && fromDocument !== "") {
            return fromDocument;
        }
        return this._language_requested;
    }

    /*  Switch the UI language at runtime, without a page reload.
    ================================================== */

    refreshLanguage(code: string): void {
        if (this._disposed) return;
        // throws if a sibling viewer is rendering in another language
        claimLanguage(code, this._language_holder);
        this.options.language = code;
        setLanguage(code);
        this._applyLanguageLayout();
    }

    /**
     * Repaint everything a runtime language switch affects: the menubar
     * labels and the `vco-rtl` class.
     *
     * This deliberately does *not* call `updateDisplay()`. A full re-layout
     * re-runs the slider's `goTo(current_slide)`, which goes through the
     * navigation path that re-arms autoplay — so calling it here silently
     * cancelled a pending autoplay tick and the story stopped advancing.
     */
    _applyLanguageLayout(): void {
        this._menubar?.refreshLabels?.();
        this._el.container.classList.toggle("vco-rtl", isRtl());
    }

    /*  Load the font theme stylesheet
    ================================================== */
    async _loadFontCss() {
        // only genuinely external URLs ask for consent: stock: themes and
        // relative paths resolve to same-origin / library assets
        const original = this.options.font_css || "stock:default";
        const font = resolveFontCssUrl(original);
        const manager = consentManagerOf(this.options);
        const external = /^(http|https|\/\/)/.test(original);
        if (external && this.options.consent_required && manager) {
            // external font CSS is an external service — ask first
            const host = new URL(font.startsWith("//") ? "https:" + font : font).host;
            const container = this._el.map ?? (this._el.container as HTMLElement);
            const allowed = await manager.request(fontService(), host, container);
            if (!allowed) {
                return;
            }
        }
        if (font) {
            try {
                await loadCSS(font);
            } catch {
                // a missing font theme must not block the storymap; the
                // font-loaded event fires either way, as before
            } finally {
                this._onFontLoaded(font);
            }
        }
    }

    _onFontLoaded(font: string) {
        this.fire("fontLoaded", { font: font });
    }

    /*	Navigation
	================================================== */
    /**
     * Navigate to a slide by index. Out-of-range indices are ignored, as is
     * the current index.
     *
     * @param n - Zero-based slide index; the map animates to the slide's
     *   marker. The overview is selected by the slide's own
     *   `type: "overview"`, not by its index.
     */
    goTo(n: number) {
        if (this._disposed) return;
        // out-of-range indices are ignored: they would desync the slider and
        // map (no active slide) and write a broken #slide-N bookmark
        if (n >= 0 && n < (this.data?.slides?.length ?? 0) && n !== this.current_slide) {
            this._navigate(n);
        }
    }

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
    private _navigate(
        n: number,
        opts: {
            navigate?: "slider" | "map";
            navigated?: boolean;
            animate?: boolean;
        } = {},
    ): void {
        const { navigate, navigated = false, animate = true } = opts;
        const duration = animate ? slideTransitionDuration(this.current_slide, n) : 0;

        this.current_slide = n;
        if (navigate !== "slider") {
            this._storyslider.goTo(this.current_slide);
        }
        if (navigate !== "map") {
            this._map.goTo(this.current_slide);
        }
        this._beginTransition(duration);
        if (!navigated) {
            // programmatic navigation reports outward like interaction does;
            // the bubbled slider/map change events are dropped by their
            // equality guards, so this fires exactly once
            this.fire("change", { current_slide: this.current_slide }, this);
        }
        this._syncHash();
        this._playNarration(this.data.slides?.[this.current_slide]);
        this._scheduleAutoplay();
        this._updateProgress();
    }

    /**
     * Announce a slide transition: `transitionstart` now (with the glide
     * duration both animations were started with) and `transitionend` once
     * it elapses. Restarts on every navigation, so only the latest
     * transition ever ends.
     */
    _beginTransition(duration: number): void {
        if (this._transition_timer) {
            clearTimeout(this._transition_timer);
        }
        this.fire("transitionstart", { current_slide: this.current_slide, duration }, this);
        this._transition_timer = setTimeout(() => {
            this._transition_timer = null;
            this.fire("transitionend", { current_slide: this.current_slide }, this);
        }, duration);
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
    /**
     * Sugar over {@link setMapOptions} — `setMapOption(name, value)` is the
     * same call as `setMapOptions({ [name]: value })`.
     */
    setMapOption(name: string, value: unknown) {
        if (this._disposed) return;
        this.setMapOptions({ [name]: value } as Partial<StorymapOptions>);
    }

    /**
     * Show or hide a stacked overlay by index (see the `overlays` option).
     * Prefer `getOverlayLayer(index).setVisible(v)` on the layer itself; this
     * wrapper also re-syncs the attribution line and the overlay blend mode.
     */
    setOverlayVisible(index: number, visible: boolean): void {
        if (this._disposed) return;
        this._map.setOverlayVisible(index, visible);
    }

    /**
     * Set a stacked overlay's opacity by index (see the `overlays` option).
     * Alias: `getOverlayLayer(index)?.setOpacity(opacity)`.
     */
    setOverlayOpacity(index: number, opacity: number): void {
        if (this._disposed) return;
        this._map.setOverlayOpacity(index, opacity);
    }

    /**
     * Change several map options at runtime (see setMapOption).
     */
    setMapOptions(options: Partial<StorymapOptions>) {
        if (this._disposed) return;
        mergeData(this.options, options);
        if (this._map && this._map.options) {
            mergeData(this._map.options, options);
            this._map.applyOptions(Object.keys(options));
        }
        if (this.ready) {
            // text color theming follows runtime option changes (issue #177)
            this._applyTextColors();
            this.updateDisplay();
        }
    }

    /*	OpenLayers accessors
	The map itself is public (`storymap.map`, the raw `ol/Map`). These hand
	out the objects the viewer keeps private, so a consumer never has to reach
	through an underscore field. `getBaseLayer()` returns `null` while the
	base layer is deferred awaiting tile consent.
	================================================= */

    /** The base tile layer, or `null` when deferred (tile consent not granted). */
    getBaseLayer(): OlLayer | null {
        return !this._disposed && this._map ? this._map.getBaseLayer() : null;
    }

    /** The stacked `overlays[]` layers, in `overlays[]` order. */
    getOverlayLayers(): OlLayer[] {
        return !this._disposed && this._map ? this._map.getOverlayLayers() : [];
    }

    /** One stacked overlay layer by its `overlays[]` index, or `null`. */
    getOverlayLayer(index: number): OlLayer | null {
        return !this._disposed && this._map ? this._map.getOverlayLayer(index) : null;
    }

    /** The minimap's OpenLayers map (the `OverviewMap` control's inner map). */
    getMinimap(): OlMap | null {
        return !this._disposed && this._map ? this._map.getMinimap() : null;
    }

    /** The full (inactive) route line layer. */
    getLine(): OlLayer | null {
        return !this._disposed && this._map ? this._map.getLine() : null;
    }

    /**
     * True when the map shows a IIIF image as a picture of the world
     * (`map_as_image`) rather than as a georeferenced map. In that mode the
     * view is `EPSG:4326` image space: `map.getView().getCenter()` is in
     * degrees, the resolution is in pixels per degree, and marker locations
     * are pixel offsets into the image. Ask this instead of checking
     * `map_type` — georeferenced IIIF (`map_bbox` without `map_as_image`)
     * is an ordinary mercator map.
     */
    isImageSpace(): boolean {
        return !this._disposed && this._map ? this._map.isImageSpace() : false;
    }

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
    dispose(): void {
        if (this._disposed) {
            return;
        }
        this._disposed = true;

        for (const timer of [this._transition_timer, this._autoplay_timer, this._resize_timer]) {
            if (timer !== null && timer !== undefined) {
                clearTimeout(timer);
            }
        }
        this._transition_timer = null;
        this._autoplay_timer = null;
        this._resize_timer = null;

        this._resize_observer?.disconnect();
        this._resize_observer = null;

        if (this._on_resize) {
            window.removeEventListener("resize", this._on_resize);
            this._on_resize = null;
        }
        if (this._on_keydown_global) {
            window.removeEventListener("keydown", this._on_keydown_global);
            this._on_keydown_global = null;
        }
        if (this._on_fullscreen) {
            document.removeEventListener("fullscreenchange", this._on_fullscreen);
            this._on_fullscreen = null;
        }
        if (this._on_hashchange) {
            window.removeEventListener("hashchange", this._on_hashchange);
            this._on_hashchange = null;
        }

        // slide transitions in flight (Web Animations API)
        for (const el of [this._el?.container, this._el?.map]) {
            el?.getAnimations?.().forEach((a) => a.cancel());
        }

        // an unanswered consent panel holds a promise that Media.loadMedia()
        // is awaiting; settle it before the children go away
        consentManagerOf(this.options)?.dispose();

        this._stopNarration();
        if (this._narration_el) {
            this._narration_el.src = "";
            this._narration_el = null;
        }
        this._storyslider?.dispose?.();
        this._menubar?.dispose?.();
        this._map?.dispose?.();

        // the public ol/Map handle. The viewer is terminal after dispose(), so
        // this is null rather than a disposed instance; the public methods
        // above are guarded and no-op instead of throwing.
        this.map = null;

        // empty the host element: the children owned their own listeners and
        // players, but their nodes (and the ol canvas) would otherwise stay
        // in the document after teardown
        this._el?.container?.replaceChildren();

        // let another viewer claim a different language, now that this one is
        // no longer reading the shared strings (refcounted, so a sibling in
        // the same language keeps its claim)
        releaseLanguage(this._language_holder);

        if (this._onInteraction) {
            for (const type of ["pointerdown", "focusin", "wheel"] as const) {
                this._el.container.removeEventListener(type, this._onInteraction);
            }
            this._onInteraction = null;
        }
        unregisterParticipant(this);
    }

    /**
     * This viewer's root element. Satisfies the `Participant` shape the
     * page-wide key registry (`src/core/viewers.ts`) arbitrates on.
     *
     * @internal
     */
    get element(): HTMLElement | null {
        return this._el?.container ?? null;
    }

    /**
     * Monotonic stamp of the last interaction with this viewer; the highest
     * one owns a page-wide keypress when nothing is focused.
     *
     * @internal
     */
    get interaction(): number {
        return this._interaction;
    }

    /** The highlighted route line drawn up to the current slide. */
    getLineActive(): OlLayer | null {
        return !this._disposed && this._map ? this._map.getLineActive() : null;
    }

    /** The map markers, indexed by slide. */
    getMarkers(): OpenLayersMapMarker[] {
        return !this._disposed && this._map ? this._map.getMarkers() : [];
    }

    /** One map marker by slide index, or `null`. */
    getMarker(index: number): OpenLayersMapMarker | null {
        return !this._disposed && this._map ? this._map.getMarker(index) : null;
    }

    /**
     * Rebuild the minimap (`OverviewMap` control). The constructor already
     * builds it; this is for hosts that recreate it after a `map_type` swap
     * or a deferred tile-consent grant.
     */
    createMiniMap(): void {
        if (this._disposed) return;
        this._map.createMiniMap();
    }

    /**
     * Append attribution fragments and refresh the credit line (e.g. for a
     * custom layer added through `tile_source_factory`).
     */
    setExtraAttributions(parts: string[]): void {
        if (this._disposed) return;
        this._map.setExtraAttributions(parts);
    }

    /**
     * Publish the text colour custom properties. Called from both the initial
     * layout and every runtime option change (issue #177) so the two paths
     * cannot drift.
     */
    _applyTextColors(): void {
        if (this.options.text_color) {
            this._el.container.style.setProperty("--vco-color-text", this.options.text_color);
        }
        if (this.options.text_background_color) {
            this._el.container.style.setProperty(
                "--vco-color-text-background",
                this.options.text_background_color,
            );
        }
    }

    /*	Private Methods
	================================================== */

    // Initialize the layout
    _initLayout() {
        this._el.container.className += " vco-storymap";
        this.options.base_class = this._el.container.className;

        // Text color theming (issue #177): expose the text colors as CSS
        // custom properties consumed by the slide typography
        this._applyTextColors();

        // Create Layout
        this._el.menubar = Dom.create("div", "vco-menubar", this._el.container);
        this._el.map =
            this._resolveMapElement() ?? Dom.create("div", "vco-map", this._el.container);
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
        // image readiness (IIIF/zoomify sources attach asynchronously) is
        // re-fired on the StoryMap, the coordination point for hosts that
        // overlay or measure their own layers
        this._map.on("imageready", (e: unknown) => {
            this.fire("imageready", e);
        });

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
        this._menubar.on("fullscreen", this._onFullscreenToggle, this);

        // StorySlider Events
        this._storyslider.on("change", this._onSlideChange, this);
        this._storyslider.on("colorchange", this._onColorChange, this);

        // Map Events
        this._map.on("change", this._onMapChange, this);

        // Global slide navigation (opt-in): the slider only listens on its
        // own panel, which needs focus.
        //
        // With more than one viewer on the page, `window` is shared, and
        // e.preventDefault() does not stop a sibling listener on the same
        // target — so an arrow press used to advance every story at once. This
        // viewer takes part in the registry and then answers whether it owns
        // the event (focus first, then most-recently-interacted).
        if (this.options.keyboard) {
            this._onInteraction = () => {
                this._interaction = markInteraction();
            };
            for (const type of ["pointerdown", "focusin", "wheel"] as const) {
                this._el.container.addEventListener(type, this._onInteraction, {
                    passive: true,
                });
            }
            registerParticipant(this);
            this._on_keydown_global = (e: KeyboardEvent) => this._onKeyDownGlobal(e);
            window.addEventListener("keydown", this._on_keydown_global);
        }

        // Fullscreen state
        this._on_fullscreen = () => this._onFullscreenChange();
        document.addEventListener("fullscreenchange", this._on_fullscreen);
    }

    _onKeyDownGlobal(e: KeyboardEvent) {
        if (e.defaultPrevented) {
            return;
        }
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            target?.isContentEditable
        ) {
            return;
        }
        // One viewer owns a page-wide keypress. This also covers the old
        // "let OpenLayers pan the map" carve-out: the map is inside the
        // viewer's own container, so a keypress aimed at another viewer (or at
        // nothing the visitor has focused) no longer reaches this slider.
        if (!ownsPageEvent(this)) {
            return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            this._storyslider.next();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            this._storyslider.previous();
        }
    }

    // View
    _updateDisplay(map_height?: number, animate?: boolean, d?: number) {
        // prefers-reduced-motion: glides collapse to instant size changes
        if (animate && prefersReducedMotion()) {
            animate = false;
        }
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

            // Portrait split. The collapse toggle is only offered in portrait
            // (MenuBar hides it in landscape), so this branch used to
            // unconditionally recompute map_height and discard the collapsed
            // height it was handed — the button was a visual no-op. Honour
            // the toggle state instead.
            if (this._collapsed) {
                this.options.map_height = COLLAPSED_MAP_HEIGHT;
            } else {
                this.options.map_height = this.options.height / this.options.map_size_sticky;
            }
            this.options.storyslider_height = this.options.height - this.options.map_height - 1;
            this._menubar.setSticky(0);

            // Portrait: the map spans the full width again (a landscape
            // map_area "left" pass narrowed it)
            display_class += " vco-layout-portrait";
            this._el.map.style.width = "100%";

            if (animate) {
                // Animate Map
                if (this.animator_map) {
                    this.animator_map.stop();
                }

                this.animator_map = Animate(this._el.map, {
                    height: this.options.map_height + "px",
                    duration: duration,
                    easing: easeOutStrong,
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
                    easing: easeOutStrong,
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

            // Set Sticky state of MenuBar
            this._menubar.setSticky(this.options.menubar_height);

            this._el.map.style.height = this.options.height + "px";

            // map_area "left": the map element is limited to the left, visible
            // half (the slide panel is opaque) — no view offset needed;
            // "full" (default): the map spans the whole width behind the
            // fading slide panel and the view is offset by a quarter width
            if (this.options.map_area === "left") {
                display_class += " vco-map-area-left";
                this._el.map.style.width = Math.floor(this.options.width / 2) + "px";
                this._map.setMapOffset(0, 0);
            } else {
                this._el.map.style.width = "100%";
                this._map.setMapOffset(-(this.options.width / 4), 0);
            }

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

        // the resolved locale decides the layout direction (issues #211, #245)
        if (isRtl()) {
            display_class += " vco-rtl";
        }

        // Apply class
        this._el.container.className = display_class;
    }

    /*	Events
	================================================== */

    _onDataLoaded(e?: unknown) {
        // attach the consent manager BEFORE the layout is created, so the
        // slider/map/media options copies all share it
        (this.options as Record<string, unknown>).consent_manager = new ConsentManager();
        this.fire("dataloaded");
        this._initLayout();
        // font themes load once the layout exists: the consent ask for
        // external font CSS needs a real container to render into
        void this._loadFontCss().catch((err: unknown) => {
            console.warn("StoryMapJS: font theme could not be loaded", err);
        });
        this._initEvents();
        this._initResizeHandling();
        this.ready = true;
        this._startConsentAsk();
        this._startAutoplay();
    }

    /**
     * Start-of-story consent (issue: allow all / individually / decline
     * all): with `consent_required`, one dialog lists every external
     * service the story uses — map tiles, external web fonts and the media
     * services in the slides. Shown only while some service is unanswered;
     * per-service slide asks remain the fallback.
     */
    _startConsentAsk(): void {
        const manager = consentManagerOf(this.options);
        if (!manager || !this.options.consent_required) {
            return;
        }
        const services: ConsentService[] = [];
        // map tiles — the same service the map's layer code keys off
        services.push(tileService());
        // media services with a real URL in the slides (a storymap is allowed
        // to have no slides at all)
        const seen = new Set<string>();
        for (const slide of this.data.slides ?? []) {
            const url = (slide.media as { url?: string | null } | null)?.url;
            if (!url) continue;
            const match = MediaType({ url } as never) as { type: string; name: string } | false;
            if (!match || seen.has(match.type)) continue;
            seen.add(match.type);
            // same registry the per-slide panel uses, so the two dialogs can
            // never disagree about a service's name
            services.push(mediaService(match.type, match.name));
        }
        // Slide narration is its own service: the recording plays through a
        // dedicated audio element, not through Media, so nothing else asks
        // for it — without this the GDPR mode would have a hole.
        const has_narration = (this.data.slides ?? []).some(
            (slide) => !!(slide.narration as { url?: string } | null)?.url,
        );
        if (has_narration && !seen.has("narration")) {
            services.push(narrationService());
        }
        // external web fonts (same-origin themes never ask). Compared by
        // origin, not by a prefix test on the resolved URL: resolveFontCssUrl
        // has already turned a relative path into an absolute one, so testing
        // that for "http" made every relative font_css look external.
        const font = resolveFontCssUrl(this.options.font_css || "stock:default");
        if (isExternalUrl(font)) {
            services.push(fontService());
        }
        manager.requestAll(services, this._el.container);
    }

    /*  Autoplay (issue #380) and hash bookmarks (issue #146)
    ================================================== */
    /*  Narration (docs/plans/iiif-media-tours.md §2)
    ================================================== */

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
    _playNarration(slide: StorymapSlide | undefined, allow_without_gesture = false) {
        const url = (slide?.narration as { url?: string } | null)?.url;
        this._stopNarration();
        if (!url || this._disposed || !this._narration_allowed) return;
        if (!allow_without_gesture && !this._has_user_gesture()) {
            this._replayNarrationAfterGesture = true;
            return;
        }
        const el = this._narrationElement();
        el.src = url;
        el.currentTime = 0;
        const token = ++this._narration_token;
        // a rejected play() (policy, network) must not surface as an
        // unhandled rejection
        void el.play()?.catch?.(() => {
            if (token === this._narration_token) this._replayNarrationAfterGesture = true;
        });
    }

    _narrationElement(): HTMLAudioElement {
        if (this._narration_el === null) {
            this._narration_el = document.createElement("audio");
            this._narration_el.className = "vco-media-item vco-narration";
            this._narration_el.preload = "none";
            this._narration_el.setAttribute("aria-hidden", "true");
        }
        return this._narration_el;
    }

    _stopNarration() {
        this._narration_token++;
        const el = this._narration_el;
        if (!el) return;
        el.pause();
        el.removeAttribute("src");
    }

    /** A gesture has happened, so unmuted audio is allowed from now on. */
    _note_user_gesture_for_narration() {
        if (this._disposed) return;
        this._narration_allowed = this._narration_allowed && true;
        if (this._replayNarrationAfterGesture) {
            this._replayNarrationAfterGesture = false;
            this._playNarration(this.data.slides?.[this.current_slide], true);
        }
    }

    _has_user_gesture(): boolean {
        return this._user_gestured;
    }

    _startAutoplay() {
        this._stopAutoplay();
        this._autoplay_stopped = false;
        // a denied media:narration service means no narration for this story
        const manager = consentManagerOf(this.options);
        if (manager && this.options.consent_required) {
            this._narration_allowed = !manager.isDenied(narrationService().key);
        }
        // browsers only allow unmuted audio after a user gesture; the first
        // interaction arms narration for the rest of the story
        if (!this._user_gestured) {
            const on_gesture = () => {
                this._user_gestured = true;
                this._note_user_gesture_for_narration();
                this._el.container.removeEventListener("pointerdown", on_gesture);
                this._el.container.removeEventListener("keydown", on_gesture);
            };
            this._el.container.addEventListener("pointerdown", on_gesture, { once: true });
            this._el.container.addEventListener("keydown", on_gesture, { once: true });
        }
        // prefers-reduced-motion: no autoplay (WCAG 2.2.2)
        if (this.options.autoplay > 0 && !prefersReducedMotion()) {
            // any user interaction stops autoplay permanently
            const stop = () => {
                this._autoplay_stopped = true;
                this._stopAutoplay();
            };
            this._el.container.addEventListener("pointerdown", stop, { once: true });
            this._el.container.addEventListener("keydown", stop, { once: true });
            this._el.container.addEventListener("touchstart", stop, { once: true });
            this._scheduleAutoplay();
        }
    }

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
    _scheduleAutoplay() {
        this._stopAutoplay();
        if (!(this.options.autoplay > 0) || this._autoplay_stopped) return;

        const advance = () => {
            this._stopAutoplay();
            if (this.current_slide + 1 < this.data.slides.length) {
                this.goTo(this.current_slide + 1);
                this._scheduleAutoplay();
            }
        };
        this._autoplay_advance = advance;

        if (this.options.autoplay_media) {
            const slide = this._storyslider?._slides?.[this.current_slide];
            if (slide?.hasPlayableMedia?.()) {
                slide.onMediaEnded(advance);
            }
        }

        this._autoplay_timer = setTimeout(advance, this.options.autoplay);
    }

    _stopAutoplay() {
        if (this._autoplay_timer) {
            clearTimeout(this._autoplay_timer);
            this._autoplay_timer = null;
        }
        this._autoplay_advance = null;
    }

    /** Keep the URL hash in sync with the current slide (#slide-N). */
    _syncHash() {
        try {
            // preserve the query string: pages like the embed player carry
            // their configuration in it (?url=..., ?example=...)
            history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search + "#slide-" + this.current_slide,
            );
        } catch {
            // non-browser or sandboxed contexts
        }
    }

    /** A #slide-N hash deep-links the storymap (applied on load + hashchange). */
    _applyHashSlide(): boolean {
        const match = /^#slide-(\d+)$/.exec(window.location.hash);
        if (!match) return false;
        const n = parseInt(match[1], 10);
        if (n >= 0 && n < this.data.slides.length && n !== this.current_slide) {
            this.goTo(n);
            return true;
        }
        return false;
    }

    /*  Resize handling
    ================================================== */
    _initResizeHandling() {
        if (!this.options.trackResize) {
            return;
        }
        // Leading + trailing debounce: the first resize event re-layouts
        // immediately (instant feedback), the trailing one settles after the
        // resize burst ends.
        const onResize = () => {
            if (this._resize_timer) {
                clearTimeout(this._resize_timer);
            } else {
                this.updateDisplay();
            }
            this._resize_timer = setTimeout(() => {
                this._resize_timer = null;
                this.updateDisplay();
            }, 200);
        };
        if (typeof ResizeObserver !== "undefined") {
            // covers containers resized by their embedding layout
            this._resize_observer = new ResizeObserver(onResize);
            this._resize_observer.observe(this._el.container);
        }
        this._on_resize = onResize;
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
            // the slider already moved itself
            this._navigate(e.current_slide, { navigate: "slider" });
        }
    }

    _onMapChange(e: { current_marker: number }) {
        if (this.current_slide !== e.current_marker) {
            // the map already moved itself
            this._navigate(e.current_marker, { navigate: "map" });
        }
    }

    _updateProgress() {
        if (this.options.show_progress && this._menubar) {
            this._menubar.setProgress(this.current_slide, this.data.slides.length);
        }
    }

    _onOverview(e?: unknown) {
        this._map.markerOverview();
    }

    /**
     * Toggle the native fullscreen API on the storymap container and keep the
     * menubar button state in sync.
     */
    _onFullscreenToggle(e?: unknown) {
        if (document.fullscreenElement === this._el.container) {
            document.exitFullscreen().catch((err: unknown) => {
                console.error("StoryMapJS: could not exit fullscreen", err);
            });
        } else {
            this._el.container.requestFullscreen().catch((err: unknown) => {
                console.error("StoryMapJS: could not enter fullscreen", err);
            });
        }
    }

    _onFullscreenChange() {
        const active = document.fullscreenElement === this._el.container;
        this._menubar.setFullscreenState(active);
        // re-measure once the browser has applied the fullscreen layout
        // (the container resizes asynchronously after the event)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.updateDisplay();
            });
        });
    }

    _onBackToStart(e?: unknown) {
        if (this.current_slide === 0) {
            return;
        }
        this._navigate(0);
    }

    _onMenuBarCollapse(e: { y?: number; collapsed?: boolean }) {
        // `y` is the menubar position, not a map height; `collapsed` is the
        // authoritative signal. Older menubars omit it, so infer it from a
        // near-zero y for backwards compatibility.
        this._collapsed = e.collapsed !== undefined ? e.collapsed : e.y !== undefined && e.y < 5;
        this._updateDisplay(undefined, true);
    }

    _onMapLoaded() {
        this._loaded.map = true;
        this._onLoaded();
    }

    _onStorySliderLoaded() {
        this._loaded.storyslider = true;
        this._onLoaded();
    }

    /**
     * Compute and display the great-circle distance of the marker route
     * (issue #341); hidden when `show_distance` is off.
     */
    _updateDistance() {
        if (!this.options.show_distance) {
            return;
        }
        const km = this._map.getRouteDistance();
        this._menubar.setDistance(km);
    }

    _onLoaded() {
        if (this._loaded.storyslider && this._loaded.map) {
            this.fire("loaded", this.data);
            if (!this._hash_initialized) {
                this._hash_initialized = true;
                // a #slide-N hash deep-links the initial slide (issue #146)
                // and keeps working through the browser back/forward buttons
                this._applyHashSlide();
                this._on_hashchange = () => this._applyHashSlide();
                window.addEventListener("hashchange", this._on_hashchange);
                this._syncHash();
            }
            this._updateProgress();
            this._updateDistance();
        }
    }
}

export default class StoryMap extends Evented(StoryMapBase) {
    /**
     * The library base path (the directory containing the module).
     * Derived from `import.meta.url`, which works both for the source module
     * (src/main.ts) and the built ESM bundle (js/storymap.js).
     */
    static SCRIPT_PATH = new URL("../", import.meta.url).href;

    constructor(...args: ConstructorParameters<typeof StoryMapBase>) {
        super(...args);
    }
}

export { StoryMap };
