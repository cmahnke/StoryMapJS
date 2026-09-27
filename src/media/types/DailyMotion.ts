import { dailymotionId } from "../embedId";
import { Media } from "../Media";
import Dom from "../../dom/Dom";

/*	Media.DailyMotion
================================================== */

export default class DailyMotion extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-dailymotion",
            this._el.content,
        );

        // Get Media ID
        this.media_id = dailymotionId(this._url()) ?? "";
        if (!this.media_id) {
            throw new Error("Invalid DailyMotion URL");
        }

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
        this._sizeContentItemTo16x9();
    }

    _stopMedia() {
        const iframe = this._el.content_item?.querySelector("iframe") as HTMLIFrameElement | null;
        iframe?.contentWindow?.postMessage('{"command":"pause","parameters":[]}', "*");
    }
}
