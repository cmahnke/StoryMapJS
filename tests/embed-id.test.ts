import { it, expect, describe } from "vitest";
import {
    dailymotionId,
    flickrId,
    queryParam,
    segmentAfter,
    tweetAuthor,
    tweetId,
    vimeoId,
    youtubeId,
} from "../src/media/embedId";

/*
 * Provider id extraction.
 *
 * Six media types each rolled their own parser, with three different failure
 * modes. These cases pin the shapes that actually occur, plus the ones the
 * old implementations missed.
 */

describe("segmentAfter", () => {
    it("returns the first path segment after a marker", () => {
        expect(segmentAfter("https://x.test/a/b/c", /\/a\//)).toBe("b");
    });

    it("strips the query string and fragment", () => {
        expect(segmentAfter("https://x.test/a/b?q=1#frag", /\/a\//)).toBe("b");
    });

    it("tries the markers in order and returns the first match", () => {
        expect(segmentAfter("https://x.test/nope/1", /\/nope\//, /zzz/)).toBe("1");
    });

    it("keeps looking when a marker matches but leaves no segment", () => {
        // "/zzz/" matches at the very end, so there is no segment after it
        expect(segmentAfter("https://x.test/zzz", /\/nope\//, /zzz\//)).toBe(null);
    });

    it("returns null when no marker matches", () => {
        expect(segmentAfter("https://x.test/a", /\/zzz\//)).toBe(null);
    });
});

describe("queryParam", () => {
    it("reads a parameter from an absolute URL", () => {
        expect(queryParam("https://www.youtube.com/watch?v=abc&t=30", "v")).toBe("abc");
        expect(queryParam("https://www.youtube.com/watch?v=abc&t=30", "t")).toBe("30");
    });

    it("returns null for an absent parameter", () => {
        expect(queryParam("https://x.test/?a=1", "b")).toBe(null);
    });

    it("falls back to the raw query for a relative URL", () => {
        expect(queryParam("/watch?v=abc", "v")).toBe("abc");
    });
});

describe("youtubeId", () => {
    it.each([
        ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s", "dQw4w9WgXcQ"],
        ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://youtu.be/dQw4w9WgXcQ?si=abcdef", "dQw4w9WgXcQ"],
        ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        // the shape the old four-way branch chain did not handle
        ["https://www.youtube.com/live/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
        ["https://www.youtube.com/v/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ])("extracts %s", (url, expected) => {
        expect(youtubeId(url)).toBe(expected);
    });

    it("returns null for a URL with no video id", () => {
        expect(youtubeId("https://www.youtube.com/")).toBe(null);
        expect(youtubeId("https://www.youtube.com/channel/UC123")).toBe(null);
    });
});

describe("vimeoId", () => {
    it.each([
        ["https://vimeo.com/123456789", "123456789"],
        ["https://vimeo.com/123456789?share=copy", "123456789"],
        ["https://player.vimeo.com/video/123456789", "123456789"],
    ])("extracts %s", (url, expected) => {
        expect(vimeoId(url)).toBe(expected);
    });

    it("returns null for a non-video page", () => {
        expect(vimeoId("https://vimeo.com/channels/staffpicks")).toBe(null);
    });
});

describe("dailymotionId", () => {
    it.each([
        ["https://www.dailymotion.com/video/x7abcd", "x7abcd"],
        ["https://www.dailymotion.com/video/x7abcd?title=foo", "x7abcd"],
        ["https://www.dailymotion.com/embed/video/x7abcd", "x7abcd"],
        ["https://dai.ly/x7abcd", "x7abcd"],
    ])("extracts %s", (url, expected) => {
        expect(dailymotionId(url)).toBe(expected);
    });
});

describe("flickrId", () => {
    it("extracts the photo id from a photo page", () => {
        expect(flickrId("https://www.flickr.com/photos/zed/1234567890")).toBe("1234567890");
        expect(flickrId("https://www.flickr.com/photos/zed/1234567890/in/album")).toBe(
            "1234567890",
        );
    });

    it("returns null for a non-numeric or missing photo id", () => {
        // the old parser assigned `undefined` here and threw a bare string
        expect(flickrId("https://www.flickr.com/photos/zed/")).toBe(null);
        expect(flickrId("https://www.flickr.com/photos/zed/notanumber")).toBe(null);
        expect(flickrId("https://www.flickr.com/")).toBe(null);
    });
});

describe("tweetId", () => {
    it("extracts the status id", () => {
        expect(tweetId("https://twitter.com/zed/status/1234567890")).toBe("1234567890");
        expect(tweetId("https://x.com/zed/status/1234567890")).toBe("1234567890");
    });

    it("returns null for a profile URL", () => {
        expect(tweetId("https://twitter.com/zed")).toBe(null);
    });
});

describe("tweetAuthor", () => {
    it("extracts the profile segment before /status/", () => {
        expect(tweetAuthor("https://twitter.com/zed/status/1234567890")).toBe("zed");
        expect(tweetAuthor("https://x.com/zed/statuses/1234567890")).toBe("zed");
    });

    it("returns null without a status path", () => {
        expect(tweetAuthor("https://twitter.com/zed")).toBe(null);
        expect(tweetAuthor("https://example.com/zed/status/123")).toBe(null);
    });
});
