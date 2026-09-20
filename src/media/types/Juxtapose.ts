import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.Juxtapose
	Embeds a JuxtaposeJS before/after slider (issue #360)
================================================== */

export default class Juxtapose extends Media {
    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-juxtapose",
            this._el.content,
        );

        // published Juxtapose URLs are iframe-ready embeds
        this._el.content_item.innerHTML = `<iframe src="${this.data.url}" />`;
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
