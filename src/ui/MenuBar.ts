import { classMixin, mergeData } from "../core/Util";
import Dom from "../dom/Dom";
import Events from "../core/Events";
import Ease from "../animation/Ease";

import DomMixins from "../dom/DomMixins";
import { DomEvent } from "../dom/DomEvent";
import { Browser } from "../core/Browser";
import { Language } from "../language/Language";

/*	MenuBar
	Draggable component to control size
================================================== */

interface MenuBarOptions {
    width: number;
    height: number;
    duration: number;
    ease: unknown;
    menubar_default_y: number;
    [key: string]: unknown;
}

interface Evented {
    fire: (type: string, data?: unknown, target?: unknown) => unknown;
    on: (type: string, fn: unknown, context?: unknown) => unknown;
    hasEventListeners: (type: string) => boolean;
}

export default class MenuBar {
    declare "_el": Record<string, HTMLElement>;
    declare "collapsed": boolean;
    declare "options": MenuBarOptions;
    declare "animator": Record<string, unknown>;
    declare "fire": Evented["fire"];

    //includes: [Events, DomMixins],

    /*	Constructor
	================================================== */
    constructor(elem, parent_elem, options) {
        // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            button_overview: {},
            button_backtostart: {},
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
            this._el.container = Dom.get(elem);
        }

        if (parent_elem) {
            this._el.parent = parent_elem;
        }

        //Options
        this.options = {
            width: 600,
            height: 600,
            duration: 1000,
            ease: Ease.easeInOutQuint,
            menubar_default_y: 0,
        };

        // Animation
        this.animator = {};

        // Merge Data and Options
        mergeData(this.options, options);

        this._initLayout();
        this._initEvents();
    }

    /*	Public
	================================================== */
    show(d?) {
        let _duration = this.options.duration;
        if (d) {
            _duration = d;
        }
        /*
		this.animator = Animate(this._el.container, {
			top: 		this.options.menubar_default_y + "px",
			duration: 	duration,
			easing: 	Ease.easeOutStrong
		});
		*/
    }

    hide(top) {
        /*
		this.animator = Animate(this._el.container, {
			top: 		top,
			duration: 	this.options.duration,
			easing: 	Ease.easeOutStrong
		});
		*/
    }

    setSticky(y) {
        this.options.menubar_default_y = y;
    }

    /*	Color
	================================================== */
    setColor(inverted) {
        if (inverted) {
            this._el.container.className = "vco-menubar vco-menubar-inverted";
        } else {
            this._el.container.className = "vco-menubar";
        }
    }

    /*	Update Display
	================================================== */
    updateDisplay(w?, h?, a?) {
        this._updateDisplay(w, h, a);
    }

    /*	Events
	================================================== */

    _onButtonOverview(e) {
        this.fire("overview", e);
    }

    _onButtonBackToStart(e) {
        this.fire("back_to_start", e);
    }

    _onButtonCollapseMap(e) {
        if (this.collapsed) {
            this.collapsed = false;
            this.show();
            this._el.button_overview.style.display = "inline";
            this.fire("collapse", { y: this.options.menubar_default_y });
            if (Browser.mobile) {
                this._el.button_collapse_toggle.innerHTML =
                    "<span class='vco-icon-arrow-up'></span>";
            } else {
                this._el.button_collapse_toggle.innerHTML =
                    Language.buttons.collapse_toggle + "<span class='vco-icon-arrow-up'></span>";
            }
        } else {
            this.collapsed = true;
            this.hide(25);
            this._el.button_overview.style.display = "none";
            this.fire("collapse", { y: 1 });
            if (Browser.mobile) {
                this._el.button_collapse_toggle.innerHTML =
                    "<span class='vco-icon-arrow-down'></span>";
            } else {
                this._el.button_collapse_toggle.innerHTML =
                    Language.buttons.uncollapse_toggle +
                    "<span class='vco-icon-arrow-down'></span>";
            }
        }
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Create Layout

        // Buttons
        this._el.button_overview = Dom.create("span", "vco-menubar-button", this._el.container);
        DomEvent.addListener(this._el.button_overview, "click", this._onButtonOverview, this);

        this._el.button_backtostart = Dom.create("span", "vco-menubar-button", this._el.container);
        DomEvent.addListener(this._el.button_backtostart, "click", this._onButtonBackToStart, this);

        this._el.button_collapse_toggle = Dom.create(
            "span",
            "vco-menubar-button",
            this._el.container,
        );
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

        if (Browser.mobile) {
            this._el.button_backtostart.innerHTML = "<span class='vco-icon-goback'></span>";
            this._el.button_collapse_toggle.innerHTML = "<span class='vco-icon-arrow-up'></span>";
            this._el.container.setAttribute("ontouchstart", " ");
        } else {
            this._el.button_backtostart.innerHTML =
                Language.buttons.backtostart + " <span class='vco-icon-goback'></span>";
            this._el.button_collapse_toggle.innerHTML =
                Language.buttons.collapse_toggle + "<span class='vco-icon-arrow-up'></span>";
        }

        if (this.options.layout === "landscape") {
            this._el.button_collapse_toggle.style.display = "none";
        }
    }

    _initEvents() {}

    // Update Display
    _updateDisplay(width?, height?, animate?) {
        if (width) {
            this.options.width = width;
        }
        if (height) {
            this.options.height = height;
        }
    }
}

classMixin(MenuBar, Events, DomMixins);
