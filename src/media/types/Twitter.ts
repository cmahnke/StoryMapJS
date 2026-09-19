import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

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
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create("div", "vco-media-twitter", this._el.content);

        // Get Media ID

        const r = /twitter.com\/(.+?)\/status\/(\d+)/;
        const match = r.exec(this.data.url);
        if (match) {
            this.user_id = match[1];
            this.media_id = match[2];
        }
        const callbackName = `twitterCallback_${this.media_id}`;
        const api_url = `https://api.twitter.com/1/statuses/oembed.json?id=${this.media_id}&include_entities=true&callback=${callbackName}`;
        const callbackScript = document.createElement("script");
        (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
            this.createMedia(data);
        };
        callbackScript.src = api_url;
        document.body.appendChild(callbackScript);
    }

    createMedia(d: unknown) {
        const data = d as { html: string; author_url: string; author_name: string };
        let tweet = "",
            tweet_text;

        //	TWEET CONTENT
        tweet_text = data.html.split("</p>&mdash;")[0] + "</p></blockquote>";
        const tweetuser = data.author_url.split("twitter.com/")[1];
        const tweet_status_temp = data.html.split("</p>&mdash;")[1].split('<a href="')[1];
        const tweet_status_url = tweet_status_temp.split('">')[0];
        const tweet_status_date = tweet_status_temp.split('">')[1].split("</a>")[0];

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
        this._el.content_item.innerHTML = tweet;

        // After Loaded
        this.onLoaded();
    }

    updateMediaDisplay() {}

    _updateMediaDisplay() {}
}
