import { mergeData } from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import Message from "../ui/Message";
import { Browser } from "../core/Browser";
import { MediaState, StorymapSlideMedia } from "../types";
import { consentManagerOf, consentMessage } from "../storymap/Consent";
/*	VCO.Media
	Main media template for media assets.
	Takes a data object and populates a dom object
================================================== */
// TODO add link

/*	Options for Media and its subclasses: the fields Media itself sets
	or reads. Everything else merged in via mergeData is absorbed by the
	index signature. */
export interface MediaOptions {
    width?: number;
    height?: number;
    layout?: string;
    media_name?: string;
    media_type?: string;
    credit_height?: number;
    caption_height?: number;
    api_key_flickr?: string;
    [key: string]: unknown;
}

/*	Data for media assets: the shared exchange format plus the link
	fields the base layout renders. */
export interface MediaData extends StorymapSlideMedia {
    uniqueid?: string;
    link?: string;
    link_target?: string;
    [key: string]: unknown;
}

export class MediaBase {
    declare "_el": Record<string, HTMLElement>;
    declare "player": unknown;
    declare "timer": ReturnType<typeof setTimeout>;
    declare "load_timer": ReturnType<typeof setTimeout>;
    declare "message": Message;
    declare "media_id": unknown;
    declare "_state": MediaState;
    declare "data": MediaData;
    declare "options": MediaOptions;
    declare "animator": unknown;
    declare "_media": unknown;
    declare "_": (key: string) => string;
    declare "fire": EventedInstance["fire"];

    //_el: {},

    /*	Constructor
	================================================== */
    constructor(data: MediaData, options?: MediaOptions, add_to_container?: HTMLElement) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            content_container: {} as HTMLElement,
            content: {} as HTMLElement,
            content_item: {} as HTMLElement,
            content_link: {} as HTMLElement,
            caption: null,
            credit: null,
            parent: {} as HTMLElement,
            link: null,
        };

        // Player (If Needed)
        this.player = null;

        // Timer (If Needed)
        this.timer = null;
        this.load_timer = null;

        // Message
        this.message = null;

        // Media ID
        this.media_id = null;

        // State
        this._state = {
            loaded: false,
            show_meta: false,
            media_loaded: false,
        };

        // Data
        this.data = {
            uniqueid: null,
            url: null,
            credit: null,
            caption: null,
            link: null,
            link_target: null,
        };

        //Options
        this.options = {
            api_key_flickr: "", // no bundled key: pass api_key_flickr in the options
            credit_height: 0,
            caption_height: 0,
        };

        this.animator = {};

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        this._el.container = Dom.create("div", "vco-media");

        if (this.data.uniqueid) {
            this._el.container.id = this.data.uniqueid;
        }

        this._initLayout();

        if (add_to_container) {
            add_to_container.appendChild(this._el.container);
            this._el.parent = add_to_container;
        }
    }

    loadMedia() {
        if (!this._state.loaded) {
            const manager = consentManagerOf(this.options);
            if (this.options.consent_required && manager && this.options.media_type) {
                // GDPR consent mode: ask before loading anything from this
                // external service
                const service = this.options.media_type as string;
                let host = "";
                try {
                    host = new URL((this._media as { url?: string })?.url ?? "").host;
                } catch {
                    // keep the empty host
                }
                // content_item is only created by the (deferred) media load —
                // render the ask into the existing content container
                const target = (this._el.content_container ?? this._el.container) as HTMLElement;
                manager.request(service, host, target).then((allowed) => {
                    if (allowed) {
                        this._beginLoad();
                    } else {
                        this._showBlocked();
                    }
                });
                return;
            }
            this._beginLoad();
        }
    }

    _beginLoad() {
        try {
            this.load_timer = setTimeout(() => {
                this._loadMedia();
                this._state.loaded = true;
                this._updateDisplay();
            }, 1200);
        } catch (e) {
            console.log("Error loading media for ", this._media);
            console.log(e);
        }

        //this._state.loaded = true;
    }

    _showBlocked() {
        // denied: show a placeholder instead of the media
        const target = (this._el.content_container ?? this._el.container) as HTMLElement;
        const blocked = document.createElement("div");
        blocked.className = "vco-consent-blocked";
        blocked.textContent = (
            consentMessage("consent_blocked", "Content from {service} is blocked.") as string
        ).replace("{service}", (this.options.media_type as string) ?? "");
        target.append(blocked);
        this.onLoaded(true);
    }

    loadingMessage() {
        this.message.updateMessage(this._("loading") + " " + this.options.media_name);
    }

    updateMediaDisplay(layout?: string) {
        if (this._state.loaded) {
            this._updateMediaDisplay(layout);

            if (!Browser.mobile && layout !== "portrait") {
                this._el.content_item.style.maxHeight = this.options.height / 2 + "px";
            }

            if (this._state.media_loaded) {
                if (this._el.credit) {
                    this._el.credit.style.width = "auto";
                }
                if (this._el.caption) {
                    this._el.caption.style.width = "auto";
                }
            }

            if (layout === "portrait") {
                this._el.content_item.style.maxHeight = "none";
            }
            if (this._state.media_loaded) {
                if (this._el.credit) {
                    this._el.credit.style.width = this._el.content_item.offsetWidth + "px";
                }
                if (this._el.caption) {
                    this._el.caption.style.width = this._el.content_item.offsetWidth + "px";
                }
            }
        }
    }

    /*	Media Specific
	================================================== */
    _loadMedia() {}

    _updateMediaDisplay(l?: string) {
        //this._el.content_item.style.maxHeight = (this.options.height - this.options.credit_height - this.options.caption_height - 16) + "px";
    }

    /*	Public
	================================================== */
    show() {}

    hide() {}

    addTo(container: HTMLElement) {
        container.appendChild(this._el.container);
        this.onAdd();
    }

    removeFrom(container: HTMLElement) {
        container.removeChild(this._el.container);
        this.onRemove();
    }

    // Update Display
    updateDisplay(w?: number, h?: number, l?: string) {
        this._updateDisplay(w, h, l);
    }

    stopMedia() {
        this._stopMedia();
    }

    loadErrorDisplay(message: string) {
        this._el.content.removeChild(this._el.content_item);
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-loaderror",
            this._el.content,
        );
        this._el.content_item.innerHTML =
            "<div class='vco-icon-" + this.options.media_type + "'></div><p>" + message + "</p>";

        // After Loaded
        this.onLoaded(true);
    }

    /*	Events
	================================================== */
    onLoaded(error?: boolean) {
        this._state.loaded = true;
        this.fire("loaded", this.data);
        if (this.message) {
            this.message.hide();
        }
        if (!error) {
            this.showMeta();
        }
        this.updateDisplay();
    }

    onMediaLoaded(e?: unknown) {
        this._state.media_loaded = true;
        this.fire("media_loaded", this.data);
        if (this._el.credit) {
            this._el.credit.style.width = this._el.content_item.offsetWidth + "px";
        }
        if (this._el.caption) {
            this._el.caption.style.width = this._el.content_item.offsetWidth + "px";
        }
    }

    showMeta(credit?: unknown, caption?: unknown) {
        this._state.show_meta = true;
        // Credit
        if (this.data.credit && this.data.credit !== "" && !this._el.credit) {
            this._el.credit = Dom.create("div", "vco-credit", this._el.content_container);
            this._el.credit.innerHTML = this.data.credit;
            this.options.credit_height = this._el.credit.offsetHeight;
        }

        // Caption
        if (this.data.caption && this.data.caption !== "" && !this._el.caption) {
            this._el.caption = Dom.create("div", "vco-caption", this._el.content_container);
            this._el.caption.innerHTML = this.data.caption;
            this.options.caption_height = this._el.caption.offsetHeight;
        }
    }

    onAdd() {
        this.fire("added", this.data);
    }

    onRemove() {
        this.fire("removed", this.data);
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Message
        this.message = new Message({}, this.options);
        this.message.addTo(this._el.container);

        // Create Layout
        this._el.content_container = Dom.create(
            "div",
            "vco-media-content-container",
            this._el.container,
        );

        // Link
        if (this.data.link && this.data.link !== "") {
            this._el.link = Dom.create("a", "vco-media-link", this._el.content_container);
            const link = this._el.link as HTMLAnchorElement;
            link.href = this.data.link;
            if (this.data.link_target && this.data.link_target !== "") {
                link.target = this.data.link_target;
            } else {
                link.target = "_blank";
            }

            this._el.content = Dom.create("div", "vco-media-content", this._el.link);
        } else {
            this._el.content = Dom.create("div", "vco-media-content", this._el.content_container);
        }
    }

    // Update Display
    _updateDisplay(w?: number, h?: number, l?: string) {
        if (w) {
            this.options.width = w;
        }
        if (h) {
            this.options.height = h;
        }

        if (l) {
            this.options.layout = l;
        }

        if (this._el.credit) {
            this.options.credit_height = this._el.credit.offsetHeight;
        }
        if (this._el.caption) {
            this.options.caption_height = this._el.caption.offsetHeight + 5;
        }

        this.updateMediaDisplay(this.options.layout);
    }

    _stopMedia() {}
}

export class Media extends Evented(MediaBase) {
    constructor(...args: ConstructorParameters<typeof MediaBase>) {
        super(...args);
    }
}
