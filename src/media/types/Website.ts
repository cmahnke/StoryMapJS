import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { validateWebURL } from "../EmbedUtil";

/*	Media.Website
	An <iframe> pointed straight at a URL. Shared with the DocumentCloud
	type, which is the same embed with a different CSS class.
================================================= */

export class WebsiteBase extends Media {
    declare "media_id": string;

    /** Extra class on the wrapper element, e.g. "vco-media-documentcloud". */
    protected extraClass(): string {
        return "";
    }

    _loadMedia() {
        this.loadingMessage();

        const classes = `vco-media-item vco-media-iframe ${this.extraClass()}`.trim();
        const content_item = Dom.create("div", classes, this._el.content);
        this._el.content_item = content_item;

        this.media_id = this._url();
        // rebuilt from a validated src: injecting the raw URL as markup would
        // allow stored XSS via the storymap JSON
        const src = validateWebURL(this.media_id);
        if (!src) {
            this.loadErrorDisplay("Invalid URL.");
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.setAttribute("src", src);
        content_item.appendChild(iframe);
        this.onLoaded();
    }

    _updateMediaDisplay() {
        if (this._el.content_item) {
            this._el.content_item.style.height = Number(this.options.height ?? 0) + "px";
        }
    }
}

export default class Website extends WebsiteBase {}
