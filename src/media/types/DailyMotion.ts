import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { ratio } from "../../core/Util";

/*	Media.DailyMotion
================================================== */

export default class DailyMotion extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-dailymotion",
            this._el.content,
        );

        // Get Media ID
        const id = this.data.url.match("video")
            ? this.data.url.split("video/")[1]
            : this.data.url.split("embed/")[1];
        if (!id) {
            throw new Error("Invalid DailyMotion URL");
        }
        this.media_id = id.split(/[?&]/)[0];

        // API URL
        const api_url =
            "https://www.dailymotion.com/embed/video/" + this.media_id + "?api=postMessage";

        // API Call
        this._el.content_item.innerHTML =
            "<iframe autostart='false' frameborder='0' width='100%' height='100%' src='" +
            api_url +
            "'></iframe>";

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height =
            ratio.r16_9({ w: this._el.content_item.offsetWidth }) + "px";
    }

    _stopMedia() {
        const iframe = this._el.content_item?.querySelector("iframe") as HTMLIFrameElement | null;
        iframe?.contentWindow?.postMessage('{"command":"pause","parameters":[]}', "*");
    }
}
