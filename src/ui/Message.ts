import { classMixin, mergeData } from "../core/Util";
import Dom from "../dom/Dom";
import { DomEvent } from "../dom/DomEvent";
import Events from "../core/Events";
import DomMixins from "../dom/DomMixins";
import { Language } from "../language/Language";
/*	VCO.SizeBar
	Draggable component to control size
================================================== */

interface MessageOptions {
    width: number;
    height: number;
    message_class: string;
    message_icon_class: string;
    [key: string]: unknown;
}

interface Evented {
    fire: (type: string, data?: unknown, target?: unknown) => unknown;
    on: (type: string, fn: unknown, context?: unknown) => unknown;
    hasEventListeners: (type: string) => boolean;
}

export default class Message {
    declare "_el": Record<string, HTMLElement>;
    declare "options": MessageOptions;
    declare "data": Record<string, unknown>;
    declare "animator": Record<string, unknown>;
    declare "fire": Evented["fire"];

    //includes: [VCO.Events, VCO.DomMixins],

    //_el: {},

    /*	Constructor
	================================================== */
    constructor(
        data?: Record<string, unknown>,
        options?: Record<string, unknown>,
        add_to_container?: HTMLElement,
    ) {
        // DOM ELEMENTS
        this._el = {
            parent: {},
            container: {},
            message_container: {},
            loading_icon: {},
            message: {},
        } as unknown as Record<string, HTMLElement>;

        //Options
        this.options = {
            width: 600,
            height: 600,
            message_class: "vco-message",
            message_icon_class: "vco-loading-icon",
        };

        // Merge Data and Options
        mergeData(this.data, data);
        mergeData(this.options, options);

        this._el.container = Dom.create("div", this.options.message_class);

        if (add_to_container) {
            add_to_container.appendChild(this._el.container);
            this._el.parent = add_to_container;
        }

        // Animation
        this.animator = {};

        this._initLayout();
        this._initEvents();
    }

    /*	Public
	================================================== */
    updateMessage(t: string): void {
        this._updateMessage(t);
    }

    /*	Update Display
	================================================== */
    updateDisplay(w?: number, h?: number): void {
        this._updateDisplay(w, h);
    }

    _updateMessage(t?: string): void {
        if (!t) {
            if (Language) {
                this._el.message.innerHTML = Language.messages.loading;
            } else {
                this._el.message.innerHTML = "Loading";
            }
        } else {
            this._el.message.innerHTML = t;
        }
    }

    /*	Events
	================================================== */

    _onMouseClick() {
        this.fire("clicked", this.options);
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Create Layout
        this._el.message_container = Dom.create("div", "vco-message-container", this._el.container);
        this._el.loading_icon = Dom.create(
            "div",
            this.options.message_icon_class,
            this._el.message_container,
        );
        this._el.message = Dom.create("div", "vco-message-content", this._el.message_container);

        this._updateMessage();
    }

    _initEvents() {
        DomEvent.addListener(this._el.container, "click", this._onMouseClick, this);
    }

    // Update Display
    _updateDisplay(width?: number, height?: number, animate?: boolean): void {}
}

classMixin(Message, Events, DomMixins);
