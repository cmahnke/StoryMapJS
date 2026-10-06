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
    declare "_onCanPlay": (() => void) | null;
    declare "_onEnded": (() => void) | null;
    declare "_onSourceError": (() => void) | null;

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
        const captionText =
            typeof this.data.caption === "string"
                ? this.data.caption
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                : "";
        const mediaName =
            typeof this.options.media_name === "string" ? this.options.media_name : "";
        media_item.setAttribute(
            "aria-label",
            captionText || mediaName || (spec.kind === "audio" ? "Audio" : "Video"),
        );

        const source_item = Dom.create("source", "", media_item) as HTMLSourceElement;
        this._el.source_item = source_item;

        // Media Loaded Event. The references are kept so dispose() can detach
        // them: an inline arrow function has no other handle.
        this._onEnded = null;
        // Playback flags (slideshow audio terms): loop repeats, offset seeks
        // once the metadata is available, play:"auto" starts on load
        // (absent stays click-to-play with controls, as before).
        const bag = this.data as {
            loop?: boolean;
            offset?: number;
            play?: string;
        };
        media_item.loop = bag.loop === true;
        const offset =
            typeof bag.offset === "number" && Number.isFinite(bag.offset) && bag.offset > 0
                ? bag.offset
                : 0;
        const seek = () => {
            if (offset <= 0) return;
            try {
                media_item.currentTime = offset;
            } catch {
                // pre-metadata seek throws in some browsers; canplay retries
            }
        };
        const autoplay = bag.play === "auto";
        this._onCanPlay = () => {
            seek();
            if (autoplay) {
                void media_item.play()?.catch?.(() => {
                    // autoplay policy or missing gesture: controls stay for
                    // the visitor, like a click-armed slide
                });
            }
            this.onLoaded();
        };
        // offset with metadata already present (cached media): seek now too
        if (offset > 0) {
            if (media_item.readyState >= 1) {
                seek();
            } else {
                media_item.addEventListener(
                    "loadedmetadata",
                    () => {
                        seek();
                    },
                    { once: true },
                );
            }
        }
        media_item.addEventListener("canplay", this._onCanPlay);

        // Load Error Event (the source element fires it, not the media element)
        this._onSourceError = () => {
            this.loadErrorDisplay(Language.messages.error + " " + this.options.media_name);
        };
        source_item.addEventListener("error", this._onSourceError);

        const url = this._url();
        source_item.src = url;
        const media_type = this._getType(url, spec);
        // An unrecognised extension leaves the type unset so the browser can
        // work it out from the URL — setting a bare "audio/" (as this used to)
        // is not a valid MIME type and makes the source fail outright.
        if (media_type) {
            source_item.type = media_type;
        }
        // Subtitles: a WebVTT track, opt-in via media.subtitles. The element
        // is created before the fallback text node so the fallback stays last.
        if (spec.kind === "video" || spec.kind === "audio") {
            const subtitles = (this.data as { subtitles?: string | null }).subtitles;
            if (typeof subtitles === "string" && subtitles !== "") {
                const track = Dom.create(
                    "track",
                    "vco-media-track",
                    media_item,
                ) as HTMLTrackElement;
                track.kind = "subtitles";
                track.srclang = "en";
                track.label = "Subtitles";
                track.src = subtitles;
                track.default = true;
            }
        }

        // append as a text node: re-serializing innerHTML would replace the
        // source element and drop its error listener, leaving the loading
        // message on screen forever
        media_item.appendChild(
            document.createTextNode(
                `Your browser doesn't support HTML5 ${spec.kind} with ` + source_item.type,
            ),
        );

        // `ended` is what autoplay_media waits for instead of its timer; the
        // reference is kept so dispose() can detach it, like the two above
        this._onEnded = () => {
            this.fire("media_ended", this.data);
        };
        media_item.addEventListener("ended", this._onEnded);

        this.player_element = media_item;
    }

    // Update Media Display
    _updateMediaDisplay() {
        // the height is CSS-driven; nothing to compute here
    }

    _stopMedia() {
        this.player_element?.pause();
    }

    /**
     * Detach the media listeners and release the source, so a disposed audio
     * or video element stops buffering instead of playing into a detached
     * tree. Pausing alone (what `stopMedia()` does per slide change) is not
     * enough for a full teardown.
     */
    _disposeMedia() {
        if (this._onCanPlay) {
            this.player_element?.removeEventListener("canplay", this._onCanPlay);
            this._onCanPlay = null;
        }
        if (this._onEnded) {
            this.player_element?.removeEventListener("ended", this._onEnded);
            this._onEnded = null;
        }
        if (this._onSourceError) {
            this._el.source_item?.removeEventListener("error", this._onSourceError);
            this._onSourceError = null;
        }
        const el = this.player_element;
        if (el) {
            el.pause();
            // dropping the source stops the network fetch immediately
            el.removeAttribute("src");
            el.load();
        }
        this.player_element = null;

        this._onCanPlay = null;

        this._onSourceError = null;
    }

    _getType(url: string, spec: HtmlMediaSpec): string {
        const ext = url.match((this.data.mediatype as { match_str: string | RegExp }).match_str);
        if (!ext) {
            return "";
        }
        return mimeSubtype(ext[1], spec);
    }
}
