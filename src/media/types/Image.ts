import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { Browser } from "../../core/Browser";

/*	Media.Image
	Produces image assets.
	Takes a data object and populates a dom object
================================================== */

export default class Image extends Media {
    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Link
        if (this.data.link) {
            this._el.content_link = Dom.create("a", "", this._el.content);
            const content_link = this._el.content_link as HTMLAnchorElement;
            content_link.href = this.data.link;
            content_link.target = "_blank";
            this._el.content_item = Dom.create(
                "img",
                "vco-media-item vco-media-image vco-media-shadow",
                this._el.content_link,
            );
        } else {
            this._el.content_item = Dom.create(
                "img",
                "vco-media-item vco-media-image vco-media-shadow",
                this._el.content,
            );
        }

        // Media Loaded Event
        this._el.content_item.addEventListener("load", (e) => {
            this.onMediaLoaded();
        });

        (this._el.content_item as HTMLImageElement).src = this.data.url;

        this.onLoaded();
    }

    _updateMediaDisplay(layout?: string) {
        // modern browsers size media correctly without engine-specific fixes
    }
}
