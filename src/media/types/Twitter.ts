import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { sanitizeSlideText } from "../EmbedUtil";
import { tweetAuthor, tweetId } from "../embedId";
import { loadJSONP, uniqueGlobalName } from "../../core/Load";

/*	Media.Twitter
	Produces Twitter Display
================================================== */

export default class Twitter extends Media {
    declare "user_id": string;
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.loadingMessage();

        // Create Dom element
        this._el.content_item = Dom.create("div", "vco-media-twitter", this._el.content);

        // Get Media ID — routed here by MediaType, extracted by the shared
        // helpers so the accepted shapes cannot diverge again. The id stays
        // numeric-only, as before: anything else is not a status URL.
        const media_id = tweetId(this._url());
        const user_id = tweetAuthor(this._url());
        if (media_id && user_id && /^\d+$/.test(media_id)) {
            this.user_id = user_id;
            this.media_id = media_id;
        } else {
            throw new Error("Invalid Twitter URL");
        }
        const callbackName = uniqueGlobalName(`twitterCallback_${this.media_id}`);
        const api_url = `https://api.twitter.com/1/statuses/oembed.json?id=${this.media_id}&include_entities=true&callback=${callbackName}`;
        void this._fetchEmbed(api_url, callbackName);
    }

    async _fetchEmbed(api_url: string, callbackName: string) {
        try {
            this.createMedia(await loadJSONP<unknown>(api_url, callbackName));
        } catch {
            this.loadErrorDisplay("Unable to load this tweet.");
        }
    }

    createMedia(d: unknown) {
        const data = d as { html: string; author_url: string; author_name: string };
        if (!data?.html) {
            this.loadErrorDisplay("Unable to load this post.");
            return;
        }
        // The oEmbed markup is positional: the date link follows the tweet text
        // after a "&mdash;" separator. Every step below is optional so a markup
        // change upstream degrades to a missing date/link rather than throwing.
        const afterText = data.html.split("</p>&mdash;")[1] ?? "";
        const tweetuser = data.author_url.split(/twitter\.com|x\.com\//)[1] ?? "";
        const statusLink = afterText.split('<a href="')[1] ?? "";
        const tweet_status_url = statusLink.split('">')[0] ?? "";
        const tweet_status_date = (statusLink.split('">')[1] ?? "").split("</a>")[0] ?? "";

        let tweet = "";
        //	TWEET CONTENT
        let tweet_text = afterText ? data.html.split("</p>&mdash;")[0] + "</p></blockquote>" : "";
        // Open links in new window
        tweet_text = tweet_text.replace(/<a href/gi, '<a target="_blank" href');

        // 	TWEET CONTENT
        tweet += tweet_text;

        //	TWEET AUTHOR
        tweet += "<div class='vcard'>";
        tweet +=
            "<a href='" +
            tweet_status_url +
            "' class='twitter-date' target='_blank'>" +
            tweet_status_date +
            "</a>";
        tweet += "<div class='author'>";
        tweet += "<a class='screen-name url' href='" + data.author_url + "' target='_blank'>";
        tweet += "<span class='avatar'></span>";
        tweet +=
            "<span class='fn'>" +
            data.author_name +
            " <span class='vco-icon-twitter'></span></span>";
        tweet +=
            "<span class='nickname'>@" +
            tweetuser +
            "<span class='thumbnail-inline'></span></span>";
        tweet += "</a>";
        tweet += "</div>";
        tweet += "</div>";

        // Add to DOM
        // The whole tweet is assembled from the oEmbed response's own HTML
        // plus five string-concatenated fields, and that API does not escape
        // HTML — so the result is untrusted third-party markup and goes
        // through the sanitizer. It also repairs the four unguarded
        // positional splits above: a markup change upstream now degrades to a
        // missing date instead of throwing.
        this._el.content_item?.appendChild(sanitizeSlideText(tweet));

        // After Loaded
        this.onLoaded();
    }

    updateMediaDisplay() {}

    _updateMediaDisplay() {}
}
