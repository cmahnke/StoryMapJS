import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { getObjectAttributeByIndex } from "../../core/Util";

/*	Media.Wikipedia
================================================== */

export default class Wikipedia extends Media {
    declare "media_id": string;

    /*	Load the media
	================================================== */
    _loadMedia() {
        // Loading Message
        this.message.updateMessage(Language.messages.loading + " " + this.options.media_name);

        // Create Dom element
        this._el.content_item = Dom.create(
            "div",
            "vco-media-item vco-media-wikipedia",
            this._el.content,
        );

        // Get Media ID
        this.media_id = this.data.url.split("wiki/")[1].split("#")[0].replace("_", " ");
        this.media_id = this.media_id.replace(" ", "%20");
        const api_language = this.data.url.split("//")[1].split(".wikipedia")[0];

        const callbackPrefix = "wikipediaCallback_";
        const maxIDLength = 512 - callbackPrefix.length;
        const callbackName =
            callbackPrefix + this.media_id.replace(/[^0-9a-z]/gi, "").slice(0, maxIDLength);
        const api_url = `https://${api_language}.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=&titles=${this.media_id}&exintro=1&format=json&callback=${callbackName}`;
        const callbackScript = document.createElement("script");
        (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
            this.createMedia(data);
        };
        callbackScript.src = api_url;
        document.body.appendChild(callbackScript);
    }

    createMedia(d: unknown) {
        const data = d as { query?: unknown };
        if (data.query) {
            let content;
            const wiki = {
                entry: {} as Record<string, string>,
                title: "",
                text: "",
                extract: "",
                paragraphs: 1,
                text_array: [] as string[],
            };

            const pages = data.query as { pages: Record<string, unknown> };
            wiki.entry = getObjectAttributeByIndex(pages.pages, 0) as Record<string, string>;
            wiki.extract = wiki.entry.extract;
            wiki.title = wiki.entry.title;

            if (wiki.extract.match("<p>")) {
                wiki.text_array = wiki.extract.split("<p>");
            } else {
                wiki.text_array.push(wiki.extract);
            }

            for (let i = 0; i < wiki.text_array.length; i++) {
                if (i + 1 <= wiki.paragraphs && i + 1 < wiki.text_array.length) {
                    wiki.text += "<p>" + wiki.text_array[i + 1];
                }
            }

            content =
                "<h4><a href='" + this.data.url + "' target='_blank'>" + wiki.title + "</a></h4>";
            content += "<span class='wiki-source'>" + Language.messages.wikipedia + "</span>";
            content += wiki.text;

            if (wiki.extract.match("REDIRECT")) {
                // redirect page: leave content empty
            } else {
                // Add to DOM
                this._el.content_item.innerHTML = content;
                // After Loaded
                this.onLoaded();
            }
        }
    }

    updateMediaDisplay() {}

    _updateMediaDisplay() {}
}
