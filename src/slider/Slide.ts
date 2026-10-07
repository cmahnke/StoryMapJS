import { mergeData, prefersReducedMotion } from "../core/Util";
import { DomMixed, Evented, type EventedInstance } from "../core/mixins";
import { DomEvent } from "../dom/DomEvent";
import Dom from "../dom/Dom";
import { easeInSpline } from "../animation/easings";
import MediaType from "../media/MediaType";
import type { MediaEvents } from "../media/Media";
import { sanitizeSlideText } from "../media/EmbedUtil";
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

/**
 * The slide's element cache. `call_to_action` is null until the slide is told
 * to show one (`addCallToAction`).
 */
type SlideElements = {
    container: HTMLElement;
    scroll_container: HTMLElement;
    background: HTMLElement;
    content_container: HTMLElement;
    content: HTMLElement;
    call_to_action: HTMLElement | null;
};

/*	Media instance surface as used by Slide; instances are created
	dynamically via the matched MediaTypeMatch.cls constructor. Media is
	Evented — "media_loaded" signals that content heights may have changed. */
interface MediaInstance {
    addTo: (container: HTMLElement) => void;
    loadMedia: () => void;
    stopMedia: () => void;
    updateDisplay: (w?: number, h?: number, l?: string) => void;
    dispose?: () => void;
    on?: EventedInstance<MediaEvents>["on"];
    off?: EventedInstance<MediaEvents>["off"];
    _state?: { loaded?: boolean; eager?: boolean };
    /** Per-item consent identity: each item is built with its own
        `media_name`/`media_type`, which `hasPlayableMedia` reads back (#358). */
    options?: { media_type?: string };
}

export interface SlideBackgroundState {
    image: boolean;
    color: boolean;
    color_value: string;
}

export interface SlideEvents {
    background_change: SlideBackgroundState;
    call_to_action: Event;
    loaded: StorymapSlide;
    added: StorymapSlide;
    removed: StorymapSlide;
}

interface SlideHas {
    headline: boolean;
    text: boolean;
    media: boolean;
    title: boolean;
    background: SlideBackgroundState;
}

class SlideBase {
    /** `call_to_action` is only created when the slide shows one. */
    declare "_el": SlideElements;
    /** The primary media item; always `_medias[0]` when present (#358). */
    declare "_media": MediaInstance | null;
    /** Every media item: `[media, ...media_extra]` with a non-empty url. */
    declare "_medias": MediaInstance[];
    declare "_text": Text;
    declare "_state": { loaded: boolean };
    declare "_scroll_hint": HTMLElement | null;
    declare "_scroll_hint_dismissed": boolean;
    declare "_onSlideScrollBound": EventListener;
    /** Every `media_ended` handler registered via `onMediaEnded`, with the
        media it was attached to so `dispose()` can remove them. */
    declare "_media_ended_fns": { media: MediaInstance; fn: () => void }[];
    /** The `media_loaded` handlers below, kept for the same reason. */
    declare "_media_loaded_fns": { media: MediaInstance; fn: () => void }[];
    declare "has": SlideHas;
    declare "title": string;
    declare "data": StorymapSlide;
    declare "options": SlideOptions;
    declare "active": boolean;
    declare "animator": unknown;
    declare "fire": EventedInstance<SlideEvents>["fire"];
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
        this._medias = [];
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

        this.has.title = title_slide === true;

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

        this._onSlideScrollBound = null as unknown as EventListener;
        this._media_ended_fns = [];
        this._media_loaded_fns = [];
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

    /**
     * Release the slide's listeners, media and DOM. Called by
     * `StorySlider.dispose()`; the slide must not be used afterwards.
     */
    dispose() {
        // the scroll listener was registered against a bound copy, so this
        // only works because that reference was kept
        if (this._onSlideScrollBound) {
            this._el.container?.removeEventListener("scroll", this._onSlideScrollBound);
            this._onSlideScrollBound = null as unknown as EventListener;
        }
        if (this._el.call_to_action) {
            DomEvent.removeListener(this._el.call_to_action, "click", this._onCallToAction, this);
        }
        if (this._scroll_hint) {
            DomEvent.removeListener(this._scroll_hint, "click", this._onScrollHintClick, this);
            this._scroll_hint = null;
        }
        this._el.container?.getAnimations?.().forEach((a) => a.cancel());
        // the media_ended handlers registered via onMediaEnded() live on the
        // media objects, which outlive this slide once nulled — remove them
        // here or a disposed slide's advance closure fires on a later ended
        this.clearMediaEnded();
        for (const { media, fn } of this._media_loaded_fns) {
            media.off?.("media_loaded", fn);
        }
        this._media_loaded_fns = [];
        for (const media of this._medias) {
            media.dispose?.();
        }
        this._medias = [];
        this._media = null;
        this._el.container?.remove();
    }

    setActive(is_active: boolean) {
        this.active = is_active;

        // Off-screen slides are translated away but stay in the DOM, so a
        // screen reader would read every slide's headline, body and caption.
        // Hide inactive slides from assistive tech next to the flip that
        // already marks them inactive; `inert` additionally drops their
        // controls from keyboard reach. Neither affects loading: preloaded
        // media (including iframes) still builds and fetches underneath.
        this._el.container.setAttribute("aria-hidden", String(!is_active));
        if (is_active) {
            this._el.container.removeAttribute("inert");
        } else {
            this._el.container.setAttribute("inert", "");
        }

        if (this.active) {
            if (this.data.background) {
                this.fire("background_change", this.has.background);
            }
            // the hint may re-appear on a revisit if the content still
            // overflows (the dismissed flag resets per activation)
            this._scroll_hint_dismissed = false;
            // the active slide's images load eagerly: media built after this
            // point (the 1200ms load timer) honors the flag, already-built
            // images are upgraded below
            for (const media of this._medias) {
                if (media._state) {
                    media._state.eager = true;
                }
            }
            this.loadMedia();
            this._eagerLoadImages();
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
        if (this._medias.length > 0 && !this._state.loaded) {
            for (const media of this._medias) {
                media.loadMedia();
            }
            this._state.loaded = true;
        }
    }

    /*  Perf: preloaded slide images are `lazy`; make them `eager` the
        moment the slide becomes active so navigation never waits on a
        deferred fetch (loading starts now, not on intersection). */
    _eagerLoadImages() {
        this._el.container
            .querySelectorAll<HTMLImageElement>("img.vco-media-image")
            .forEach((img) => {
                img.loading = "eager";
            });
    }

    stopMedia() {
        if (this._medias.length > 0 && this._state.loaded) {
            for (const media of this._medias) {
                // An audio bed that outlives its slide
                // (`media.stopOnExit: false`, slideshow ambient audio) keeps
                // playing; StoryMap stops it when another slide claims audio.
                // Slideshow-only: internal documents always stop.
                const mediaData = (media as unknown as { data?: { stopOnExit?: boolean } }).data;
                const sourced =
                    (this.options as { slideshow_source?: unknown }).slideshow_source === true;
                if (sourced && mediaData?.stopOnExit === false) continue;
                try {
                    media.stopMedia();
                } catch (e: unknown) {
                    // Some sort of race condition or other ordering condition can cause
                    // an error when the preview tab is selected in the editor due to
                    // the stopped media not being properly formed.
                    if (
                        (e as Error).message ===
                        "this._el.content_item.querySelector is not a function"
                    ) {
                        console.warn("Ignoring error in editor context: " + (e as Error).message);
                    } else {
                        throw e;
                    }
                }
            }
            // If no media load started (pending timers were cancelled on a
            // quick pass-through), allow a revisit to retry
            if (!this._medias.some((media) => media._state?.loaded)) {
                this._state.loaded = false;
            }
        }
    }

    /**
     * Stop this slide's ambient audio beds (`media.stopOnExit: false`) —
     * called by the viewer when another slide claims the audio, not on every
     * deactivation (see `stopMedia`, which skips them).
     */
    stopAmbientMedia() {
        // Slideshow-only by construction (see stopMedia): without the source
        // flag no media can be ambient, so there is nothing to stop.
        if ((this.options as { slideshow_source?: unknown }).slideshow_source !== true) return;
        if (this._medias.length > 0 && this._state.loaded) {
            for (const media of this._medias) {
                const mediaData = (media as unknown as { data?: { stopOnExit?: boolean } }).data;
                if (mediaData?.stopOnExit !== false) continue;
                try {
                    media.stopMedia();
                } catch {
                    // same editor-context race stopMedia() already tolerates
                }
            }
        }
    }

    getBackground() {
        return this.has.background;
    }

    /**
     * True when this slide's media is a timed, playable one (audio or video).
     * `autoplay_media` waits for such a slide's media to end instead of using
     * its timer; everything else keeps the timer.
     */
    hasPlayableMedia(): boolean {
        if (this._medias.length === 0) {
            const kind = this.options.media_type as string | undefined;
            return kind === "audio" || kind === "video";
        }
        return this._medias.some((media) => {
            const kind = media.options?.media_type;
            return kind === "audio" || kind === "video";
        });
    }

    /**
     * Call `fn` when this slide's media finishes playing. A slide with no
     * media — or media that cannot end — never calls it, which is why
     * `autoplay_media` keeps its timer as a fallback rather than waiting on
     * an event that may not arrive. Multi-media slides never call it either:
     * waiting for the last of several items to end would stall autoplay, so
     * the timer stays the advance for those (#358).
     */
    onMediaEnded(fn: () => void): void {
        const playable = this._medias.filter((media) => {
            const kind = media.options?.media_type;
            return (kind === "audio" || kind === "video") && media.on;
        });
        if (playable.length !== 1) return;
        playable[0].on?.("media_ended", fn);
        this._media_ended_fns.push({ media: playable[0], fn });
    }

    /**
     * Drop `media_ended` handlers armed by `onMediaEnded()` without waiting
     * for dispose: re-arming (autoplay revisit) or navigating away must not
     * accumulate stale advance closures — an ambient bed outliving its slide
     * would otherwise fire a previous slide's advance on ending.
     */
    clearMediaEnded(): void {
        for (const { media, fn } of this._media_ended_fns) {
            try {
                media.off?.("media_ended", fn);
            } catch {
                // same editor-context race stopMedia() already tolerates
            }
        }
        this._media_ended_fns = [];
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
            // a real button for keyboard/AT operability (issue #385 wave)
            this._scroll_hint = Dom.create("button", "vco-slide-scroll-hint", el);
            this._scroll_hint.setAttribute("type", "button");
            this._scroll_hint.setAttribute("aria-label", "Scroll down");
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
        el.scrollBy({
            top: el.clientHeight * 0.8,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
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
        // a real button for keyboard/AT operability (issue #385 wave), like
        // the menubar buttons; the classes carry the look
        this._el.call_to_action = Dom.create(
            "button",
            "vco-slide-calltoaction",
            this._el.content_container,
        );
        this._el.call_to_action.setAttribute("type", "button");
        // The text comes from `call_to_action_text` in the storymap JSON, so
        // it goes through the sanitizer like every other author string
        // instead of being concatenated into markup.
        const button_text = Dom.create("span", "vco-slide-calltoaction-button-text");
        button_text.appendChild(sanitizeSlideText(str));
        this._el.call_to_action?.appendChild(button_text);
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
        // listener never prevents default). The reference is kept because
        // `.bind()` returns a new function each call, so the listener could
        // otherwise never be removed again.
        this._onSlideScrollBound = this._onSlideScroll.bind(this);
        this._el.container.addEventListener("scroll", this._onSlideScrollBound, {
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

        // Determine Assets for layout and loading. A slide has media when
        // any item — the primary or an extra — carries a non-empty url, so
        // an empty `media.url` still yields false (#358).
        const slide_media_items = [this.data.media, ...(this.data.media_extra ?? [])].filter(
            (item): item is NonNullable<StorymapSlide["media"]> => !!item?.url,
        );
        if (slide_media_items.length > 0) {
            this.has.media = true;
        }
        if (this.data.text && this.data.text.text) {
            this.has.text = true;
        }
        if (this.data.text?.headline) {
            this.has.headline = true;
            this.title = this.data.text.headline;
        }

        // Create Media (#358): the primary item plus every extra with a
        // non-empty url, in order. Each item gets its own MediaType match and
        // its own consent identity (media_name/media_type), so per-slide
        // consent asks and the audio badge tell items apart.
        const media_items = slide_media_items;
        if (media_items.length > 0) {
            for (const item of media_items) {
                // Determine the media type
                item.mediatype = MediaType(item) as MediaTypeMatch;
                // Item 0 keeps the historical write-back: the marker icon
                // class reads it off the slide data.
                if (item === media_items[0]) {
                    this.options.media_name = item.mediatype.name;
                    this.options.media_type = item.mediatype.type;
                }
                // Create a media object using the matched class name
                const media = new item.mediatype.cls(item, {
                    ...this.options,
                    media_name: item.mediatype.name,
                    media_type: item.mediatype.type,
                }) as MediaInstance;
                // loaded media changes the content height — the scroll hint
                // may appear or disappear
                const on_loaded = () => this._updateScrollHint();
                media.on?.("media_loaded", on_loaded);
                this._media_loaded_fns.push({ media, fn: on_loaded });
                this._medias.push(media);
            }
            this._media = this._medias[0] ?? null;
        }

        // Create Text
        if ((this.has.text || this.has.headline) && this.data.text) {
            this._text = new Text(this.data.text, {
                title: this.has.title,
                text_align: this.options.text_align as string | undefined,
                language: this.data.language ?? undefined,
            });
        }

        // Add to DOM. Each branch has just established the members it uses
        // (has.media -> _medias, has.text/headline -> _text). The media loop
        // preserves the historical ordering: media-then-text, or
        // text-then-media when there is a headline but no body text.
        const medias = this._medias;
        if (medias.length > 1) {
            // `row` seats two items side by side; anything else stacks (D4)
            const layout =
                this.data.media_layout === "row" && medias.length === 2 ? "row" : "stack";
            this._el.container.classList.add("vco-slide-media-multiple");
            this._el.container.setAttribute("data-layout", layout);
        }
        if (!this.has.text && !this.has.headline && this.has.media) {
            this._el.container.className += " vco-slide-media-only";
            for (const media of medias) {
                media.addTo(this._el.content);
            }
        } else if (this.has.headline && this.has.media && !this.has.text) {
            this._el.container.className += " vco-slide-media-only";
            this._text.addTo(this._el.content);
            for (const media of medias) {
                media.addTo(this._el.content);
            }
        } else if (this.has.text && this.has.media) {
            for (const media of medias) {
                media.addTo(this._el.content);
            }
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

        if (this._medias.length > 0) {
            if (!this.has.text && this.has.headline) {
                for (const media of this._medias) {
                    media.updateDisplay(
                        this.options.width,
                        this.options.height - this._text.headlineHeight(),
                        layout,
                    );
                }
            } else {
                for (const media of this._medias) {
                    media.updateDisplay(this.options.width, this.options.height, layout);
                }
            }
        }

        // layout/resize changes move the overflow boundary
        this._updateScrollHint();
    }
}

const EventedSlideBase = Evented<SlideEvents, typeof SlideBase>(SlideBase);

export default class Slide extends DomMixed<SlideEvents, typeof EventedSlideBase>(
    EventedSlideBase,
) {
    constructor(...args: ConstructorParameters<typeof SlideBase>) {
        super(...args);
    }
}
