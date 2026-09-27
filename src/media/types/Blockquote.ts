import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { sanitizeBlockquote } from "../EmbedUtil";

/*	Media.Blockquote
================================================== */

export default class Blockquote extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-blockquote",
            this._el.content,
        );

        // Get Media ID
        this.media_id = this._url();

        // The url field holds user-pasted blockquote markup. Sanitize it
        // instead of injecting the raw markup, which would allow stored
        // XSS via the storymap JSON.
        this._el.content_item.appendChild(sanitizeBlockquote(this.media_id));

        // After Loaded
        this.onLoaded();
    }

    updateMediaDisplay() {}

    _updateMediaDisplay() {}
}
