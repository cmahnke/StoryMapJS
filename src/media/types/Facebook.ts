import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";

/*	Media.Facebook
	Embeds a Facebook post, video or reel via the plugins endpoint
	(issue #272)
================================================== */

export default class Facebook extends Media {
    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-iframe vco-media-facebook",
            this._el.content,
        );

        const url = this.data.url;
        const href = encodeURIComponent(url);
        const embed =
            /\/videos?\//.test(url) || /\/watch/.test(url) || /\/reel\//.test(url)
                ? `https://www.facebook.com/plugins/video.php?href=${href}&show_text=true`
                : `https://www.facebook.com/plugins/post.php?href=${href}&show_text=true`;
        this._el.content_item.innerHTML =
            `<iframe src="${embed}" scrolling="no" frameborder="0" ` +
            `allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; ` +
            `picture-in-picture; web-share"></iframe>`;
        this.onLoaded();
    }

    // Update Media Display
    _updateMediaDisplay() {
        this._el.content_item.style.height = this.options.height + "px";
    }
}
