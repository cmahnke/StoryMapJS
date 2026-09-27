import { unique_ID, clearTimer } from "../../core/Util";
import { youtubeId, queryParam } from "../embedId";
import { Media } from "../Media";
import Dom from "../../dom/Dom";

/*	Media.YouTube
================================================== */

/** How long to wait for the IFrame API script before giving up (one second apart). */
const YOUTUBE_API_ATTEMPTS = 10;

/*	Minimal surface of the YouTube iframe API player used here. */
interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number) => void;
    destroy: () => void;
    loadVideoById: (id: string) => void;
    cueVideoById: (id: string) => void;
    setVolume: (volume: number) => void;
    getDuration: () => number;
    getPlayerState: () => number;
}

/*	The externally loaded YT global, narrowed at its usage sites. */
type YTGlobal = {
    Player: new (el: HTMLElement | string, opts: unknown) => YTPlayer;
    PlayerState: Record<string, number>;
};

interface YouTubeMediaID {
    id?: string;
    start?: number | string;
    hd?: boolean | string;
}

export default class YouTube extends Media {
    declare "youtube_loaded": boolean;
    declare "media_id": YouTubeMediaID;
    declare "player": YTPlayer;
    declare "_player_attempts": number;

    /*	Load the media
	================================================== */
    async _loadMedia() {
        // Loading Message
        this.loadingMessage();

        this.youtube_loaded = false;
        this._player_attempts = 0;

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-youtube vco-media-shadow",
            this._el.content,
        );
        (this._el.content_item as HTMLElement).id = unique_ID(7);

        // Get Media ID — the previous four-way branch chain missed /live/ and
        // playlist links, and fell through to a console.log while still
        // building a player with `id === undefined`
        const id = youtubeId(this._url());
        if (!id) {
            throw new Error("Invalid YouTube URL");
        }
        this.media_id = { id: id };
        this.media_id.start = queryParam(this._url(), "t") ?? undefined;
        this.media_id.hd = queryParam(this._url(), "hd") ?? undefined;

        // API Call
        try {
            await this.loadScript("https://www.youtube.com/iframe_api");
        } catch {
            // aborted or failed to load; nothing to show
            return;
        }
        this.createMedia();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._sizeContentItemTo16x9();
    }

    _stopMedia() {
        // cancel a pending API retry so a poll cannot outlive the slide
        clearTimer(this.timer);
        this.timer = null;
        if (this.youtube_loaded) {
            try {
                const yt = YT as YTGlobal;
                if (this.player.getPlayerState() === yt.PlayerState.PLAYING) {
                    this.player.pauseVideo();
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    createMedia() {
        // Determine Start of Media
        if (typeof this.media_id.start != "undefined") {
            const vidstart = this.media_id.start.toString();
            // supports the "90" (seconds), "1m30s" and "1h2m30s" formats
            const hours = /(\d+)h/.exec(vidstart);
            const minutes = /(\d+)m/.exec(vidstart);
            const seconds = /(\d+)s/.exec(vidstart);
            if (hours || minutes || seconds) {
                this.media_id.start =
                    (hours ? parseInt(hours[1], 10) * 3600 : 0) +
                    (minutes ? parseInt(minutes[1], 10) * 60 : 0) +
                    (seconds ? parseInt(seconds[1], 10) : 0);
            } else {
                const parsed = parseInt(vidstart, 10);
                this.media_id.start = Number.isNaN(parsed) ? 0 : parsed;
            }
        } else {
            this.media_id.start = 0;
        }
        // Determine HD
        if (typeof this.media_id.hd != "undefined") {
            this.media_id.hd = true;
        } else {
            this.media_id.hd = false;
        }
        this.createPlayer();
    }

    createPlayer() {
        clearTimer(this.timer);
        if (typeof YT != "undefined" && typeof YT.Player != "undefined") {
            // Create Player
            const yt = YT as YTGlobal;
            const mount_id = this._el.content_item?.id;
            if (!mount_id) {
                return;
            }
            this.player = new yt.Player(mount_id, {
                playerVars: {
                    enablejsapi: 1,
                    color: "white",
                    autohide: 1,
                    showinfo: 0,
                    theme: "light",
                    start: this.media_id.start,
                    fs: 0,
                    rel: 0,
                },
                videoId: this.media_id.id,
                events: {
                    onReady: () => {
                        this.onPlayerReady();
                    },
                    onStateChange: this.onStateChange,
                },
            });
            this.onLoaded();
        } else {
            // The IFrame API script has not arrived yet. Poll for it, but cap
            // the attempts — an unbounded setTimeout recursion kept a timer
            // alive forever on any network failure, and the loading message
            // used to be dismissed by an unconditional onLoaded() below even
            // though nothing was playing.
            this._player_attempts = (this._player_attempts ?? 0) + 1;
            if (this._player_attempts > YOUTUBE_API_ATTEMPTS) {
                this.loadErrorDisplay("The YouTube player could not be loaded.");
                return;
            }
            this.timer = setTimeout(() => {
                this.createPlayer();
            }, 1000);
        }
    }

    /*	Events
	================================================== */
    onPlayerReady(e?: unknown) {
        this.youtube_loaded = true;
        // the iframe replaces the placeholder div — re-resolve it, but a
        // slide removed in the meantime must not crash the display update
        const mount_id = this._el.content_item?.id;
        const el = mount_id ? document.getElementById(mount_id) : null;
        if (el) {
            this._el.content_item = el;
        }
        this.onMediaLoaded();
        this.onLoaded();
    }

    onStateChange(e: { data: number; target: YTPlayer }) {
        const yt = YT as YTGlobal;
        if (e.data === yt.PlayerState.ENDED) {
            e.target.seekTo(0);
            e.target.pauseVideo();
        }
    }
}
