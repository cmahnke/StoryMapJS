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
            let vid_start_minutes, vid_start_seconds;
            if (vidstart.match("m")) {
                vid_start_minutes = parseInt(vidstart.split("m")[0], 10);
                vid_start_seconds = parseInt(vidstart.split("m")[1].split("s")[0], 10);
                this.media_id.start = vid_start_minutes * 60 + vid_start_seconds;
            } else {
                this.media_id.start = 0;
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
        this._el.content_item = document.getElementById(this._el.content_item.id);
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
