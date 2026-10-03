import { mergeData } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { easeInOutQuint } from "../animation/easings";

import { DomEvent } from "../dom/DomEvent";
import { Browser } from "../core/Browser";
import { Language, currentLocale } from "../language/Language";

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
    collapse: { y: number; collapsed: boolean };
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
     * Repaint every text label from the active language (see `setLanguage`).
     * Icon-only mobile buttons carry no text and are left untouched.
     */
    refreshLabels(): void {
        if (Browser.mobile) {
            return;
        }
        this._renderOverviewLabel();
        this._renderBackToStartLabel();
        this.setFullscreenState(this._fullscreenActive);
        this._renderCollapseLabel(this.collapsed);
    }

    /**
     * Update the progress indicator (issue #247); no-op when disabled.
     */
    setProgress(current: number, total: number): void {
        if (!this.options.show_progress || !this._el.progress_fill) {
            return;
        }
        const percent = total > 1 ? Math.round((current / (total - 1)) * 100) : 100;
        this._el.progress_fill.style.width = percent + "%";
        this._el.progress.setAttribute("role", "progressbar");
        this._el.progress.setAttribute("aria-valuenow", String(current + 1));
        this._el.progress.setAttribute("aria-valuemin", "1");
        this._el.progress.setAttribute("aria-valuemax", String(total));
        this._el.progress.setAttribute("aria-label", `${current + 1} / ${total}`);
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

        // Progress indicator (issue #247)
        if (this.options.show_progress) {
            this._el.progress = Dom.create("span", "vco-menubar-progress", this._el.container);
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
            ["button_collapse_toggle", this._onButtonCollapseMap as EventListener],
        ];
        for (const [key, handler] of buttons) {
            const el = this._el[key];
            if (el) {
                DomEvent.removeListener(el, "click", handler, this);
            }
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
