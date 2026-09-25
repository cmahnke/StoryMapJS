import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/* IIIF Image API 2/3 URL tail: .../region/size/rotation/quality.format
   (optionally a query string). Used to request container-matched widths
   instead of the full-size image (perf, backwards-compatible). */
const IIIF_TAIL =
    /\/(full|max|pct:[\d.]+|\d+,?\d*)\/(full|max|pct:[\d.]+|\d+,?\d*)\/(\d+|full)\/(default|color|gray|bitonal)\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;

/**
 * Rewrite an IIIF Image API URL to the given pixel width (`w,` size
 * component, height unconstrained). Returns the URL unchanged when it is
 * not a recognizable IIIF image URL.
 */
export function iiifSizedUrl(url: string | null, width: number): string | null {
    if (!url || !(width > 0)) {
        return url;
    }
    const match = url.match(IIIF_TAIL);
    if (!match) {
        return url;
    }
    return (
        url.slice(0, match.index) +
        `/${match[1]}/${width},/${match[3]}/${match[4]}.${match[5]}${match[6] ?? ""}`
    );
}

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

        const img = this._el.content_item as HTMLImageElement;
        // offscreen/preloaded slides stay lazy (the active slide is
        // upgraded to eager on activation, see Slide.setActive); decoding
        // is only a hint — old browsers ignore both attributes
        img.decoding = "async";
        img.loading = this._state.eager ? "eager" : "lazy";
        // responsive sizes (perf): IIIF image URLs request a container-
        // matched width; author-provided srcset/sizes pass through;
        // everything else renders byte-identically
        const media_width = Number(this.options.width) || 0;
        const sized = iiifSizedUrl(this.data.url, media_width);
        img.src = sized ?? this.data.url;
        // accessibility: explicit alt text, falling back to the caption as
        // plain text; an empty string marks a decorative image
        img.alt = this._altText();
        if (this.data.srcset) {
            img.srcset = this.data.srcset as string;
        }
        if (this.data.sizes) {
            img.sizes = this.data.sizes as string;
        }
    }

    _altText(): string {
        const alt = this.data.alt as string | undefined;
        if (alt !== undefined && alt !== "") {
            return alt;
        }
        const caption = this.data.caption as string | null | undefined;
        if (caption) {
            return caption
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        }
        return "";

        this.onLoaded();
    }

    _updateMediaDisplay(layout?: string) {
        // modern browsers size media correctly without engine-specific fixes
    }
}
