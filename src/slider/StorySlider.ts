import { mergeData, unique_ID, findArrayNumberByUniqueID, parseCssColor, slideTransitionDuration } from "../core/Util";
import { Evented, type EventedInstance } from "../core/mixins";
import Dom from "../dom/Dom";
import { DomEvent } from "../dom/DomEvent";
import { easeInOutQuint } from "../animation/easings";
import SlideNav from "./SlideNav";
import Slide from "./Slide";
import Animate from "morpheus";
import Swipable from "../ui/Swipable";
import Message from "../ui/Message";
import { Browser } from "../core/Browser";
import { Language } from "../language/Language";
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
    dragging?: boolean;
    trackResize?: boolean;
    [key: string]: unknown;
}

interface SlideBackgroundChange {
    color_value?: string;
    image?: boolean;
}

class StorySliderBase {
    declare "_el": Record<string, HTMLElement>;
    declare "_nav": { previous: SlideNav; next: SlideNav };
    declare "slide_spacing": number;
    declare "_slides": Slide[];
    declare "_swipable": Swipable;
    declare "preloadTimer": ReturnType<typeof setTimeout>;
    declare "_message": Message;
    declare "current_slide": number;
    declare "current_bg_color": string | null;
    declare "data": Partial<StorymapData>;
    declare "options": StorySliderOptions;
    declare "animator": AnimationHandle | null;
    declare "animator_background": AnimationHandle | null;
    declare "fire": EventedInstance["fire"];
    declare "_loaded": boolean;
    declare "hasEventListeners": EventedInstance["hasEventListeners"];

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
            background: {} as HTMLElement,
            slider_container_mask: {} as HTMLElement,
            slider_container: {} as HTMLElement,
            slider_item_container: {} as HTMLElement,
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
            // interaction
            dragging: true,
            trackResize: true,
        };

        // Main element ID
        if (typeof elem === "object") {
            this._el.container = elem;
            this.options.id = unique_ID(6, "vco");
        } else {
            this.options.id = elem;
            this._el.container = Dom.get(elem);
        }

        if (!this._el.container.id) {
            this._el.container.id = this.options.id;
        }

        // Animation Object
        this.animator = null;
        this.animator_background = null;

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
        for (let i = 0; i < array.length; i++) {
            if (array[i].uniqueid === "") {
                array[i].uniqueid = unique_ID(6, "vco-slide");
            }
            if (i === 0) {
                this._createSlide(array[i], true);
            } else {
                this._createSlide(array[i], false);
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
    }

    /*	Message
	================================================== */

    /*	Navigation
	================================================== */
    goToId(n: string | number, fast?: boolean, displayupdate?: boolean) {
        let _n;
        if (typeof n == "string" || (n as unknown) instanceof String) {
            _n = findArrayNumberByUniqueID(String(n), this._slides, "uniqueid");
        } else {
            _n = n;
        }
        this.goTo(_n, fast, displayupdate);
    }

    goTo(n: number, fast?: boolean, displayupdate?: boolean) {
        this.changeBackground({ color_value: "", image: false });

        // Clear Preloader Timer (covers both the setTimeout fallback and
        // the requestIdleCallback handle below — both are numbers)
        if (this.preloadTimer) {
            clearTimeout(this.preloadTimer);
            (
                window as unknown as { cancelIdleCallback?: (handle: number) => void }
            ).cancelIdleCallback?.(this.preloadTimer as unknown as number);
        }

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

            if (fast) {
                this._el.slider_container.style.left = -(this.slide_spacing * n) + "px";
                this._onSlideChange(displayupdate);
            } else {
                // fire the change event at animation start so the map and the
                // slider animate simultaneously
                this._onSlideChange(displayupdate);
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
                this.preloadTimer = w.requestIdleCallback(() => this.preloadSlides(), {
                    timeout: this.options.duration,
                }) as unknown as ReturnType<typeof setTimeout>;
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

        if (bg.color_value) {
            // any CSS color; unparseable values fall back to the default
            bg_color = parseCssColor(bg.color_value) || this.options.default_bg_color;
        } else {
            bg_color = this.options.default_bg_color;
        }

        // Stop animation
        if (this.animator_background) {
            this.animator_background.stop();
        }

        const bg_color_rgb = bg_color.r + "," + bg_color.g + "," + bg_color.b;

        if (!this.current_bg_color || this.current_bg_color !== bg_color_rgb) {
            this.current_bg_color = bg_color_rgb;
            do_animation = true;
        }

        if (do_animation) {
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
                duration: this.options.duration / 2,
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
            duration: this.options.duration / 2,
            easing: this.options.ease,
        });
    }

    /*	Private Methods
	================================================== */

    // Update Display
    _updateDisplay(width?: number, height?: number, animate?: unknown, layout?: string) {
        let _layout;

        if (typeof layout === "undefined") {
            _layout = this.options.layout;
        } else {
            _layout = layout;
        }

        this.options.layout = _layout;

        this.slide_spacing = this.options.width * 2;

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

        // position navigation
        const nav_pos = this.options.height / 2;
        this._nav.next.setPosition({ top: nav_pos });
        this._nav.previous.setPosition({ top: nav_pos });

        // Position slides
        for (let i = 0; i < this._slides.length; i++) {
            this._slides[i].updateDisplay(this.options.width, this.options.height, _layout);
            this._slides[i].setPosition({ left: this.slide_spacing * i, top: 0 });
        }

        // Go to the current slide
        this.goTo(this.current_slide, true, true);
    }

    _introInterface() {
        if (this.options.call_to_action) {
            let _str = Language.messages.start;
            if (this.options.call_to_action_text !== "") {
                _str = this.options.call_to_action_text;
            }
            this._slides[0].addCallToAction(_str);
            this._slides[0].on("call_to_action", this.next, this);
        }

        if (this.options.width <= this.options.skinny_size) {
            // hidden when skinny
        } else {
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
            this._message = new Message(
                {},
                {
                    message_class: "vco-message-full",
                    message_icon_class: "vco-icon-swipe-left",
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
        this._createSlides(this.data.slides);
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

    _onNavigation(e: { direction: string }) {
        if (e.direction === "next" || e.direction === "left") {
            this.next();
        } else if (e.direction === "previous" || e.direction === "right") {
            this.previous();
        }
        this.fire("nav_" + e.direction, this.data);
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

export default class StorySlider extends Evented(StorySliderBase) {
    constructor(...args: ConstructorParameters<typeof StorySliderBase>) {
        super(...args);
    }
}
