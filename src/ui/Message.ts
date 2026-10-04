import { mergeData } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { DomEvent } from "../dom/DomEvent";
import { Language } from "../language/Language";
/*	Message
	Loading / info message component
================================================== */

interface MessageOptions {
    width: number;
    height: number;
    message_class: string;
    message_icon_class: string;
    [key: string]: unknown;
}

export interface MessageEvents {
    clicked: MessageOptions;
    loaded: Record<string, unknown>;
    added: Record<string, unknown>;
    removed: Record<string, unknown>;
}

class MessageBase {
    declare "_el": Record<string, HTMLElement>;
    declare "options": MessageOptions;
    "data": Record<string, unknown>;
    declare "animator": Record<string, unknown>;
    declare "fire": EventedInstance<MessageEvents>["fire"];

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

        this.data = {};

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
        // the container dismisses on click, so it is a button to assistive
        // tech too; its name tracks the message text
        const label = this._el.message.textContent?.trim() ?? "";
        if (label !== "") {
            this._el.container.setAttribute("aria-label", label);
        }
    }

    /*	Events
	================================================== */

    _onMouseClick() {
        this.fire("clicked", this.options);
    }

    _onKeyDown(e: Event) {
        const key = (e as KeyboardEvent).key;
        if (key === "Enter" || key === " " || key === "Spacebar") {
            e.preventDefault();
            this._onMouseClick();
        }
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Create Layout
        // Dismissable by click and keyboard alike (see _onKeyDown): the
        // fixed hook below carries the focus ring, whatever message_class
        // the host configured.
        this._el.container.classList.add("vco-message-dismiss");
        this._el.container.setAttribute("role", "button");
        this._el.container.setAttribute("tabindex", "0");
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
        DomEvent.addListener(this._el.container, "keydown", this._onKeyDown, this);
    }

    /**
     * Release the listeners and drop the element. Called by
     * `StorySlider.dispose()`; the message must not be used afterwards.
     */
    dispose() {
        DomEvent.removeListener(this._el.container, "click", this._onMouseClick, this);
        DomEvent.removeListener(this._el.container, "keydown", this._onKeyDown, this);
        this._el.container.remove();
    }
}

const EventedMessageBase = Evented<MessageEvents, typeof MessageBase>(MessageBase);

export default class Message extends DomMixed<MessageEvents, typeof EventedMessageBase>(
    EventedMessageBase,
) {
    constructor(...args: ConstructorParameters<typeof MessageBase>) {
        super(...args);
    }
}
