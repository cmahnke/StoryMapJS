import {
    mergeData,
    unique_ID,
    findArrayNumberByUniqueID,
    parseCssColor,
    slideTransitionDuration,
    prefersReducedMotion,
} from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { DomEvent } from "../dom/DomEvent";
import { easeInOutQuint } from "../animation/easings";
import SlideNav from "./SlideNav";
import Slide from "./Slide";
import Animate from "../animation/tween";
import Swipable from "../ui/Swipable";
import Message from "../ui/Message";
import { Browser } from "../core/Browser";
import { Language, isRtl } from "../language/Language";
import { AnimationHandle, StorymapData, StorymapSlide } from "../types";

/*	StorySlider
	is the central class of the API - it is used to create a StorySlider

	Events:
	nav_next
	nav_previous
	slideDisplayUpdate
	loaded
	slideAdded
	slideLoaded
	slideRemoved


================================================== */

/*	StorySlider options: the fields it sets or reads; everything else
	merged in from the StoryMap options is absorbed by the index signature. */
interface StorySliderOptions {
    id?: string;
    layout: string;
    width: number;
    height: number;
    default_bg_color: { r: number; g: number; b: number };
    slide_padding_lr: number;
    start_at_slide: number;
    slide_default_fade: string;
    duration: number;
    ease: unknown;
    skinny_size?: number;
    call_to_action?: boolean;
    call_to_action_text?: string;
    trackResize?: boolean;
    [key: string]: unknown;
}

/**
 * The slider's element cache.
 */
type StorySliderElements = {
    container: HTMLElement;
    /** Created in `_initLayout`; the slide background layer. */
    background: HTMLElement;
    slider_container_mask: HTMLElement;
    slider_container: HTMLElement;
    slider_item_container: HTMLElement;
    live_region: HTMLElement | null;
};

interface SlideBackgroundChange {
    color_value?: string;
    image?: boolean;
}

export interface StorySliderEvents {
    colorchange: SlideBackgroundChange;
    nav_next: Partial<StorymapData>;
    nav_previous: Partial<StorymapData>;
    nav_left: Partial<StorymapData>;
    nav_right: Partial<StorymapData>;
    slideAdded: Partial<StorymapData>;
    change: { current_slide: number; uniqueid: string | null | undefined };
    loaded: Partial<StorymapData>;
    title: { title: string };
}

class StorySliderBase {
    declare "_el": StorySliderElements;
    declare "_nav": { previous: SlideNav; next: SlideNav };
    declare "slide_spacing": number;
    declare "_slides": Slide[];
    declare "_swipable": Swipable;
    declare "preloadTimer": ReturnType<typeof setTimeout> | undefined;
    declare "preloadIdleHandle": number | undefined;
    declare "_message": Message;
    declare "current_slide": number;
    declare "current_bg_color": string | null;
    /** Layout the background gradient was built for; a portrait↔landscape
        switch rebuilds it even when the color is unchanged. */
    declare "current_bg_layout": string | null;
    declare "data": Partial<StorymapData>;
    declare "options": StorySliderOptions;
    declare "animator": AnimationHandle | null;
    declare "animator_background": AnimationHandle | null;
    declare "fire": EventedInstance<StorySliderEvents>["fire"];
    declare "_loaded": boolean;
    /** Scroll-spy observer for `mode: "static"`; null in standard mode. */
    declare "_static_observer": IntersectionObserver | null;
    /** True while a scroll-spy navigation is settling (suppresses echo scrolls). */
    declare "_static_spying": boolean;

    /*	Private Methods
	================================================== */
    constructor(
        elem: HTMLElement | string,
        data: Partial<StorymapData>,
        options?: Partial<StorySliderOptions>,
        init?: boolean,
    ) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            slider_container_mask: {} as HTMLElement,
            slider_container: {} as HTMLElement,
            slider_item_container: {} as HTMLElement,
            background: {} as HTMLElement,
            live_region: null,
        };

        this._nav = {
            previous: {} as SlideNav,
            next: {} as SlideNav,
        };

        // Slide Spacing
        this.slide_spacing = 0;

        // Slides Array
        this._slides = [];

        // Current Slide
        this.current_slide = 0;

        // Current Background Color
        this.current_bg_color = null;
        this.current_bg_layout = null;

        // Data Object
        this.data = {};

        this.options = {
            id: "",
            layout: "portrait",
            width: 600,
            height: 600,
            default_bg_color: { r: 255, g: 255, b: 255 },
            slide_padding_lr: 40, // padding on slide of slide
            start_at_slide: 1,
            slide_default_fade: "0%", // landscape fade
            // animation
            duration: 1000,
            ease: easeInOutQuint,
            trackResize: true,
        };

        // Main element ID
        if (typeof elem === "object") {
            this._el.container = elem;
            this.options.id = unique_ID(6, "vco");
        } else {
            this.options.id = elem;
            const found = Dom.get(elem);
            if (!found) {
                throw new Error("StoryMapJS: no element with id " + elem);
            }
            this._el.container = found;
        }

        if (!this._el.container.id) {
            this._el.container.id = this.options.id;
        }

        // Animation Object
        this.animator = null;
        this.animator_background = null;
        this._static_observer = null;
        this._static_spying = false;

        // Preload scheduling handles, at most one of which is ever live
        this.preloadTimer = undefined;
        this.preloadIdleHandle = undefined;

        // Merge Data and Options
        mergeData(this.options, options);
        mergeData(this.data, data);

        if (init) {
            this.init();
        }
    }

    init() {
        this._initLayout();
        this._initEvents();
        this._initData();
        this._updateDisplay();

        // Go to initial slide
        this.goTo(this.options.start_at_slide);

        this._onLoaded();
        this._introInterface();
    }

    /*	Public
	================================================== */
    updateDisplay(w?: number, h?: number, a?: unknown, l?: string) {
        this._updateDisplay(w, h, a, l);
    }

    // Create a slide
    createSlide(d: StorymapSlide) {
        this._createSlide(d);
    }

    // Create Many Slides from an array
    createSlides(array: StorymapData["slides"]) {
        this._createSlides(array);
    }

    /*	Create Slides
	================================================== */
    _createSlides(array: StorymapData["slides"]) {
        // a storymap with no slides array is a valid (if empty) document —
        // the schema allows it and the map still renders
        if (!array || array.length === 0) {
            return;
        }
        for (let i = 0; i < array.length; i++) {
            // The id is generated into a per-slide copy, not written back into
            // `array`. StoryMap hands its own `this.data` down without cloning
            // it, so writing here would be visible to every other viewer built
            // from the same parsed document: the second one would find the id
            // already set, adopt it, and emit a duplicate element id — the id
            // becomes a DOM id in Slide, Text and Media.
            //
            // The guard is falsy rather than `=== ""`: `uniqueid` is optional
            // in the schema and absent from 47 of the 48 bundled fixtures, so
            // an empty-string test never fired and every slide ended up with
            // an empty id.
            const needs_id = !array[i].uniqueid;
            const slide_data = needs_id
                ? { ...array[i], uniqueid: unique_ID(6, "vco-slide") }
                : array[i];
            if (i === 0) {
                this._createSlide(slide_data, true);
            } else {
                this._createSlide(slide_data, false);
            }
        }
    }

    _createSlide(d: StorymapSlide, title_slide?: boolean) {
        const slide = new Slide(d, this.options, title_slide);
        this._addSlide(slide);
        this._slides.push(slide);
    }

    _addSlide(slide: Slide) {
        slide.addTo(this._el.slider_item_container);
        slide.on("added", this._onSlideAdded, this);
        slide.on("background_change", this._onBackgroundChange, this);
        // a slide added after layout (editor preview, StoryMap.createSlide)
        // joins the scroll-spy in static mode
        if (this._isStatic()) {
            this._initStaticSpy();
        }
    }

    /*	Message
	================================================== */

    /*	Navigation
	================================================== */
    goToId(n: string | number, fast?: boolean, displayupdate?: boolean) {
        let _n: number;
        if (typeof n == "string" || (n as unknown) instanceof String) {
            _n = findArrayNumberByUniqueID(String(n), this._slides, "uniqueid");
            if (_n === -1) {
                // unknown id: stay where we are rather than jumping to slide 0
                console.warn("StoryMapJS: no slide with uniqueid", n);
                return;
            }
        } else {
            _n = n;
        }
        this.goTo(_n, fast, displayupdate);
    }

    /**
     * Cancel the pending preload, whichever scheduling primitive queued it.
     *
     * The two handles are kept apart deliberately: they are both numbers, so
     * calling `clearTimeout` on an idle-callback handle "works" by accident
     * while actually leaking the callback, and the reverse leaves a live
     * timeout behind.
     */
    _cancelPreload() {
        if (this.preloadTimer !== undefined) {
            clearTimeout(this.preloadTimer);
            this.preloadTimer = undefined;
        }
        if (this.preloadIdleHandle !== undefined) {
            (
                window as unknown as { cancelIdleCallback?: (handle: number) => void }
            ).cancelIdleCallback?.(this.preloadIdleHandle);
            this.preloadIdleHandle = undefined;
        }
    }

    /**
     * Release listeners, timers and running animations. Called by
     * `StoryMap.dispose()`; the slider must not be used afterwards.
     */
    dispose() {
        this._cancelPreload();
        this._static_observer?.disconnect();
        this._static_observer = null;
        if (this._swipable) {
            this._swipable.dispose();
        }
        DomEvent.removeListener(this._el.container, "keydown", this._onKeyDown, this);
        // Web Animations API (morpheus replacement): stop slide transitions
        // mid-flight so they don't keep running against a detached tree
        for (const el of [this._el.container, this._el.slider_container, this._el.background]) {
            el?.getAnimations?.().forEach((a) => a.cancel());
        }
        for (const slide of this._slides) {
            slide.dispose();
        }
        this._nav.previous?.dispose();
        this._nav.next?.dispose();
        this._message?.dispose();
        this._slides = [];
    }

    goTo(n: number, fast?: boolean, displayupdate?: boolean, fromScroll = false) {
        this.changeBackground({ color_value: "", image: false });

        // Clear Preloader Timer
        this._cancelPreload();

        // Set Slide Active State
        for (let i = 0; i < this._slides.length; i++) {
            this._slides[i].setActive(false);
        }

        if (n < this._slides.length && n >= 0) {
            // Scale the transition duration with the jump distance so that
            // out-of-order navigation glides instead of flicking; the map
            // computes the very same value to keep both in sync
            const previous_slide = this.current_slide;
            this.current_slide = n;
            const transition_duration = slideTransitionDuration(previous_slide, n);

            // Stop animation
            if (this.animator) {
                this.animator.stop();
            }
            if (this._swipable) {
                this._swipable.stopMomentum();
            }

            // Static reading mode: all slides are stacked in a scrollable
            // list instead of a translating strip. Programmatic navigation
            // scrolls the slide into view; scroll-spy navigation (fromScroll)
            // only flips the active state, or scrolling would fight the
            // visitor's own scroll position.
            if (this._isStatic()) {
                if (!fromScroll) {
                    this._static_spying = true;
                    this._scrollSlideIntoView(this.current_slide);
                    // longer than the smooth scroll it triggers: the
                    // observer must stay deaf until the list settles, or it
                    // echoes the programmatic scroll back as user input
                    window.setTimeout(() => {
                        this._static_spying = false;
                    }, 600);
                }
                // scroll-spy navigation must fire: the map follows the
                // reading position through the change event (fromScroll only
                // suppresses the echo scroll above, never the event)
                this._onSlideChange(fromScroll ? false : displayupdate);
            } else if (fast || prefersReducedMotion() || this.options.fxmode === "none") {
                this._el.slider_container.style.opacity = "";
                this._el.slider_container.style.left = -(this.slide_spacing * n) + "px";
                this._onSlideChange(displayupdate);
            } else if (this.options.fxmode === "fade") {
                // fire the change event at animation start so the map and the
                // slider animate simultaneously
                this._onSlideChange(displayupdate);
                this._el.slider_container.style.left = -(this.slide_spacing * n) + "px";
                this._el.slider_container.style.opacity = "0";
                this.animator = Animate(this._el.slider_container, {
                    opacity: 1,
                    duration: transition_duration,
                    easing: this.options.ease,
                });
            } else {
                // fire the change event at animation start so the map and the
                // slider animate simultaneously
                this._onSlideChange(displayupdate);
                this._el.slider_container.style.opacity = "";
                this.animator = Animate(this._el.slider_container, {
                    left: -(this.slide_spacing * n) + "px",
                    duration: transition_duration,
                    easing: this.options.ease,
                });
            }

            // Set Slide Active State
            if (this._slides.length > 0) {
                this._slides[this.current_slide].setActive(true);
            }

            // Announce the slide change to assistive tech (issue #385 wave):
            // the headline or the slide number, replacing the previous text
            if (this._el.live_region) {
                const headline = this._slides[this.current_slide]?.title;
                this._el.live_region.textContent =
                    headline || `Slide ${this.current_slide + 1} of ${this._slides.length}`;
            }

            // Preload the next slide's media right away so its load clock,
            // network and iframe build elapse during this transition (and the
            // dwell time) instead of starting after arrival
            if (this._slides[this.current_slide + 1]) {
                this._slides[this.current_slide + 1].loadMedia();
                this._slides[this.current_slide + 1].scrollToTop();
            }

            // Update Navigation and Info
            if (this._slides[this.current_slide + 1]) {
                this.showNav(this._nav.next, true);
                this._nav.next.update(this.getNavInfo(this._slides[this.current_slide + 1]));
            } else {
                this.showNav(this._nav.next, false);
            }
            if (this._slides[this.current_slide - 1]) {
                this.showNav(this._nav.previous, true);
                this._nav.previous.update(this.getNavInfo(this._slides[this.current_slide - 1]));
            } else {
                this.showNav(this._nav.previous, false);
            }

            // Preload the surrounding slides once this transition settles,
            // preferably while the browser is idle so the burst of iframe
            // builds and script injections doesn't compete with animations;
            // the timeout caps the wait at the base transition duration
            const w = window as unknown as {
                requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            };
            if (w.requestIdleCallback) {
                this.preloadIdleHandle = w.requestIdleCallback(() => this.preloadSlides(), {
                    timeout: this.options.duration,
                });
            } else {
                this.preloadTimer = setTimeout(() => {
                    this.preloadSlides();
                }, this.options.duration);
            }
        }
    }

    preloadSlides() {
        // NOTE: current_slide + 1 is preloaded eagerly in goTo(); the guard
        // in Slide.loadMedia() makes a repeated call here harmless
        if (this._slides[this.current_slide + 1]) {
            this._slides[this.current_slide + 1].loadMedia();
            this._slides[this.current_slide + 1].scrollToTop();
        }
        if (this._slides[this.current_slide + 2]) {
            this._slides[this.current_slide + 2].loadMedia();
            this._slides[this.current_slide + 2].scrollToTop();
        }
        if (this._slides[this.current_slide - 1]) {
            this._slides[this.current_slide - 1].loadMedia();
            this._slides[this.current_slide - 1].scrollToTop();
        }
        if (this._slides[this.current_slide - 2]) {
            this._slides[this.current_slide - 2].loadMedia();
            this._slides[this.current_slide - 2].scrollToTop();
        }
    }

    getNavInfo(slide: Slide) {
        const n = {
            title: "",
            description: "",
        };

        if (slide.data.text) {
            if (slide.data.text.headline) {
                n.title = slide.data.text.headline;
            }
        }

        return n;
    }

    next() {
        if (this.current_slide + 1 < this._slides.length) {
            this.goTo(this.current_slide + 1);
        } else {
            this.goTo(this.current_slide);
        }
    }

    previous() {
        if (this.current_slide - 1 >= 0) {
            this.goTo(this.current_slide - 1);
        } else {
            this.goTo(this.current_slide);
        }
    }

    showNav(nav_obj: SlideNav, show: boolean) {
        // `shownav: false` (slideshow shownav) hides the previous/next
        // chrome; keyboard, swipe and dots navigation still work
        if (this.options.shownav === false) {
            show = false;
        }
        if (this.options.width <= 500 && Browser.mobile) {
            // hidden on small mobile screens
        } else {
            if (show) {
                nav_obj.show();
            } else {
                nav_obj.hide();
            }
        }
    }

    changeBackground(bg: SlideBackgroundChange) {
        let do_animation = false;

        let bg_color,
            bg_percent_start = this.options.slide_default_fade,
            bg_css = "";
        const bg_percent_end = "15%";
        const bg_alpha_end = "0.87";
        const _bg_old = this._el.background.getAttribute("style");

        // Dark theme without an explicit slide background: fade from the
        // themed panel color. White (the light default) would wash the
        // dark slide; the existing darkness heuristics below (less fade,
        // inverted nav icons) then behave as they do for dark author
        // backgrounds.
        const dark =
            !bg.color_value &&
            (this.options.theme === "dark" ||
                (this.options.theme !== "light" &&
                    typeof window.matchMedia === "function" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches));
        if (bg.color_value) {
            // any CSS color; unparseable values fall back to the default
            bg_color = parseCssColor(bg.color_value) || this.options.default_bg_color;
        } else if (dark) {
            bg_color = { r: 34, g: 34, b: 34 };
        } else {
            bg_color = this.options.default_bg_color;
        }

        const bg_color_rgb = bg_color.r + "," + bg_color.g + "," + bg_color.b;

        if (
            !this.current_bg_color ||
            this.current_bg_color !== bg_color_rgb ||
            this.current_bg_layout !== this.options.layout
        ) {
            this.current_bg_color = bg_color_rgb;
            this.current_bg_layout = this.options.layout;
            do_animation = true;
        }

        if (do_animation) {
            // Stop the in-flight fade only when replacing it: an early
            // no-op call (same color, e.g. the empty reset at the top of
            // goTo before the active slide fires background_change) must not
            // kill the fade another call just started — stop() commits the
            // partial opacity inline and the finish handler never runs, so
            // the gradient below would never be applied and the panel would
            // keep the opaque stylesheet fallback.
            if (this.animator_background) {
                this.animator_background.stop();
            }

            // Figure out CSS
            if (this.options.layout === "landscape") {
                this._nav.next.setColor(false);
                this._nav.previous.setColor(false);

                // If background is not white, less fade is better
                if (bg_color.r < 255 && bg_color.g < 255 && bg_color.b < 255) {
                    bg_percent_start = "15%";
                }

                if (bg.image) {
                    bg_percent_start = "0%";
                }
                bg_css += "opacity:0;";
                bg_css +=
                    "background-image: linear-gradient(to right, rgba(" +
                    bg_color_rgb +
                    ",0.0001 ) " +
                    bg_percent_start +
                    ", rgba(" +
                    bg_color_rgb +
                    "," +
                    bg_alpha_end +
                    ") " +
                    bg_percent_end +
                    ");";
                bg_css += "background-repeat: repeat-x;";
            } else {
                if (bg.color_value) {
                    bg_css += "background-color:" + bg.color_value + ";";
                } else if (dark) {
                    bg_css += "background-color:#222;";
                } else {
                    bg_css += "background-color:#FFF;";
                }

                if ((bg_color.r < 255 && bg_color.g < 255 && bg_color.b < 255) || bg.image) {
                    this._nav.next.setColor(true);
                    this._nav.previous.setColor(true);
                } else {
                    this._nav.next.setColor(false);
                    this._nav.previous.setColor(false);
                }
            }

            // FADE OUT IN
            this.animator_background = Animate(this._el.background, {
                opacity: 0,
                duration: prefersReducedMotion() ? 0 : this.options.duration / 2,
                easing: this.options.ease,
                complete: () => {
                    this.fadeInBackground(bg_css);
                },
            });
        }
    }

    fadeInBackground(bg_css: string) {
        if (this.animator_background) {
            this.animator_background.stop();
        }

        if (bg_css) {
            this._el.background.setAttribute("style", bg_css);
        }

        this.animator_background = Animate(this._el.background, {
            opacity: 1,
            duration: prefersReducedMotion() ? 0 : this.options.duration / 2,
            easing: this.options.ease,
            complete: () => {
                // Fold the end state into the inline style so the panel does
                // not depend on a retained fill-forwards animation to stay
                // visible: once the fill is dropped (cancel, GC) the element
                // would snap back to the inline opacity:0 above.
                this._el.background.style.opacity = "1";
                this.animator_background?.stop();
                this.animator_background = null;
            },
        });
    }

    /*	Private Methods
	================================================== */

    /** True in the stacked reading mode (`mode: "static"`): no strip translation. */
    _isStatic(): boolean {
        return (this.options as { mode?: unknown }).mode === "static";
    }

    /**
     * Scroll-spy for the static reading mode: the most visible stacked slide
     * becomes current, so the map follows the reading position. Programmatic
     * scrolls set `_static_spying` while settling and are ignored, or the
     * observer would echo them back.
     */
    _initStaticSpy(): void {
        if (typeof IntersectionObserver === "undefined") return;
        this._static_observer?.disconnect();
        // the scrolling element is the observer root: the mask scrolls WITH
        // the content (it is an ancestor chain member, not the scrollport),
        // so intersections against it would never change
        const root = this._isStatic() ? this._el.container : this._el.slider_container_mask;
        this._static_observer = new IntersectionObserver(
            (entries) => {
                if (this._static_spying) return;
                let best = -1;
                let bestRatio = 0;
                for (const entry of entries) {
                    const index = Number((entry.target as HTMLElement).dataset?.slideIndex ?? -1);
                    if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
                        best = index;
                        bestRatio = entry.intersectionRatio;
                    }
                }
                if (best >= 0 && best !== this.current_slide) {
                    this.goTo(best, true, false, true);
                }
            },
            { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
        );
        for (const child of Array.from(this._el.slider_item_container.children)) {
            const index = [...this._el.slider_item_container.children].indexOf(child);
            (child as HTMLElement).dataset.slideIndex = String(index);
            this._static_observer.observe(child);
        }
    }

    /** Scroll a stacked slide into view without moving the host page. */
    _scrollSlideIntoView(n: number): void {
        const slide = this._el.slider_item_container.children[n] as HTMLElement | undefined;
        // the scrollport in static mode is the storyslider element itself
        const scroller = this._isStatic() ? this._el.container : this._el.slider_container_mask;
        if (!slide || !scroller || typeof slide.offsetTop !== "number") return;
        const container = this._el.slider_item_container;
        const top =
            (typeof container.offsetTop === "number" ? container.offsetTop : 0) + slide.offsetTop;
        try {
            scroller.scrollTo({
                top,
                behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
        } catch {
            scroller.scrollTop = top;
        }
    }

    // Update Display
    _updateDisplay(width?: number, height?: number, animate?: unknown, layout?: string) {
        let _layout;

        if (typeof layout === "undefined") {
            _layout = this.options.layout;
        } else {
            _layout = layout;
        }

        this.options.layout = _layout;

        if (width) {
            this.options.width = width;
        } else {
            this.options.width = this._el.container.offsetWidth;
        }

        if (height) {
            this.options.height = height;
        } else {
            this.options.height = this._el.container.offsetHeight;
        }

        // Slide positions and the goTo() translation are both derived from
        // slide_spacing, so it has to be recomputed *after* the new width is
        // known. Reading it before meant a bare updateDisplay() (no explicit
        // width, i.e. after a container resize) positioned every slide for the
        // previous width.
        this.slide_spacing = this.options.width * 2;

        // position navigation
        const nav_pos = this.options.height / 2;
        this._nav.next.setPosition({ top: nav_pos });
        this._nav.previous.setPosition({ top: nav_pos });

        // Position slides
        if (this._isStatic()) {
            // stacked reading mode: slides flow vertically (see .vco-static),
            // so no strip positions — but keep the scroll-spy observing the
            // current set of slides
            for (let i = 0; i < this._slides.length; i++) {
                this._slides[i].updateDisplay(this.options.width, this.options.height, _layout);
            }
            this._initStaticSpy();
        } else {
            for (let i = 0; i < this._slides.length; i++) {
                this._slides[i].updateDisplay(this.options.width, this.options.height, _layout);
                this._slides[i].setPosition({ left: this.slide_spacing * i, top: 0 });
            }
        }

        // Go to the current slide
        this.goTo(this.current_slide, true, true);
    }

    _introInterface() {
        if (this.options.call_to_action && this._slides.length > 0) {
            // `!== ""` treated an absent key as a custom string, so a
            // standalone StorySlider rendered the literal text "undefined".
            const _str =
                typeof this.options.call_to_action_text === "string" &&
                this.options.call_to_action_text !== ""
                    ? this.options.call_to_action_text
                    : Language.messages.start;
            this._slides[0]?.addCallToAction(_str);
            this._slides[0]?.on("call_to_action", this.next, this);
        }

        if (!(this.options.width <= (this.options.skinny_size ?? 0))) {
            this._nav.next.updatePosition(
                { right: "130" },
                false,
                this.options.duration * 3,
                this.options.ease,
                -100,
                true,
            );
            this._nav.previous.updatePosition(
                { left: "-100" },
                true,
                this.options.duration * 3,
                this.options.ease,
                -200,
                true,
            );
        }
    }

    /*	Init
	================================================== */
    _initLayout() {
        this._el.container.className += " vco-storyslider";
        // Static reading mode: stacked slides with scroll-spy navigation
        if (this._isStatic()) {
            this._el.container.classList.add("vco-static");
        }

        // Create Layout
        this._el.slider_container_mask = Dom.create(
            "div",
            "vco-slider-container-mask",
            this._el.container,
        );
        this._el.background = Dom.create("div", "vco-slider-background", this._el.container);
        this._el.slider_container = Dom.create(
            "div",
            "vco-slider-container",
            this._el.slider_container_mask,
        );
        this._el.slider_item_container = Dom.create(
            "div",
            "vco-slider-item-container",
            this._el.slider_container,
        );

        // Accessibility: a polite live region announcing slide changes to
        // screen readers (visually hidden)
        this._el.live_region = Dom.create("div", "vco-sr-only", this._el.container) as HTMLElement;
        this._el.live_region.setAttribute("aria-live", "polite");
        this._el.live_region.setAttribute("role", "status");

        // Update Size
        this.options.width = this._el.container.offsetWidth;
        this.options.height = this._el.container.offsetHeight;

        // Create Navigation
        this._nav.previous = new SlideNav(
            { title: "Previous", description: "description" },
            { direction: "previous" },
        );
        this._nav.next = new SlideNav(
            { title: "Next", description: "description" },
            { direction: "next" },
        );

        // add the navigation to the dom
        this._nav.next.addTo(this._el.container);
        this._nav.previous.addTo(this._el.container);

        this._el.slider_container.style.left = "0px";

        if (Browser.touch) {
            this._swipable = new Swipable(
                this._el.slider_container_mask,
                this._el.slider_container,
                {
                    enable: { x: true, y: false },
                    snap: true,
                },
            );
            this._swipable.enable();

            // Message
            // the swipe hint icon mirrors in right-to-left locales (issue #269)
            const rtl = isRtl();
            this._message = new Message(
                {},
                {
                    message_class: "vco-message-full",
                    message_icon_class: rtl ? "vco-icon-swipe-right" : "vco-icon-swipe-left",
                },
            );
            this._message.updateMessage(Language.buttons.swipe_to_navigate);
            this._message.addTo(this._el.container);
        }
    }

    _initEvents() {
        this._nav.next.on("clicked", this._onNavigation, this);
        this._nav.previous.on("clicked", this._onNavigation, this);

        if (this._message) {
            this._message.on("clicked", this._onMessageClick, this);
        }

        if (this._swipable) {
            this._swipable.on("swipe_left", this._onNavigation, this);
            this._swipable.on("swipe_right", this._onNavigation, this);
            this._swipable.on("swipe_nodirection", this._onSwipeNoDirection, this);
        }

        // issue #472: keyboard navigation (the container is focusable)
        this._el.container.setAttribute("tabindex", "0");
        DomEvent.addListener(this._el.container, "keydown", this._onKeyDown, this);
    }

    _onKeyDown(e: Event) {
        const key = (e as KeyboardEvent).key;
        // don't hijack keys while typing in form fields or media embeds
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        if (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            target?.isContentEditable
        ) {
            return;
        }
        if (key === "ArrowRight" || key === "ArrowDown") {
            DomEvent.preventDefault(e);
            this.next();
        } else if (key === "ArrowLeft" || key === "ArrowUp") {
            DomEvent.preventDefault(e);
            this.previous();
        }
    }

    _initData() {
        // Create Slides and then add them
        this._createSlides(this.data.slides ?? []);
    }

    /*	Events
	================================================== */
    _onBackgroundChange(e: SlideBackgroundChange) {
        const slide_background = this._slides[this.current_slide].getBackground();
        this.changeBackground(e);
        this.fire("colorchange", slide_background);
    }

    _onMessageClick(e?: unknown) {
        this._message.hide();
    }

    _onSwipeNoDirection(e?: unknown) {
        this.goTo(this.current_slide);
    }

    _onNavigation(e: { direction: string | null }) {
        const direction = e.direction;
        if (direction === "next" || direction === "left") {
            this.next();
        } else if (direction === "previous" || direction === "right") {
            this.previous();
        } else {
            return;
        }
        this.fire(`nav_${direction}`, this.data);
    }

    _onSlideAdded(e?: unknown) {
        this.fire("slideAdded", this.data);
    }

    _onSlideChange(displayupdate?: boolean) {
        if (!displayupdate) {
            this.fire("change", {
                current_slide: this.current_slide,
                uniqueid: this._slides[this.current_slide].data.uniqueid,
            });
        }
    }

    _onLoaded() {
        this.fire("loaded", this.data);
        if (this._slides.length > 0) {
            this.fire("title", { title: this._slides[0].title });
        }
    }
}

export default class StorySlider extends Evented<StorySliderEvents, typeof StorySliderBase>(
    StorySliderBase,
) {
    constructor(...args: ConstructorParameters<typeof StorySliderBase>) {
        super(...args);
    }
}
