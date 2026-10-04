import { mergeData, htmlify, convertUnixTime } from "../../core/Util";
import { Evented, type EventedInstance } from "../../core/mixins";
import Dom from "../../dom/Dom";
import { sanitizeSlideText } from "../EmbedUtil";

interface TextData {
    uniqueid?: string | null;
    headline?: string;
    text?: string;
    text_align?: string;
    date?: { created_time?: string; [key: string]: unknown } | null;
}

interface TextOptions {
    title?: boolean;
    text_align?: string;
    /** BCP 47 tag for the slide text (from `StorymapSlide.language`). */
    language?: string;
}

export interface TextEvents {
    loaded: TextData;
    added: TextData;
    removed: TextData;
}

class TextBase {
    declare "_el": Record<string, HTMLElement>;
    declare "data": TextData;
    declare "options": TextOptions;
    declare "fire": EventedInstance<TextEvents>["fire"];

    /*	Constructor
	================================================== */
    constructor(data: TextData, options?: TextOptions, add_to_container?: HTMLElement) {
        // DOM ELEMENTS
        this._el = {
            container: {} as HTMLElement,
            content_container: {} as HTMLElement,
            content: {} as HTMLElement,
            headline: {} as HTMLElement,
            date: {} as HTMLElement,
            start_btn: {} as HTMLElement,
        };

        // Data. The placeholders were the literal strings "headline" and
        // "text", which mergeData only overwrites when the key is present — so
        // a slide with body text and no headline rendered an <h2>headline</h2>.
        // The renderer guards both on `!== ""`, so empty is the real default.
        this.data = {
            uniqueid: "",
            headline: "",
            text: "",
        };

        // Options
        this.options = {
            title: false,
        };

        mergeData(this.data, data);

        // Merge Options
        mergeData(this.options, options);

        this._el.container = Dom.create("div", "vco-text");
        this._el.container.id = this.data.uniqueid ?? "";
        // Pronounce mixed-language slides correctly: the reader reports
        // which language map it picked, and the DOM should say so too.
        if (
            typeof this.options.language === "string" &&
            this.options.language !== "" &&
            this.options.language !== "none"
        ) {
            this._el.container.setAttribute("lang", this.options.language);
        }

        this._initLayout();

        if (add_to_container) {
            add_to_container.appendChild(this._el.container);
        }
    }

    /*	Adding, Hiding, Showing etc
	================================================== */
    show() {}

    hide() {}

    addTo(container: HTMLElement) {
        container.appendChild(this._el.container);
        //this.onAdd();
    }

    removeFrom(container: HTMLElement) {
        container.removeChild(this._el.container);
    }

    headlineHeight() {
        return this._el.headline.offsetHeight + 40;
    }

    addDateText(str: string) {
        if (this._el.date) {
            this._el.date.innerHTML = str;
        }
    }

    /*	Events
	================================================== */
    onLoaded() {
        this.fire("loaded", this.data);
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
        // Create Layout
        this._el.content_container = Dom.create(
            "div",
            "vco-text-content-container",
            this._el.container,
        );

        // Text alignment: per-slide override wins, then the storymap option
        // (issue #244)
        const align =
            (this.data.text_align as string | undefined) ??
            (this.options.text_align as string | undefined) ??
            "left";
        if (align === "center" || align === "right") {
            this._el.content_container.classList.add("vco-text-align-" + align);
        }

        // Date (only rendered when the slide has one; issue #286)
        if (this.data.date && this.data.date.created_time && this.data.date.created_time !== "") {
            this._el.date = Dom.create("h3", "vco-headline-date", this._el.content_container);
            this.addDateText(convertUnixTime(this.data.date.created_time));
        }

        // Headline (sanitized; issue #358 keeps formatting but drops scripts)
        const headline = this.data.headline ?? "";
        if (headline !== "") {
            let headline_class = "vco-headline";
            if (this.options.title) {
                headline_class = "vco-headline vco-headline-title";
            }
            this._el.headline = Dom.create("h2", headline_class, this._el.content_container);
            this._el.headline.appendChild(sanitizeSlideText(headline));
        }

        // Text (sanitized; issue #358 allows extra iframe media in the text field)
        const text = this.data.text ?? "";
        if (text !== "") {
            let text_content = "";

            text_content += htmlify(text);

            // Date
            if (
                this.data.date &&
                this.data.date.created_time &&
                this.data.date.created_time !== ""
            ) {
                if (this.data.date.created_time.length > 10) {
                    text_content +=
                        "<div class='vco-text-date'>" +
                        convertUnixTime(this.data.date.created_time) +
                        "</div>";
                }
            }

            this._el.content = Dom.create("div", "vco-text-content", this._el.content_container);
            this._el.content.appendChild(sanitizeSlideText(text_content));
        }

        // Fire event that the slide is loaded
        this.onLoaded();
    }
}

export default class Text extends Evented<TextEvents, typeof TextBase>(TextBase) {
    constructor(...args: ConstructorParameters<typeof TextBase>) {
        super(...args);
    }
}
