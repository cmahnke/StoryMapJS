import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.HtmlMedia
	Shared implementation for the <audio> and <video> types. The two differ
	only in the element name, the CSS class, the fallback text and the
	file extension -> MIME map, so all of that is data here.
================================================== */

/** The element this media type plays. */
export type HtmlMediaKind = "audio" | "video";

interface HtmlMediaSpec {
    /** The element to create. */
    kind: HtmlMediaKind;
    /** File extension (lowercase, no dot) -> MIME subtype. */
    extensions: Record<string, string>;
}

const AUDIO_DEFAULT: HtmlMediaSpec = { kind: "audio", extensions: { mp3: "mpeg" } };

/** MIME subtype for a file extension, or "" when it is not recognised. */
function mimeSubtype(ext: string, spec: HtmlMediaSpec): string {
    return spec.extensions[ext.toLowerCase()] ?? "";
}

/** The behaviour shared by the audio and video media types. */
export class HtmlMediaBase extends Media {
    declare "player_element": HTMLMediaElement | null;

    /**
     * The per-kind differences. Overridden by the Audio/Video subclasses; the
     * base value is never used (an HtmlMediaBase is always subclassed).
     */
    protected spec(): HtmlMediaSpec {
        return AUDIO_DEFAULT;
    }

    _loadMedia() {
        const spec = this.spec();
        this.loadingMessage();

        const media_item = Dom.create(
            spec.kind,
            `vco-media-item vco-media-${spec.kind} vco-media-shadow`,
            this._el.content,
        ) as HTMLMediaElement;
        this._el.content_item = media_item;
        media_item.controls = true;

        const source_item = Dom.create("source", "", media_item) as HTMLSourceElement;
        this._el.source_item = source_item;

        // Media Loaded Event
        media_item.addEventListener("canplay", () => {
            this.onLoaded();
        });

        // Load Error Event (the source element fires it, not the media element)
        source_item.addEventListener("error", () => {
            this.loadErrorDisplay(Language.messages.error + " " + this.options.media_name);
        });

        const url = this._url();
        source_item.src = url;
        const media_type = this._getType(url, spec);
        // An unrecognised extension leaves the type unset so the browser can
        // work it out from the URL — setting a bare "audio/" (as this used to)
        // is not a valid MIME type and makes the source fail outright.
        if (media_type) {
            source_item.type = media_type;
        }
        // append as a text node: re-serializing innerHTML would replace the
        // source element and drop its error listener, leaving the loading
        // message on screen forever
        media_item.appendChild(
            document.createTextNode(
                `Your browser doesn't support HTML5 ${spec.kind} with ` + source_item.type,
            ),
        );
        this.player_element = media_item;
    }

    // Update Media Display
    _updateMediaDisplay() {
        // the height is CSS-driven; nothing to compute here
    }

    _stopMedia() {
        this.player_element?.pause();
    }

    _getType(url: string, spec: HtmlMediaSpec): string {
        const ext = url.match((this.data.mediatype as { match_str: string | RegExp }).match_str);
        if (!ext) {
            return "";
        }
        return mimeSubtype(ext[1], spec);
    }
}
