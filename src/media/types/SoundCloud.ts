import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.SoundCloud
================================================== */

/*	Minimal surface of the SoundCloud widget API used here. */
interface SoundCloudWidget {
    pause: () => void;
}

export default class SoundCloud extends Media {
    declare "media_id": string;
    declare "soundCloudCreated": boolean;
    declare "widget": SoundCloudWidget;

    /*	Load the media
	================================================== */
    async _loadMedia() {
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
        try {
            const r = await fetch(api_url);
            const d = await r.json();
            await this.loadScript("https://w.soundcloud.com/player/api.js");
            //load soundcloud api for pausing.
            this.createMedia(d);
        } catch (err) {
            // aborted loads stay silent (the visitor navigated away);
            // real failures show the media error display
            if ((err as DOMException)?.name !== "AbortError") {
                this.loadErrorDisplay("Unable to load this track.");
            }
        }
    }

    createMedia(d: unknown) {
        const data = d as { html: string };
        if (!data?.html) {
            this.loadErrorDisplay("Unable to load this track.");
            return;
        }
        this._el.content_item.innerHTML = data.html;

        this.soundCloudCreated = true;

        const sc = SC as { Widget: (iframe: Element | null) => SoundCloudWidget };
        // per-instance widget: a global would be overwritten by every
        // SoundCloud slide and _stopMedia would pause the wrong one
        this.widget = sc.Widget(this._el.content_item.querySelector("iframe"));

        // After Loaded
        this.onLoaded();
    }

    _stopMedia() {
        if (this.soundCloudCreated) {
            this.widget?.pause();
        }
    }
}
