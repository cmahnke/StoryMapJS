import { vimeoId } from "../embedId";
import { Media } from "../Media";
import Dom from "../../dom/Dom";

/*	Media.Vimeo
================================================== */

export default class Vimeo extends Media {
    declare "media_id": string;
    declare "player": HTMLIFrameElement;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-vimeo vco-media-shadow",
            this._el.content,
        );

        // Get Media ID
        this.media_id = vimeoId(this._url()) ?? "";
        if (!this.media_id) {
            throw new Error("Invalid Vimeo URL");
        }

        // API URL — plain `&` separators. The HTML entity `&amp;` is correct
        // inside markup but is not decoded in a URL property, so Vimeo was
        // receiving params literally named `amp;byline` / `amp;color` and
        // ignoring them.
        const api_url =
            "https://player.vimeo.com/video/" +
            this.media_id +
            "?api=1&title=0&byline=0&portrait=0&color=ffffff";

        this.player = Dom.create("iframe", "", this._el.content_item) as HTMLIFrameElement;
        this.player.width = "100%";
        this.player.height = "100%";
        this.player.frameBorder = "0";
        this.player.src = api_url;

        // After Loaded
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._sizeContentItemTo16x9();
    }

    _stopMedia() {
        try {
            this.player?.contentWindow?.postMessage(
                JSON.stringify({ method: "pause" }),
                "https://player.vimeo.com",
            );
        } catch (err) {
            console.warn("StoryMapJS: error pausing Vimeo player.", err);
        }
    }
}
