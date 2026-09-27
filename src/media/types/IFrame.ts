import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { buildIframe } from "../EmbedUtil";

/*	Media.IFrame
================================================== */

export default class IFrame extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe",
            this._el.content,
        );

        // Get Media ID
        this.media_id = this._url();

        // The url field holds a user-pasted embed snippet. Rebuild a
        // clean iframe from its src instead of injecting the raw markup,
        // which would allow stored XSS via the storymap JSON.
        const iframe = buildIframe(this.media_id);

        if (!iframe) {
            this.loadErrorDisplay(
                "Invalid embed code. Paste an iframe embed code with an http(s) source URL.",
            );
            return;
        }

        // API Call
        this._el.content_item.appendChild(iframe);

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._sizeContentItemToOptionHeight();
    }
}
