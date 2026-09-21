import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.Vimeo
================================================== */

export default class Video extends Media {
    declare "player_element": HTMLMediaElement;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "video",
            "vco-media-item vco-media-video vco-media-shadow",
            this._el.content,
        );
        const media_item = this._el.content_item as HTMLMediaElement;
        media_item.controls = true;
        this._el.source_item = Dom.create("source", "", this._el.content_item);
        const source_item = this._el.source_item as HTMLSourceElement;

        // Media Loaded Event
        media_item.addEventListener("canplay", () => {
            this.onLoaded();
        });

        // Load Error Event (the source element fires it, not the media element)
        source_item.addEventListener("error", () => {
            this.loadErrorDisplay(Language.messages.error + " " + this.options.media_name);
        });

        source_item.src = this.data.url;
        const media_type = this._getType(this.data.url, this.data.mediatype.match_str);
        if (media_type) {
            source_item.type = media_type;
        }
        // append as a text node: re-serializing innerHTML would replace the
        // source element and drop its error listener, leaving the loading
        // message on screen forever
        media_item.appendChild(
            document.createTextNode(
                "Your browser doesn't support HTML5 video with " + source_item.type,
            ),
        );
        this.player_element = media_item;
    }

    // Update Media Display
    _updateMediaDisplay() {
        // video height is CSS-driven; nothing to compute here
    }

    _stopMedia() {
        if (this.player_element) {
            this.player_element.pause();
        }
    }

    _getType(url: string, reg: string | RegExp) {
        const ext = url.match(reg);
        let type = "video/";
        if (!ext) {
            return type;
        }
        switch (ext[1]) {
            case "mp4":
                type += "mp4";
                break;
            case "webm":
                type += "webm";
                break;
            default:
                type = "";
                break;
        }
        return type;
    }
}
