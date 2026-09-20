import { mergeData, setData, htmlify, convertUnixTime } from "../../core/Util";
import { Evented, type EventedInstance } from "../../core/mixins";
import Dom from "../../dom/Dom";

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
}

class TextBase {
    declare "_el": Record<string, HTMLElement>;
    declare "data": TextData;
    declare "options": TextOptions;
    declare "fire": EventedInstance["fire"];

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

        // Data
        this.data = {
            uniqueid: "",
            headline: "headline",
            text: "text",
        };

        // Options
        this.options = {
            title: false,
        };

        setData(this, data);

        // Merge Options
        mergeData(this.options, options);

        this._el.container = Dom.create("div", "vco-text");
        this._el.container.id = this.data.uniqueid;

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

        // Headline
        if (this.data.headline !== "") {
            let headline_class = "vco-headline";
            if (this.options.title) {
                headline_class = "vco-headline vco-headline-title";
            }
            this._el.headline = Dom.create("h2", headline_class, this._el.content_container);
            this._el.headline.innerHTML = this.data.headline;
        }

        // Text
        if (this.data.text !== "") {
            let text_content = "";

            text_content += htmlify(this.data.text);

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
            this._el.content.innerHTML = text_content;
        }

        // Fire event that the slide is loaded
        this.onLoaded();
    }
}

export default class Text extends Evented(TextBase) {
    constructor(...args: ConstructorParameters<typeof TextBase>) {
        super(...args);
    }
}
