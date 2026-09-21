import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { validateWebURL } from "../EmbedUtil";

/*	Media.DocumentCloud
	Embeds a DocumentCloud document viewer (issue #437)
================================================= */

export default class DocumentCloud extends Media {
    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-documentcloud",
            this._el.content,
        );

        // the canonical document URL renders the standalone viewer; rebuilt
        // from a validated src to keep stored XSS out of the storymap JSON
        const src = validateWebURL(this.data.url);
        if (!src) {
            this.loadErrorDisplay("Invalid URL.");
            return;
        }
        const iframe = document.createElement("iframe");
        iframe.setAttribute("src", src);
        this._el.content_item.appendChild(iframe);
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
