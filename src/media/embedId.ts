/*	embedId
	Provider id extraction.

	Each media type used to roll its own: six different ways of stripping the
	query string, three different failure modes (throw an Error, throw a bare
	string, or log a warning and carry on with `undefined`), and a fourth
	divergence between the URL shapes the code accepted and the ones
	`MediaType`'s routing regex actually matched.

	These helpers are the single implementation. Each returns null when the
	url does not carry that provider's id, and the caller decides how to
	report it.
================================================== */

/** Strip the query string and fragment. */
function withoutQuery(url: string): string {
    return url.split(/[?#]/)[0];
}

/**
 * The first path segment after any of `markers`, with the query string
 * removed. Returns null when none of the markers is present.
 */
export function segmentAfter(url: string, ...markers: RegExp[]): string | null {
    for (const marker of markers) {
        const match = url.match(marker);
        if (match) {
            const rest = url.slice((match.index ?? 0) + match[0].length);
            const segment = withoutQuery(rest).split("/")[0];
            if (segment) {
                return segment;
            }
        }
    }
    return null;
}

/** A query parameter, via the platform parser rather than a hand-rolled split. */
export function queryParam(url: string, name: string): string | null {
    try {
        return new URL(url).searchParams.get(name);
    } catch {
        // not an absolute URL; fall back to the raw query string
        const query = url.split("?")[1];
        if (!query) return null;
        for (const pair of query.split("&")) {
            const [key, value] = pair.split("=");
            if (key === name) {
                return value ?? "";
            }
        }
        return null;
    }
}

/** YouTube video id: watch, embed, short, shorts, live and youtu.be links. */
export function youtubeId(url: string): string | null {
    const fromQuery = queryParam(url, "v");
    if (fromQuery) {
        return fromQuery;
    }
    return segmentAfter(
        url,
        /youtu\.be\//i,
        /\/embed\//i,
        /\/shorts\//i,
        /\/live\//i,
        /\/v\//i,
        /[?&]v=/i,
    );
}

/**
 * Vimeo video id. Watch URLs are the bare `vimeo.com/<id>` form, so the
 * explicit `/video/` path alone is not enough — the previous implementation
 * split on `video\/|\/\/vimeo\.com\//` and relied on the second alternative.
 * Non-numeric pages (channels, albums, showcases) are rejected.
 */
export function vimeoId(url: string): string | null {
    const explicit = segmentAfter(url, /vimeo\.com\/video\//i, /player\.vimeo\.com\/video\//i);
    if (explicit) {
        return explicit;
    }
    return url.match(/vimeo\.com\/(\d+)(?:$|[/?#])/i)?.[1] ?? null;
}

/** Dailymotion video id from a watch or embed link. */
export function dailymotionId(url: string): string | null {
    return segmentAfter(url, /dailymotion\.com\/video\//i, /dai\.ly\//i, /\/embed\/video\//i);
}

/** Flickr photo id from a photo page URL. */
export function flickrId(url: string): string | null {
    const id = segmentAfter(url, /flickr\.com\/photos\/[^/]+\//i);
    if (id && /^\d+$/.test(id)) {
        return id;
    }
    return null;
}

/** Tweet id from a twitter.com or x.com status URL. */
export function tweetId(url: string): string | null {
    return segmentAfter(url, /\/status(?:es)?\//i);
}
