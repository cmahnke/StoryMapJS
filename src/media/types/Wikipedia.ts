import { Media } from "../Media";
import Dom from "../../dom/Dom";
import { Language } from "../../language/Language";
import { getObjectAttributeByIndex } from "../../core/Util";
import { loadJSONP, uniqueGlobalName } from "../../core/Load";

/*	Media.Wikipedia
================================================== */

const CALLBACK_PREFIX = "wikipediaCallback_";
const MAX_ID_LENGTH = 512 - CALLBACK_PREFIX.length;

/**
 * Split a Wikipedia article URL into its decoded title and language subdomain.
 * Underscores and percent-encoding both decode to spaces; hash fragments are
 * stripped. Falls back to the raw path segment when decoding fails.
 */
export function parseWikipediaUrl(pageUrl: string): { title: string; language: string } {
    const raw = pageUrl.split("wiki/")[1].split("#")[0];
    const underscored = raw.replace(/_/g, " ");
    let title: string;
    try {
        title = decodeURIComponent(underscored);
    } catch {
        title = underscored;
    }
    const language = pageUrl.split("//")[1].split(".wikipedia")[0];
    return { title, language };
}

/** The deterministic part of the JSONP callback name for an article title. */
export function wikipediaCallbackBase(title: string): string {
    return CALLBACK_PREFIX + title.replace(/[^0-9a-z]/gi, "").slice(0, MAX_ID_LENGTH);
}

/** The MediaWiki extracts API URL for a title, wrapping its answer in `callbackName`. */
export function wikipediaApiUrl(language: string, title: string, callbackName: string): string {
    return `https://${language}.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=&titles=${encodeURIComponent(title)}&exintro=1&format=json&callback=${callbackName}`;
}

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
        const { title, language } = parseWikipediaUrl(this.data.url);
        this.media_id = title;
        // Claim a unique global slot: same-article concurrent loads must not
        // share one (the loser's script would call a deleted global).
        const callbackName = uniqueGlobalName(wikipediaCallbackBase(title));
        const api_url = wikipediaApiUrl(language, title, callbackName);
        void this._fetchExtract(api_url, callbackName);
    }

    async _fetchExtract(api_url: string, callbackName: string) {
        try {
            this.createMedia(await loadJSONP<unknown>(api_url, callbackName));
        } catch {
            this.loadErrorDisplay("Unable to load this article.");
        }
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
