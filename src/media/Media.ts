import { mergeData, ratio, clearTimer } from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import Message from "../ui/Message";
import { Browser } from "../core/Browser";
import { MediaState, StorymapSlideMedia } from "../types";
import { Language } from "../language/Language";
import { consentManagerOf, consentMessage } from "../storymap/Consent";
import { validateWebURL, sanitizeSlideText } from "./EmbedUtil";
import { loadJS } from "../core/Load";
/*	VCO.Media
	Main media template for media assets.
	Takes a data object and populates a dom object
================================================== */

/**
 * The icon glyph each media type shows in its error state.
 *
 * The icon font does not carry a glyph for every registered type, and the
 * class used to be built straight from `media_type`, so dailymotion, audio,
 * googledocs, iframe, documentcloud, juxtapose and website rendered an empty
 * box next to the error text. The mapping is explicit rather than derived, so
 * a type added later falls back to a real glyph instead of a blank one —
 * `tests/embed-util-media.test.ts` checks the whole table against the font.
 */
const LOAD_ERROR_ICONS: Record<string, string> = {
    youtube: "youtube",
    vimeo: "vimeo",
    dailymotion: "video",
    soundcloud: "soundcloud",
    twitter: "twitter",
    flickr: "flickr",
    image: "image",
    video: "video",
    audio: "music",
    googledocs: "doc",
    wikipedia: "wikipedia",
    iframe: "web",
    facebook: "facebook",
    documentcloud: "doc",
    juxtapose: "image",
    blockquote: "blockquote",
    website: "web",
};

const GENERIC_LOAD_ERROR_ICON = "web";

export function loadErrorIcon(media_type: unknown): string {
    const type = typeof media_type === "string" ? media_type : "";
    return LOAD_ERROR_ICONS[type] ?? GENERIC_LOAD_ERROR_ICON;
}

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
    uniqueid?: string | null;
    link?: string | null;
    link_target?: string | null;
    [key: string]: unknown;
}

/**
 * The media element cache.
 *
 * `content_item`, `content_link`, `caption` and `credit` are only created
 * once `_loadMedia()` / `showMeta()` have run, so they start out null rather
 * than as an empty element — that is what the "did the load happen?" check is
 * for, and pretending otherwise with `{} as HTMLElement` is what let the
 * consent-denied path dereference `undefined.style`.
 */
type MediaElements = {
    container: HTMLElement;
    content_container: HTMLElement;
    content: HTMLElement;
    content_item: HTMLElement | null;
    content_link: HTMLElement | null;
    source_item: HTMLSourceElement | null;
    caption: HTMLElement | null;
    credit: HTMLElement | null;
    parent: HTMLElement;
    link: HTMLElement | null;
};

export class MediaBase {
    declare "_el": MediaElements;
    declare "player": unknown;
    declare "timer": ReturnType<typeof setTimeout> | null;
    declare "load_timer": ReturnType<typeof setTimeout> | null;
    declare "load_controller": AbortController | null;
    declare "message": Message | null;
    declare "media_id": unknown;
    declare "_state": MediaState;
    declare "data": MediaData;
    declare "options": MediaOptions;
    declare "animator": unknown;
    declare "_media": unknown;
    declare "fire": EventedInstance["fire"];

    /*	Constructor
	================================================== */
    constructor(data: MediaData, options?: MediaOptions, add_to_container?: HTMLElement) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            content_container: {} as HTMLElement,
            content: {} as HTMLElement,
            content_item: null,
            content_link: null,
            source_item: null,
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
        this.load_controller = null;

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

    async loadMedia() {
        if (!this._state.loaded) {
            const manager = consentManagerOf(this.options);
            if (this.options.consent_required && manager && this.options.media_type) {
                // GDPR consent mode: ask before loading anything from this
                // external service
                const service = this.options.media_type as string;
                let host = "";
                try {
                    host = new URL((this.data as { url?: string })?.url ?? "").host;
                } catch {
                    // keep the empty host
                }
                // content_item is only created by the (deferred) media load —
                // render the ask into the existing content container
                const target = (this._el.content_container ?? this._el.container) as HTMLElement;
                if (await manager.request(service, host, target)) {
                    this._beginLoad();
                } else {
                    this._showBlocked();
                }
                return;
            }
            this._beginLoad();
        }
    }

    _beginLoad() {
        // a sync throw inside a media type's _loadMedia (e.g. an unparseable
        // media URL) must not escape the timer callback as an uncaught error
        this.load_timer = setTimeout(() => {
            try {
                this._loadMedia();
                this._state.loaded = true;
                this._updateDisplay();
            } catch (e) {
                console.log("Error loading media for ", this._media);
                console.log(e);
                this.loadErrorDisplay("Error loading media.");
            }
        }, 1200);
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

    /**
     * Look up a UI string for the active language, falling back to the
     * English default (which `setLanguage` already merges in) and finally to
     * the key itself, so a missing translation degrades to something visible
     * rather than "undefined".
     */
    _(key: string): string {
        return Language.messages[key] ?? key;
    }

    /** Show the loading overlay for this media item. */
    loadingMessage(): void {
        this.message?.updateMessage(this._("loading") + " " + this.options.media_name);
    }

    updateMediaDisplay(layout?: string) {
        // `content_item` only exists once a media type's `_loadMedia()` has
        // run. It stays null when a consent decision blocked the load, so the
        // sizing below has to be skipped rather than dereference a
        // placeholder — that was the crash on the denied path.
        const content_item = this._el.content_item;
        if (!this._state.loaded || !content_item) {
            return;
        }

        this._updateMediaDisplay(layout);

        if (!Browser.mobile && layout !== "portrait") {
            content_item.style.maxHeight = Number(this.options.height ?? 0) / 2 + "px";
        }

        if (layout === "portrait") {
            content_item.style.maxHeight = "none";
        }
        if (this._state.media_loaded) {
            const width = content_item.offsetWidth + "px";
            if (this._el.credit) {
                this._el.credit.style.width = width;
            }
            if (this._el.caption) {
                this._el.caption.style.width = width;
            }
        }
    }

    /**
     * Media Specific
	================================================== */
    _loadMedia() {}

    _updateMediaDisplay(l?: string) {
        //this._el.content_item.style.maxHeight = (this.options.height - this.options.credit_height - this.options.caption_height - 16) + "px";
    }

    /** Size the media box to the `height` option, in pixels. */
    _sizeContentItemToOptionHeight(): void {
        if (this._el.content_item) {
            this._el.content_item.style.height = Number(this.options.height ?? 0) + "px";
        }
    }

    /**
     * Size the media box to a 16:9 box matching its current width — the
     * aspect ratio every video provider embeds at.
     */
    _sizeContentItemTo16x9(): void {
        const item = this._el.content_item;
        if (item) {
            item.style.height = ratio.r16_9({ w: item.offsetWidth }) + "px";
        }
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
        // Cancel a load that hasn't started yet (navigated away within the
        // load delay): avoids building iframes and injecting scripts for a
        // slide the visitor already skipped past
        if (!this._state.loaded && this.load_timer) {
            clearTimer(this.load_timer);
            this.load_timer = null;
            this.load_timer = null;
        }
        // Abort an in-flight external script load, if any
        if (this.load_controller) {
            this.load_controller.abort();
            this.load_controller = null;
        }
        this._stopMedia();
    }

    /**
     * Load an external script for this media, abortable via stopMedia().
     * Rejects with AbortError when the load is cancelled.
     */
    async loadScript(url: string): Promise<void> {
        this.load_controller?.abort();
        const controller = new AbortController();
        this.load_controller = controller;
        try {
            await loadJS(url, { signal: controller.signal });
        } finally {
            if (this.load_controller === controller) {
                this.load_controller = null;
            }
        }
    }

    loadErrorDisplay(message: string) {
        if (this._el.content_item && this._el.content_item.parentNode === this._el.content) {
            this._el.content.removeChild(this._el.content_item);
        }
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-loaderror",
            this._el.content,
        );
        // The icon font has no glyph for every media type (dailymotion, audio,
        // googledocs, iframe, documentcloud, juxtapose and website had none),
        // and the class was built by string concatenation, so those error
        // states rendered an empty box. Map the missing ones to a glyph that
        // exists, and fall back to a generic "web" icon for anything added
        // later.
        this._el.content_item.appendChild(
            Dom.create("div", `vco-icon-${loadErrorIcon(this.options.media_type)}`),
        );
        const text = Dom.create("p", "");
        text.appendChild(document.createTextNode(message));
        this._el.content_item.appendChild(text);

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
        const width = (this._el.content_item?.offsetWidth ?? 0) + "px";
        if (this._el.credit) {
            this._el.credit.style.width = width;
        }
        if (this._el.caption) {
            this._el.caption.style.width = width;
        }
    }

    /** Render the media credit and caption, if the slide has them. */
    showMeta(): void {
        this._state.show_meta = true;
        // Credit and caption are author-supplied strings that may legitimately
        // contain formatting (they are documented as HTML), so they go through
        // the same sanitizer as the slide text rather than straight to
        // innerHTML — the JSON is untrusted input, and these were the two
        // easiest stored-XSS sinks in the viewer.
        const credit = this._credit();
        if (credit && credit !== "" && !this._el.credit) {
            this._el.credit = Dom.create("div", "vco-credit", this._el.content_container);
            this._el.credit.appendChild(sanitizeSlideText(credit));
            this.options.credit_height = this._el.credit.offsetHeight;
        }

        // Caption
        const caption = this._caption();
        if (caption && caption !== "" && !this._el.caption) {
            this._el.caption = Dom.create("div", "vco-caption", this._el.content_container);
            this._el.caption.appendChild(sanitizeSlideText(caption));
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
    /** The media URL, normalised to a string. */
    _url(): string {
        return typeof this.data.url === "string" ? this.data.url : "";
    }

    /** The media caption, or null when the slide has none. */
    _caption(): string | null {
        return typeof this.data.caption === "string" ? this.data.caption : null;
    }

    /** The media credit, or null when the slide has none. */
    _credit(): string | null {
        return typeof this.data.credit === "string" ? this.data.credit : null;
    }

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
        // The link target comes from the storymap JSON, so it has to pass the
        // same protocol check as every other author-supplied URL — otherwise a
        // `javascript:` href is a click-through XSS. A rejected link falls
        // through to the unlinked layout below rather than rendering a
        // dead anchor.
        // (`_el.content` starts as a truthy `{}` placeholder, so the branch is
        // tracked with a local flag rather than a truthiness test.)
        const raw_link = this.data.link;
        const href = typeof raw_link === "string" ? validateWebURL(raw_link) : null;
        if (href) {
            this._el.link = Dom.create("a", "vco-media-link", this._el.content_container);
            const link = this._el.link as HTMLAnchorElement;
            link.href = href;
            if (this.data.link_target && this.data.link_target !== "") {
                link.target = this.data.link_target;
            } else {
                link.target = "_blank";
            }
            if (link.target === "_blank") {
                // rel=noopener so the opened page cannot reach back through
                // window.opener
                link.rel = "noopener noreferrer";
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
