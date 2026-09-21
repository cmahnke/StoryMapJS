import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.Flickr

================================================== */

export default class Flickr extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "img",
            "vco-media-item vco-media-image vco-media-flickr vco-media-shadow",
            this._el.content,
        );

        // Media Loaded Event
        this._el.content_item.addEventListener("load", (e) => {
            this.onMediaLoaded();
        });

        // Get Media ID
        this.establishMediaID();

        const api_url =
            "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" +
            this.options.api_key_flickr +
            "&photo_id=" +
            this.media_id +
            "&format=json&nojsoncallback=1";

        void this._fetchSizes(api_url);
    }

    async _fetchSizes(api_url: string) {
        try {
            const response = await fetch(api_url);
            const d = (await response.json()) as { stat: string };
            if (d.stat === "ok") {
                this.createMedia(d);
            } else {
                this.loadErrorDisplay("Photo not found or private.");
            }
        } catch {
            this.loadErrorDisplay("Photo not found or private.");
        }
    }

    establishMediaID() {
        const marker = "flickr.com/photos/";
        const idx = this.data.url.indexOf(marker);
        if (idx === -1) {
            throw "Invalid Flickr URL";
        }
        const pos = idx + marker.length;
        this.media_id = this.data.url.slice(pos).split("/")[1];
    }

    createMedia(d: unknown) {
        const data = d as { sizes: { size: { label: string; source: string }[] } };
        const best_size = this.sizes(this.options.height);
        let size = data.sizes.size[data.sizes.size.length - 2].source;

        for (let i = 0; i < data.sizes.size.length; i++) {
            if (data.sizes.size[i].label === best_size) {
                size = data.sizes.size[i].source;
            }
        }

        // Set Image Source
        (this._el.content_item as HTMLImageElement).src = size;

        // After Loaded
        this.onLoaded();
    }

    sizes(s: number): string {
        let _size;

        if (s <= 75) {
            if (s <= 0) {
                _size = "Large";
            } else {
                _size = "Thumbnail";
            }
        } else if (s <= 180) {
            _size = "Small";
        } else if (s <= 240) {
            _size = "Small 320";
        } else if (s <= 375) {
            _size = "Medium";
        } else if (s <= 480) {
            _size = "Medium 640";
        } else if (s <= 600) {
            _size = "Large";
        } else {
            _size = "Large";
        }

        return _size;
    }
}
