import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.Vimeo
================================================== */

export default class Audio extends Media {
    declare "player_element": HTMLMediaElement;

    /*	Load the media
	================================================== */
    _loadMedia() {
        const _api_url = "";

        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "audio",
            "vco-media-item vco-media-audio vco-media-shadow",
            this._el.content,
        );
        const media_item = this._el.content_item as HTMLMediaElement;
        media_item.controls = true;
        this._el.source_item = Dom.create("source", "", this._el.content_item);
        const source_item = this._el.source_item as HTMLSourceElement;

        // Media Loaded Event
        media_item.addEventListener("canplay", (e) => {
            console.log("load event", e);
            this.onLoaded();
        });

        source_item.src = this.data.url;
        source_item.type = this._getType(this.data.url, this.data.mediatype.match_str);
        media_item.innerHTML += "Your browser doesn't support HTML5 video with " + source_item.type;
        this.player_element = media_item;
    }

    // Update Media Display
    _updateMediaDisplay() {
        // left over from Vimeo...
        // this._el.content_item.style.height = ratio.r16_9({w:this._el.content_item.offsetWidth}) + "px";
    }

    _stopMedia() {
        if (this.player_element) {
            this.player_element.pause();
        }
    }

    _getType(url: string, reg: string | RegExp) {
        const ext = url.match(reg);
        let type = "audio/";
        switch (ext[1]) {
            case "mp3":
                type += "mpeg";
                break;
            case "wav":
                type += "wav";
                break;
            case "m4a":
                type += "mp4";
                break;
            default:
                type = "audio";
                break;
        }
        return type;
    }
}
