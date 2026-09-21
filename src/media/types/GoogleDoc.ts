import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { validateWebURL } from "../EmbedUtil";

/*	Media.GoogleDoc

================================================= */

export default class GoogleDoc extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe",
            this._el.content,
        );

        // Get Media ID
        this.media_id = this.data.url;

        // Rebuild a clean iframe from a validated src: injecting the raw
        // URL into markup would allow stored XSS via the storymap JSON
        const src = validateWebURL(this.media_id);
        if (!src) {
            this.loadErrorDisplay("Invalid URL.");
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.className = "doc";
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("width", "100%");
        iframe.setAttribute("height", "100%");
        if (this.media_id.match(/docs.google.com/i)) {
            iframe.setAttribute("src", src + "&embedded=true");
        } else {
            iframe.setAttribute(
                "src",
                "http://docs.google.com/viewer?url=" + encodeURIComponent(src) + "&embedded=true",
            );
        }
        this._el.content_item.appendChild(iframe);

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
