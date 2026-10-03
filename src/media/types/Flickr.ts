import { flickrId } from "../embedId";
import { Media } from "../Media";
import Dom from "../../dom/Dom";

/*	Media.Flickr

================================================== */

export default class Flickr extends Media {
    declare "media_id": string;
    /** The `load` handler on the image, stored so dispose() can detach it. */
    declare "_onLoad": (() => void) | null;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create(
            "img",
            "vco-media-item vco-media-image vco-media-flickr vco-media-shadow",
            this._el.content,
        );

        // Media Loaded Event. The reference is kept so dispose() can detach
        // it: an inline arrow function has no other handle.
        this._onLoad = () => {
            this.onMediaLoaded();
        };
        this._el.content_item.addEventListener("load", this._onLoad);

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
        // threw a bare string (not an Error) and could assign `undefined` when
        // the URL had the host but no photo segment
        const id = flickrId(this._url());
        if (!id) {
            throw new Error("Invalid Flickr URL");
        }
        this.media_id = id;
    }

    createMedia(d: unknown) {
        const data = d as { sizes: { size: { label: string; source: string }[] } };
        const best_size = this.sizes(Number(this.options.height ?? 0));
        const sizes = data?.sizes?.size;
        if (!sizes || !sizes.length) {
            this.loadErrorDisplay("Photo not found or private.");
            return;
        }
        let size = sizes[Math.max(0, sizes.length - 2)].source;

        for (let i = 0; i < sizes.length; i++) {
            if (sizes[i].label === best_size) {
                size = sizes[i].source;
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

    _disposeMedia(): void {
        if (this._onLoad) {
            this._el.content_item?.removeEventListener("load", this._onLoad);
            this._onLoad = null;
        }
    }
}
