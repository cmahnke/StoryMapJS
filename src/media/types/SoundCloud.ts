import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { loadJS } from "../../core/Load";

/*	Media.SoundCloud
================================================== */

/*	Minimal surface of the SoundCloud widget API used here. */
interface SoundCloudWidget {
    pause: () => void;
}

export default class SoundCloud extends Media {
    declare "media_id": string;
    declare "soundCloudCreated": boolean;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-soundcloud vco-media-shadow",
            this._el.content,
        );

        // Get Media ID
        this.media_id = this.data.url;

        // API URL
        const api_url = "https://soundcloud.com/oembed?url=" + this.media_id + "&format=json";

        // API Call
        fetch(api_url).then((r) =>
            r.json().then((d) => {
                loadJS("https://w.soundcloud.com/player/api.js", () => {
                    //load soundcloud api for pausing.
                    this.createMedia(d);
                });
            }),
        );
    }

    createMedia(d) {
        this._el.content_item.innerHTML = d.html;

        this.soundCloudCreated = true;

        const sc = SC as { Widget: (iframe: Element | null) => SoundCloudWidget };
        (self as unknown as { widget: SoundCloudWidget }).widget = sc.Widget(
            this._el.content_item.querySelector("iframe"),
        ); //create widget for api use

        // After Loaded
        this.onLoaded();
    }

    _stopMedia() {
        if (this.soundCloudCreated) {
            (self as unknown as { widget: SoundCloudWidget }).widget.pause();
        }
    }
}
