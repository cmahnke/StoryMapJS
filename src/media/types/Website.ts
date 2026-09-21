import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { validateWebURL } from "../EmbedUtil";

/*	Media.Website
================================================= */

export default class Website extends Media {
    declare "media_id": string;

    _loadMedia() {
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe",
            this._el.content,
        );
        this.media_id = this.data.url;
        // rebuild a clean iframe from a validated src: injecting the raw
        // URL as markup would allow stored XSS via the storymap JSON
        const src = validateWebURL(this.media_id);
        if (!src) {
            this.loadErrorDisplay("Invalid URL.");
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.setAttribute("src", src);
        this._el.content_item.appendChild(iframe);
        this.onLoaded();
    }

    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
