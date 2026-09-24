import { mergeData } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import { DomEvent } from "../dom/DomEvent";
import Dom from "../dom/Dom";
import { easeInSpline } from "../animation/easings";
import MediaType from "../media/MediaType";
import Text from "../media/types/Text";
import { Browser } from "../core/Browser";
import { MediaTypeMatch, StorymapSlide, StorymapSlideBackground } from "../types";
/*	VCO.Slide
	Creates a slide. Takes a data object and
	populates the slide with content.
================================================== */

/*	Slide options: the fields Slide itself sets or reads; everything
	else merged in from the StorySlider options is absorbed by the
	index signature. */
interface SlideOptions {
    duration: number;
    slide_padding_lr: number;
    ease: unknown;
    width: number;
    height: number;
    skinny_size: number;
    media_name?: string;
    media_type?: string;
    [key: string]: unknown;
}

/*	Media instance surface as used by Slide; instances are created
	dynamically via the matched MediaTypeMatch.cls constructor. Media is
	Evented — "media_loaded" signals that content heights may have changed. */
interface MediaInstance {
    addTo: (container: HTMLElement) => void;
    loadMedia: () => void;
    stopMedia: () => void;
    updateDisplay: (w?: number, h?: number, l?: string) => void;
    on?: EventedInstance["on"];
    _state?: { loaded?: boolean };
}

interface SlideHas {
    headline: boolean;
    text: boolean;
    media: boolean;
    title: boolean;
    background: {
        image: boolean;
        color: boolean;
        color_value: string;
    };
}

class SlideBase {
    declare "_el": Record<string, HTMLElement>;
    declare "_media": MediaInstance | null;
    declare "_mediaclass": unknown;
    declare "_text": Text;
    declare "_state": { loaded: boolean };
    declare "_scroll_hint": HTMLElement | null;
    declare "_scroll_hint_dismissed": boolean;
    declare "has": SlideHas;
    declare "title": string;
    declare "data": StorymapSlide;
    declare "options": SlideOptions;
    declare "active": boolean;
    declare "animator": unknown;
    declare "fire": EventedInstance["fire"];
    declare "onLoaded": () => void;

    //_el: {},

    /*	Constructor
	================================================== */
    constructor(data: StorymapSlide, options: Record<string, unknown>, title_slide?: boolean) {
        // DOM Elements
        this._el = {
            container: {} as HTMLElement,
            scroll_container: {} as HTMLElement,
            background: {} as HTMLElement,
            content_container: {} as HTMLElement,
            content: {} as HTMLElement,
            call_to_action: null,
        };

        // Components
        this._media = null;
        this._mediaclass = {};
        this._text = {} as Text;

        // State
        this._state = {
            loaded: false,
        };
        this._scroll_hint = null;
        this._scroll_hint_dismissed = false;

        this.has = {
            headline: false,
            text: false,
            media: false,
            title: false,
            background: {
                image: false,
                color: false,
                color_value: "",
            },
        };

        this.has.title = title_slide;

        this.title = "";

        // Data
        this.data = {
            uniqueid: null,
            background: null,
            date: null,
            location: null,
            text: null,
            media: null,
        };

        // Options
        this.options = {
            // animation
            duration: 1000,
            slide_padding_lr: 40,
            ease: easeInSpline,
            width: 600,
            height: 600,
            skinny_size: 650,
            media_name: "",
        };

        // Actively Displaying
        this.active = false;

        // Animation Object
        this.animator = {};

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        this._initLayout();
    }

    /*	Adding, Hiding, Showing etc
	================================================== */
    show() {
        // Positioning is handled by StorySlider._updateDisplay
    }

    hide() {}

    setActive(is_active: boolean) {
        this.active = is_active;

        if (this.active) {
            if (this.data.background) {
                this.fire("background_change", this.has.background);
            }
            // the hint may re-appear on a revisit if the content still
            // overflows (the dismissed flag resets per activation)
            this._scroll_hint_dismissed = false;
            this.loadMedia();
            this._updateScrollHint();
        } else {
            this.stopMedia();
            this._hideScrollHint();
        }
    }

    updateDisplay(w?: number, h?: number, l?: string) {
        this._updateDisplay(w, h, l);
    }

    loadMedia() {
        if (this._media && !this._state.loaded) {
            this._media.loadMedia();
            this._state.loaded = true;
        }
    }

    stopMedia() {
        if (this._media && this._state.loaded) {
            try {
                this._media.stopMedia();
            } catch (e: unknown) {
                // Some sort of race condition or other ordering condition can cause
                // an error when the preview tab is selected in the editor due to
                // the stopped media not being properly formed.
                if (
                    (e as Error).message === "this._el.content_item.querySelector is not a function"
                ) {
                    console.log("Ignoring error in editor context: " + (e as Error).message);
                } else {
                    throw e;
                }
            }
            // If the media load never started (its pending timer was
            // cancelled on a quick pass-through), allow a revisit to retry
            if (!this._media._state?.loaded) {
                this._state.loaded = false;
            }
        }
    }

    getBackground() {
        return this.has.background;
    }

    scrollToTop() {
        this._el.container.scrollTop = 0;
    }

    /*	Scroll hint
    ================================================== */
    /**
     * Show a bouncing downward arrow when the slide content overflows
     * (scrollable) — the hint of "more below" for scrollbars that are not
     * visible until touched. Hidden after the first scroll of any kind;
     * tappable to scroll down one step.
     */
    _updateScrollHint() {
        if (!this.active || this._scroll_hint_dismissed) {
            this._hideScrollHint();
            return;
        }
        const el = this._el.container;
        const overflows = el.scrollHeight > el.clientHeight + 1;
        if (!overflows) {
            this._hideScrollHint();
            return;
        }
        if (!this._scroll_hint) {
            this._scroll_hint = Dom.create(
                "div",
                "vco-slide-scroll-hint",
                el,
            );
            this._scroll_hint.innerHTML = "<span class='vco-icon-arrow-down'></span>";
            DomEvent.addListener(this._scroll_hint, "click", this._onScrollHintClick, this);
        }
        this._scroll_hint.style.display = "flex";
    }

    _hideScrollHint() {
        if (this._scroll_hint) {
            this._scroll_hint.style.display = "none";
        }
    }

    _onScrollHintClick() {
        // scroll down one step, then hide (the scroll event dismisses too)
        const el = this._el.container;
        el.scrollBy({ top: el.clientHeight * 0.8, behavior: "smooth" });
        this._scroll_hint_dismissed = true;
        this._hideScrollHint();
    }

    _onSlideScroll() {
        // programmatic scrollToTop on preloaded (inactive) slides must not
        // dismiss the hint
        if (!this.active || this._scroll_hint_dismissed) {
            return;
        }
        this._scroll_hint_dismissed = true;
        this._hideScrollHint();
    }

    addCallToAction(str: string) {
        this._el.call_to_action = Dom.create(
            "div",
            "vco-slide-calltoaction",
            this._el.content_container,
        );
        this._el.call_to_action.innerHTML =
            "<span class='vco-slide-calltoaction-button-text'>" + str + "</span>";
        DomEvent.addListener(this._el.call_to_action, "click", this._onCallToAction, this);
    }

    /*	Events
	================================================== */
    _onCallToAction(e: Event) {
        this.fire("call_to_action", e);
    }

    /*	Private Methods
	================================================== */
    _initLayout() {
        // Create Layout
        this._el.container = Dom.create("div", "vco-slide");
        if (this.data.uniqueid) {
            this._el.container.id = this.data.uniqueid;
        }
        this._el.scroll_container = Dom.create(
            "div",
            "vco-slide-scrollable-container",
            this._el.container,
        );
        this._el.content_container = Dom.create(
            "div",
            "vco-slide-content-container",
            this._el.scroll_container,
        );
        this._el.content = Dom.create("div", "vco-slide-content", this._el.content_container);
        this._el.background = Dom.create("div", "vco-slide-background", this._el.container);
        // first scroll of any kind hides the scroll hint (passive: the
        // listener never prevents default)
        this._el.container.addEventListener("scroll", this._onSlideScroll.bind(this), {
            passive: true,
        });
        // Style Slide Background
        if (this.data.background) {
            const background = this.data.background as StorymapSlideBackground & {
                text_background?: unknown;
            };
            if (background.url) {
                this.has.background.image = true;
                this._el.container.className += " vco-full-image-background";
                this.has.background.color_value = "#000";
                this._el.background.style.backgroundImage = "url('" + background.url + "')";
                this._el.background.style.display = "block";
            }
            if (background.color) {
                this.has.background.color = true;
                this._el.container.className += " vco-full-color-background";
                this.has.background.color_value = background.color;
            }
            if (background.text_background) {
                this._el.container.className += " vco-text-background";
            }
        }

        // Determine Assets for layout and loading
        if (this.data.media && this.data.media.url && this.data.media.url !== "") {
            this.has.media = true;
        }
        if (this.data.text && this.data.text.text) {
            this.has.text = true;
        }
        if (this.data.text && this.data.text.headline) {
            this.has.headline = true;
            this.title = this.data.text.headline;
        }

        // Create Media
        if (this.has.media) {
            // Determine the media type
            this.data.media.mediatype = MediaType(this.data.media) as MediaTypeMatch;
            this.options.media_name = this.data.media.mediatype.name;
            this.options.media_type = this.data.media.mediatype.type;

            // Create a media object using the matched class name
            this._media = new this.data.media.mediatype.cls(
                this.data.media,
                this.options,
            ) as MediaInstance;
            // loaded media changes the content height — the scroll hint
            // may appear or disappear
            this._media.on?.("media_loaded", () => this._updateScrollHint());
        }

        // Create Text
        if (this.has.text || this.has.headline) {
            this._text = new Text(this.data.text, {
                title: this.has.title,
                text_align: this.options.text_align as string | undefined,
            });
        }

        // Add to DOM
        if (!this.has.text && !this.has.headline && this.has.media) {
            this._el.container.className += " vco-slide-media-only";
            this._media.addTo(this._el.content);
        } else if (this.has.headline && this.has.media && !this.has.text) {
            this._el.container.className += " vco-slide-media-only";
            this._text.addTo(this._el.content);
            this._media.addTo(this._el.content);
        } else if (this.has.text && this.has.media) {
            this._media.addTo(this._el.content);
            this._text.addTo(this._el.content);
        } else if (this.has.text || this.has.headline) {
            this._el.container.className += " vco-slide-text-only";
            this._text.addTo(this._el.content);
        }

        // Fire event that the slide is loaded
        this.onLoaded();
    }

    // Update Display
    _updateDisplay(width?: number, height?: number, layout?: string) {
        let pad_left, pad_right, new_width;

        if (width) {
            this.options.width = width;
        } else {
            this.options.width = this._el.container.offsetWidth;
        }

        if (Browser.mobile && this.options.width <= this.options.skinny_size) {
            pad_left = 0 + "px";
            pad_right = 0 + "px";
            new_width = this.options.width - 0 + "px";
        } else if (layout === "landscape") {
            pad_left = 40 + "px";
            pad_right = 75 + "px";
            new_width = this.options.width - (75 + 40) + "px";
        } else if (this.options.width <= this.options.skinny_size) {
            pad_left = this.options.slide_padding_lr + "px";
            pad_right = this.options.slide_padding_lr + "px";
            new_width = this.options.width - this.options.slide_padding_lr * 2 + "px";
        } else {
            pad_left = this.options.slide_padding_lr + "px";
            pad_right = this.options.slide_padding_lr + "px";
            new_width = this.options.width - this.options.slide_padding_lr * 2 + "px";
        }

        this._el.content.style.paddingLeft = pad_left;
        this._el.content.style.paddingRight = pad_right;
        this._el.content.style.width = new_width;

        if (this._el.call_to_action) {
            this._el.call_to_action.style.paddingLeft = pad_left;
            this._el.call_to_action.style.paddingRight = pad_right;
            this._el.call_to_action.style.width = new_width;
        }

        if (height) {
            this.options.height = height;
            //this._el.scroll_container.style.height		= this.options.height + "px";
        } else {
            this.options.height = this._el.container.offsetHeight;
        }

        if (this._media) {
            if (!this.has.text && this.has.headline) {
                this._media.updateDisplay(
                    this.options.width,
                    this.options.height - this._text.headlineHeight(),
                    layout,
                );
            } else {
                this._media.updateDisplay(this.options.width, this.options.height, layout);
            }
        }

        // layout/resize changes move the overflow boundary
        this._updateScrollHint();
    }
}

export default class Slide extends DomMixed(Evented(SlideBase)) {
    constructor(...args: ConstructorParameters<typeof SlideBase>) {
        super(...args);
    }
}
