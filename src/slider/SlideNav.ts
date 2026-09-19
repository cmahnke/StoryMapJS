import { classMixin, mergeData } from "../core/Util";
import Dom from "../dom/Dom";
import DomMixins from "../dom/DomMixins";
import Events from "../core/Events";
import Animate from "morpheus";
import { DomEvent } from "../dom/DomEvent";
import { Browser } from "../core/Browser";
import { AnimateOptions, AnimationHandle } from "../types";
/*	SlideNav
	Navigation for Slideshows
================================================== */
// TODO null out data

interface SlideNavData {
    title: string;
    description: string;
    date?: string;
    [key: string]: unknown;
}

interface SlideNavOptions {
    direction: string;
    [key: string]: unknown;
}

export default class SlideNav {
    declare "_el": Record<string, HTMLElement>;
    declare "mediatype": unknown;
    declare "data": SlideNavData;
    declare "options": SlideNavOptions;
    declare "animator": AnimationHandle | null;
    declare "animator_position": AnimationHandle | null;
    declare "fire": (type: string, data?: unknown) => unknown;
    declare "on": (type: string, fn: unknown, context?: unknown) => unknown;
    declare "off": (type: string, fn: unknown, context?: unknown) => unknown;
    declare "addTo": (container: HTMLElement) => void;
    declare "show": (animate?: unknown) => void;
    declare "hide": (animate?: unknown) => void;
    declare "setPosition": (pos: Record<string, number>, el?: HTMLElement) => void;

    //includes: [VCO.Events, VCO.DomMixins],

    //_el: {},

    /*	Constructor
	================================================== */
    constructor(
        data?: Partial<SlideNavData>,
        options?: Partial<SlideNavOptions>,
        add_to_container?: HTMLElement,
    ) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            content_container: {} as HTMLElement,
            icon: {} as HTMLElement,
            title: {} as HTMLElement,
            description: {} as HTMLElement,
        };

        // Media Type
        this.mediatype = {};

        // Data
        this.data = {
            title: "Navigation",
            description: "Description",
        };

        //Options
        this.options = {
            direction: "previous",
        };

        this.animator = null;
        this.animator_position = null;

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        this._el.container = Dom.create("div", "vco-slidenav-" + this.options.direction);

        if (Browser.mobile) {
            this._el.container.setAttribute("ontouchstart", " ");
        }

        this._initLayout();
        this._initEvents();

        if (add_to_container) {
            add_to_container.appendChild(this._el.container);
        }
    }

    /*	Update Content
	================================================== */
    update(d?: Partial<SlideNavData>) {
        this._update(d);
    }

    /*	Color
	================================================== */
    setColor(inverted: boolean) {
        if (inverted) {
            this._el.content_container.className =
                "vco-slidenav-content-container vco-slidenav-inverted";
        } else {
            this._el.content_container.className = "vco-slidenav-content-container";
        }
    }

    /*	Position
	================================================== */
    updatePosition(
        pos: Record<string, number | string>,
        use_percent: boolean,
        duration: number,
        ease: unknown,
        start_value: number,
        return_to_default: boolean,
    ) {
        const ani: AnimateOptions = {
            duration: duration,
            easing: ease,
            complete: () => {
                this._onUpdatePositionComplete(return_to_default);
            },
        };
        const _start_value = start_value;

        for (const name in pos) {
            if (Object.hasOwn(pos, name)) {
                if (use_percent) {
                    ani[name] = pos[name] + "%";
                } else {
                    ani[name] = pos[name] + "px";
                }
            }
        }

        if (this.animator_position) {
            this.animator_position.stop();
        }

        let prop_to_set: string;
        if (ani.right) {
            prop_to_set = "right";
        } else {
            prop_to_set = "left";
        }
        if (use_percent) {
            (this._el.container.style as unknown as Record<string, string>)[prop_to_set] =
                _start_value + "%";
        } else {
            (this._el.container.style as unknown as Record<string, string>)[prop_to_set] =
                _start_value + "px";
        }

        this.animator_position = Animate(this._el.container, ani);
    }

    _onUpdatePositionComplete(return_to_default: boolean) {
        if (return_to_default) {
            this._el.container.style.left = "";
            this._el.container.style.right = "";
        }
    }

    /*	Events
	================================================== */
    _onMouseClick() {
        this.fire("clicked", this.options);
    }

    /*	Private Methods
	================================================== */
    _update(d?: Partial<SlideNavData>) {
        // update data
        this.data = mergeData(this.data, d);

        // Title
        if (this.data.title !== "") {
            this._el.title.innerHTML = this.data.title;
        }

        // Date
        if (this.data.date !== "") {
            this._el.description.innerHTML = this.data.description;
        }
    }

    _initLayout() {
        // Create Layout
        this._el.content_container = Dom.create(
            "div",
            "vco-slidenav-content-container",
            this._el.container,
        );
        this._el.icon = Dom.create("div", "vco-slidenav-icon", this._el.content_container);
        this._el.title = Dom.create("div", "vco-slidenav-title", this._el.content_container);
        this._el.description = Dom.create(
            "div",
            "vco-slidenav-description",
            this._el.content_container,
        );

        this._el.icon.innerHTML = "&nbsp;";

        this._update();
    }

    _initEvents() {
        DomEvent.addListener(this._el.container, "click", this._onMouseClick, this);
    }
}

classMixin(SlideNav, Events, DomMixins);
