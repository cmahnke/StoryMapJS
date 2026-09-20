import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.DocumentCloud
	Embeds a DocumentCloud document viewer (issue #437)
================================================== */

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

        // the canonical document URL renders the standalone viewer
        this._el.content_item.innerHTML = `<iframe src="${this.data.url}" />`;
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
