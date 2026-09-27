import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { buildIframe } from "../EmbedUtil";

/*	Media.Juxtapose
	Embeds a JuxtaposeJS before/after slider (issue #360)
================================================== */

export default class Juxtapose extends Media {
    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-juxtapose",
            this._el.content,
        );

        // Built through buildIframe rather than an `<iframe src="${url}">`
        // template string: interpolating a storymap-JSON string into markup
        // is a stored-XSS break-out (`"><img src=x onerror=...>`), and
        // MediaType routes *any* URL containing "juxtapose" here.
        const embed = buildIframe(`<iframe src="${String(this._url() ?? "")}"></iframe>`);
        if (!embed) {
            this.loadErrorDisplay("Invalid URL.");
            return;
        }
        embed.setAttribute("loading", "lazy");
        this._el.content_item.appendChild(embed);
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._sizeContentItemToOptionHeight();
    }
}
