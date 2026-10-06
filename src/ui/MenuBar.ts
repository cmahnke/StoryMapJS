import { mergeData } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { easeInOutQuint } from "../animation/easings";

import { DomEvent } from "../dom/DomEvent";
import { PROGRESSBAR_STYLES } from "../types";
import { Browser } from "../core/Browser";
import { Language, currentLocale } from "../language/Language";
import LayersControl, { type LayersControlDelegate } from "./LayersControl";

/*	MenuBar
	Buttons, progress and distance display for the storymap
================================================== */

interface MenuBarOptions {
    width: number;
    height: number;
    duration: number;
    ease: unknown;
    menubar_default_y: number;
    [key: string]: unknown;
}

export interface MenuBarEvents {
    overview: Event;
    back_to_start: Event;
    fullscreen: Event;
    autoplay_toggle: undefined;
    progress_go: { slide: number };
    collapse: { y: number; collapsed: boolean };
    basemapchange: { map_type: string };
    overlaychange: { index: number; visible: boolean };
    loaded: undefined;
    added: undefined;
    removed: undefined;
}

class MenuBarBase {
    declare "_el": Record<string, HTMLElement>;
    declare "collapsed": boolean;
    declare "options": MenuBarOptions;
    declare "animator": Record<string, unknown>;
    declare "fire": EventedInstance<MenuBarEvents>["fire"];
    _fullscreenActive = false;
    _autoplayStopped = false;
    /** The layer switcher, if `show_layers_control` is on. */
    declare "_layersControl": LayersControl | null;

    /*	Constructor
	================================================== */
    constructor(elem: HTMLElement | string, parent_elem?: HTMLElement, options?: object) {
        // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            button_overview: {},
            button_backtostart: {},
            button_fullscreen: {},
            progress: {},
            progress_fill: {},
            distance: {},
            button_collapse_toggle: {},
            arrow: {},
            line: {},
            coverbar: {},
            grip: {},
        } as unknown as Record<string, HTMLElement>;

        this.collapsed = false;

        if (typeof elem === "object") {
            this._el.container = elem;
        } else {
            const found = Dom.get(elem);
            if (!found) {
                throw new Error("StoryMapJS: no element with id " + elem);
            }
            this._el.container = found;
        }

        if (parent_elem) {
            this._el.parent = parent_elem;
        }

        //Options
        this.options = {
            width: 600,
            height: 600,
            duration: 1000,
            ease: easeInOutQuint,
            menubar_default_y: 0,
        };

        // Animation
        this.animator = {};

        this._layersControl = null;

        // Merge Data and Options
        mergeData(this.options, options);

        this._initLayout();
    }

    /*	Public
	================================================== */
    show(d?: number): void {
        // the menubar renders statically; no entrance animation
    }

    hide(top: number): void {
        // the menubar renders statically; no exit animation
    }

    setSticky(y: number): void {
        this.options.menubar_default_y = y;
    }

    /*	Color
	================================================== */
    setColor(inverted: boolean): void {
        if (inverted) {
            this._el.container.className = "vco-menubar vco-menubar-inverted";
        } else {
            this._el.container.className = "vco-menubar";
        }
    }

    /**
     * Reflect the fullscreen state in the button label/icon.
     */
    setFullscreenState(active: boolean): void {
        this._fullscreenActive = active;
        const icon = active ? "vco-icon-resize-small" : "vco-icon-resize-full";
        if (Browser.mobile) {
            this._el.button_fullscreen.innerHTML = `<span class='${icon}'></span>`;
        } else {
            const label = active ? Language.buttons.exit_fullscreen : Language.buttons.fullscreen;
            this._el.button_fullscreen.innerHTML = `${label} <span class='${icon}'></span>`;
        }
    }

    /**
     * Repaint the overview button label. An image map has no interactive
     * overview, so it gets the shorter wording.
     */
    _renderOverviewLabel(): void {
        this._el.button_overview.innerHTML = this.options.map_as_image
            ? Language.buttons.overview
            : Language.buttons.map_overview;
    }

    /**
     * Repaint the "back to start" button label. Icon-only on mobile.
     */
    _renderBackToStartLabel(): void {
        this._el.button_backtostart.innerHTML = Browser.mobile
            ? "<span class='vco-icon-goback'></span>"
            : Language.buttons.backtostart + " <span class='vco-icon-goback'></span>";
    }

    /**
     * Repaint the collapse/expand toggle. Icon-only on mobile.
     */
    _renderCollapseLabel(collapsed: boolean): void {
        const arrow = collapsed ? "arrow-down" : "arrow-up";
        if (Browser.mobile) {
            this._el.button_collapse_toggle.innerHTML = `<span class='vco-icon-${arrow}'></span>`;
        } else {
            const text = collapsed
                ? Language.buttons.uncollapse_toggle
                : Language.buttons.collapse_toggle;
            this._el.button_collapse_toggle.innerHTML = `${text} <span class='vco-icon-${arrow}'></span>`;
        }
    }

    /**
     * Reflect the autoplay state in the toggle label.
     */
    setAutoplayState(stopped: boolean): void {
        this._autoplayStopped = stopped;
        if (!this._el.button_autoplay) return;
        const label = stopped ? Language.buttons.autoplay_play : Language.buttons.autoplay_pause;
        if (Browser.mobile) {
            this._el.button_autoplay.setAttribute("aria-label", label);
        } else {
            this._el.button_autoplay.textContent = label;
        }
        this._el.button_autoplay.setAttribute("aria-pressed", String(!stopped));
    }

    /**
     * Repaint every text label from the active language (see `setLanguage`).
     * Icon-only mobile buttons carry text via aria-label instead.
     */
    refreshLabels(): void {
        // panel rows are always text, so the control repaints even where
        // the buttons below go icon-only
        this._layersControl?.refreshLabels();
        if (Browser.mobile) {
            this._renderMobileLabels();
            return;
        }
        this._renderOverviewLabel();
        this._renderBackToStartLabel();
        this.setFullscreenState(this._fullscreenActive);
        this.setAutoplayState(this._autoplayStopped);
        this._renderCollapseLabel(this.collapsed);
    }

    /**
     * Icon-only mobile buttons expose their labels to assistive tech since
     * the visible text is icon glyphs.
     */
    _renderMobileLabels(): void {
        const labels: [string, string][] = [
            ["button_backtostart", Language.buttons.backtostart],
            [
                "button_collapse_toggle",
                this.collapsed
                    ? Language.buttons.uncollapse_toggle
                    : Language.buttons.collapse_toggle,
            ],
            [
                "button_fullscreen",
                this._fullscreenActive
                    ? Language.buttons.exit_fullscreen
                    : Language.buttons.fullscreen,
            ],
            [
                "button_autoplay",
                this._autoplayStopped
                    ? Language.buttons.autoplay_play
                    : Language.buttons.autoplay_pause,
            ],
        ];
        for (const [key, label] of labels) {
            this._el[key]?.setAttribute("aria-label", label);
        }
    }

    /** Hand the layer switcher its state source (StoryMap wires this). */
    setLayersDelegate(delegate: LayersControlDelegate): void {
        this._layersControl?.setDelegate(delegate);
    }

    /** Re-pull the switcher rows (overlays, basemaps, consent state). */
    refreshLayers(): void {
        this._layersControl?.refresh();
    }

    /**
     * Update the progress indicator; no-op when disabled. The `progressbar`
     * option selects the style (slideshow `progressbar`): the classic fill
     * `bar` (default), height variants `block`/`thinblock`, or per-slide
     * `dots`/`squares` buttons that jump to their slide.
     */
    setProgress(current: number, total: number): void {
        const style = this._progressStyle();
        if (style === "off" || !this._el.progress) {
            return;
        }
        if (style === "dots" || style === "squares") {
            this._renderProgressSteps(style, current, total);
            return;
        }
        if (!this._el.progress_fill) {
            return;
        }
        // a single slide (or none) is fully read by definition, but a
        // progressbar over zero slides is invalid ARIA — clear it instead
        if (!(total > 1)) {
            this._el.progress_fill.style.width = "100%";
            this._el.progress.removeAttribute("role");
            this._el.progress.removeAttribute("aria-valuenow");
            this._el.progress.removeAttribute("aria-valuemin");
            this._el.progress.removeAttribute("aria-valuemax");
            this._el.progress.setAttribute("aria-label", "1 / 1");
            return;
        }
        const percent = Math.round((Math.min(current, total - 1) / (total - 1)) * 100);
        this._el.progress_fill.style.width = percent + "%";
        this._el.progress.setAttribute("role", "progressbar");
        this._el.progress.setAttribute("aria-valuenow", String(Math.min(current, total - 1) + 1));
        this._el.progress.setAttribute("aria-valuemin", "1");
        this._el.progress.setAttribute("aria-valuemax", String(total));
        this._el.progress.setAttribute(
            "aria-label",
            `${Math.min(current, total - 1) + 1} / ${total}`,
        );
    }

    /** The resolved progress style: `progressbar` wins, `show_progress` decides the default. */
    _progressStyle(): "off" | "bar" | "dots" | "squares" | "block" | "thinblock" {
        const raw = this.options.progressbar as string | boolean | undefined;
        if (raw === false || raw === "off") return "off";
        if (typeof raw === "string" && (PROGRESSBAR_STYLES as readonly string[]).includes(raw)) {
            return raw as "bar" | "dots" | "squares" | "block" | "thinblock";
        }
        return this.options.show_progress ? "bar" : "off";
    }

    /** Per-slide progress buttons for the `dots`/`squares` styles. */
    _renderProgressSteps(style: "dots" | "squares", current: number, total: number): void {
        const container = this._el.progress;
        if (!(total > 0)) {
            container.innerHTML = "";
            container.removeAttribute("role");
            container.setAttribute("aria-label", "No slides");
            return;
        }
        const built = Number(container.getAttribute("data-steps") ?? "0");
        if (built !== total) {
            container.innerHTML = "";
            container.setAttribute("role", "tablist");
            container.setAttribute("aria-label", `Slides 1 / ${total}`);
            for (let i = 0; i < total; i++) {
                const step = document.createElement("button");
                step.setAttribute("type", "button");
                step.className = `vco-menubar-progress-step vco-menubar-progress-${style}`;
                step.setAttribute("role", "tab");
                step.setAttribute("aria-label", `Slide ${i + 1} / ${total}`);
                step.setAttribute("data-slide", String(i));
                step.addEventListener("click", () => {
                    this.fire("progress_go", { slide: i });
                });
                container.appendChild(step);
            }
            container.setAttribute("data-steps", String(total));
        }
        const steps = container.querySelectorAll("[data-slide]");
        steps.forEach((entry, index) => {
            const el = entry as HTMLElement;
            el.setAttribute("aria-selected", String(index === current));
            el.classList.toggle("vco-active", index === current);
            el.classList.toggle("vco-past", index < current);
        });
    }

    /**
     * Update the route distance display (issue #341); no-op when disabled or
     * before the first reading.
     */
    setDistance(kilometers?: number): void {
        if (!this.options.show_distance || !this._el.distance) {
            return;
        }
        if (kilometers == null || !isFinite(kilometers)) {
            this._el.distance.style.display = "none";
            return;
        }
        this._el.distance.style.display = "";
        const miles = kilometers * 0.621371;
        const locale = currentLocale();
        this._el.distance.textContent =
            kilometers >= 10
                ? `${Math.round(kilometers).toLocaleString(locale)} km · ${Math.round(miles).toLocaleString("en-US")} mi`
                : `${kilometers.toFixed(1)} km · ${miles.toFixed(1)} mi`;
    }

    /*	Update Display
	================================================== */
    updateDisplay(w?: number, h?: number, a?: boolean): void {
        this._updateDisplay(w, h, a);
    }

    /*	Events
	================================================== */

    _onButtonOverview(e: Event) {
        this.fire("overview", e);
    }

    _onButtonBackToStart(e: Event) {
        this.fire("back_to_start", e);
    }

    _onButtonFullscreen(e: Event) {
        this.fire("fullscreen", e);
    }

    _onButtonAutoplay() {
        this.fire("autoplay_toggle");
    }

    _onLayersBasemap(e: { map_type: string }) {
        this.fire("basemapchange", { map_type: e.map_type });
    }

    _onLayersOverlay(e: { index: number; visible: boolean }) {
        this.fire("overlaychange", { index: e.index, visible: e.visible });
    }

    _onButtonCollapseMap(e: Event) {
        if (this.collapsed) {
            this.collapsed = false;
            this.show();
            // Restore from the option, not unconditionally: a story with
            // show_overview false (including every mapless story, which the
            // viewer forces off) would otherwise resurrect a dead overview
            // button on every un-collapse.
            this._el.button_overview.style.display =
                this.options.show_overview === false ? "none" : "inline";
            // `collapsed` is the authoritative signal: `y` is the menubar
            // position, and reading it back as a map height made the
            // un-collapse pass shrink the map to the menubar's pixel height.
            this.fire("collapse", { y: this.options.menubar_default_y, collapsed: false });
            this._renderCollapseLabel(false);
        } else {
            this.collapsed = true;
            this.hide(25);
            this._el.button_overview.style.display = "none";
            this.fire("collapse", { y: 1, collapsed: true });
            this._renderCollapseLabel(true);
        }
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Create Layout

        // Buttons — real <button> elements for keyboard/AT operability
        // (issue #385 wave); class styling carries the look
        this._el.button_overview = Dom.create("button", "vco-menubar-button", this._el.container);
        this._el.button_overview.setAttribute("type", "button");
        DomEvent.addListener(this._el.button_overview, "click", this._onButtonOverview, this);
        if (this.options.show_overview === false) {
            this._el.button_overview.style.display = "none";
        }

        this._el.button_backtostart = Dom.create(
            "button",
            "vco-menubar-button",
            this._el.container,
        );
        this._el.button_backtostart.setAttribute("type", "button");
        DomEvent.addListener(this._el.button_backtostart, "click", this._onButtonBackToStart, this);
        if (this.options.show_back_to_start === false) {
            this._el.button_backtostart.style.display = "none";
        }

        // Fullscreen toggle (hidden via CSS/display when disabled by options)
        this._el.button_fullscreen = Dom.create("button", "vco-menubar-button", this._el.container);
        this._el.button_fullscreen.setAttribute("type", "button");
        DomEvent.addListener(this._el.button_fullscreen, "click", this._onButtonFullscreen, this);
        if (this.options.fullscreen === false) {
            this._el.button_fullscreen.style.display = "none";
        }

        // Autoplay pause/resume toggle (only when the story auto-advances)
        if (typeof this.options.autoplay === "number" && this.options.autoplay > 0) {
            this._el.button_autoplay = Dom.create(
                "button",
                "vco-menubar-button vco-menubar-autoplay",
                this._el.container,
            );
            this._el.button_autoplay.setAttribute("type", "button");
            this._el.button_autoplay.setAttribute("aria-pressed", "true");
            DomEvent.addListener(this._el.button_autoplay, "click", this._onButtonAutoplay, this);
            this.setAutoplayState(false);
        }

        this._el.button_collapse_toggle = Dom.create(
            "button",
            "vco-menubar-button",
            this._el.container,
        );
        this._el.button_collapse_toggle.setAttribute("type", "button");
        DomEvent.addListener(
            this._el.button_collapse_toggle,
            "click",
            this._onButtonCollapseMap,
            this,
        );

        if (this.options.map_as_image) {
            this._el.button_overview.innerHTML = Language.buttons.overview;
        } else {
            this._el.button_overview.innerHTML = Language.buttons.map_overview;
        }

        // Progress indicator (issue #247; dots/squares/block/thinblock via progressbar)
        if (this._progressStyle() !== "off") {
            this._el.progress = Dom.create("span", "vco-menubar-progress", this._el.container);
            const style = this._progressStyle();
            if (style !== "bar") {
                this._el.progress.classList.add(`vco-menubar-progress-${style}`);
            }
            this._el.progress_fill = Dom.create(
                "span",
                "vco-menubar-progress-fill",
                this._el.progress,
            );
        }

        // Route distance display (issue #341)
        if (this.options.show_distance) {
            this._el.distance = Dom.create("span", "vco-menubar-distance", this._el.container);
        }

        if (Browser.mobile) {
            this._el.button_backtostart.innerHTML = "<span class='vco-icon-goback'></span>";
            this._el.button_collapse_toggle.innerHTML = "<span class='vco-icon-arrow-up'></span>";
            this._el.button_fullscreen.innerHTML = "<span class='vco-icon-resize-full'></span>";
            this._el.container.setAttribute("ontouchstart", " ");
        } else {
            this._renderBackToStartLabel();
            this._renderCollapseLabel(this.collapsed);
            this._el.button_fullscreen.innerHTML =
                Language.buttons.fullscreen + " <span class='vco-icon-resize-full'></span>";
        }

        if (this.options.layout === "landscape" || this.options.map_type === "none") {
            // Landscape has no map split to collapse; a mapless story has no
            // map at all, so the toggle would flip its label while nothing
            // on screen changes.
            this._el.button_collapse_toggle.style.display = "none";
        }

        // Layer switcher (opt-in): the control renders nothing until a
        // delegate hands it rows, so consent-denied and mapless stories
        // show no button at all
        if (this.options.show_layers_control) {
            this._layersControl = new LayersControl(this._el.container);
            this._layersControl.on("basemapchange", this._onLayersBasemap, this);
            this._layersControl.on("overlaychange", this._onLayersOverlay, this);
        }
    }

    // Update Display
    _updateDisplay(width?: number, height?: number, animate?: boolean): void {
        if (width) {
            this.options.width = width;
        }
        if (height) {
            this.options.height = height;
        }
    }

    /**
     * Release the button listeners, the progress animation and the element.
     * Called by `StoryMap.dispose()`; the menubar must not be used afterwards.
     */
    dispose(): void {
        const buttons: [string, EventListener][] = [
            ["button_overview", this._onButtonOverview as EventListener],
            ["button_backtostart", this._onButtonBackToStart as EventListener],
            ["button_fullscreen", this._onButtonFullscreen as EventListener],
            ["button_autoplay", this._onButtonAutoplay as EventListener],
            ["button_collapse_toggle", this._onButtonCollapseMap as EventListener],
        ];
        for (const [key, handler] of buttons) {
            const el = this._el[key];
            if (el) {
                DomEvent.removeListener(el, "click", handler, this);
            }
        }
        if (this._layersControl) {
            this._layersControl.off("basemapchange", this._onLayersBasemap, this);
            this._layersControl.off("overlaychange", this._onLayersOverlay, this);
            this._layersControl.dispose();
            this._layersControl = null;
        }
        this._el.container?.getAnimations?.().forEach((a) => a.cancel());
        this._el.container?.remove();
    }
}

const EventedMenuBarBase = Evented<MenuBarEvents, typeof MenuBarBase>(MenuBarBase);

export default class MenuBar extends DomMixed<MenuBarEvents, typeof EventedMenuBarBase>(
    EventedMenuBarBase,
) {
    constructor(...args: ConstructorParameters<typeof MenuBarBase>) {
        super(...args);
    }
}
