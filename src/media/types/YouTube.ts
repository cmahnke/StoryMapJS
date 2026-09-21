import { unique_ID, getUrlVars, ratio } from "../../core/Util";
import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.YouTube
================================================== */

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

    /*	Load the media
	================================================== */
    async _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        this.youtube_loaded = false;

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-youtube vco-media-shadow",
            this._el.content,
        );
        this._el.content_item.id = unique_ID(7);

        // URL Vars
        const url_vars = getUrlVars(this.data.url);

        // Get Media ID
        this.media_id = {};

        if (this.data.url.match("v=")) {
            this.media_id.id = url_vars["v"];
        } else if (this.data.url.match("/embed/")) {
            this.media_id.id = this.data.url.split("embed/")[1].split(/[?&]/)[0];
        } else if (this.data.url.match(/v\/|v=|youtu\.be\/|shorts\//)) {
            this.media_id.id = this.data.url
                .split(/v\/|v=|youtu\.be\/|shorts\//)[1]
                .split(/[?&]/)[0];
        } else {
            console.log("YouTube in URL but not a valid video");
        }

        this.media_id.start = url_vars["t"];
        this.media_id.hd = url_vars["hd"];

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
        this._el.content_item.style.height =
            ratio.r16_9({ w: this._el.content_item.offsetWidth }) + "px";
    }

    _stopMedia() {
        // cancel a pending API retry so a poll cannot outlive the slide
        clearTimeout(this.timer);
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
        clearTimeout(this.timer);
        if (typeof YT != "undefined" && typeof YT.Player != "undefined") {
            // Create Player
            const yt = YT as YTGlobal;
            this.player = new yt.Player(this._el.content_item.id, {
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
                        // After Loaded
                        //this.onLoaded();
                    },
                    onStateChange: this.onStateChange,
                },
            });
        } else {
            this.timer = setTimeout(() => {
                this.createPlayer();
            }, 1000);
        }
        this.onLoaded();
    }

    /*	Events
	================================================== */
    onPlayerReady(e?: unknown) {
        this.youtube_loaded = true;
        // the iframe replaces the placeholder div — re-resolve it, but a
        // slide removed in the meantime must not crash the display update
        const el = document.getElementById(this._el.content_item.id);
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
