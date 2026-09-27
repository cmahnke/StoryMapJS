import { describe, expect, it } from "vitest";

/**
 * The media error state builds its icon class from the media type. The icon
 * font has no glyph for every registered type, so seven of them used to
 * render an empty box.
 */
const ICON_GLYPHS = new Set(
    `arrow-down arrow-left arrow-right arrow-up blockquote camera-retro chevron-left
     chevron-right doc doc-v dribbble evernote facebook flickr foursquare github goback
     google-plus googledrive image image-v instagram lastfm list location mappin music
     pinterest plaintext quote-v resize-full resize-horizontal resize-small
     resize-vertical share share-v soundcloud swipe-left swipe-right touch-pinch
     touch-spread tumblr twitter video video-v vimeo web weibo wikipedia youtube
     youtube-logo zoom-in zoom-out`.split(/\s+/),
);

// every type registered in MediaType.ts
const MEDIA_TYPES = (
    "youtube vimeo dailymotion soundcloud twitter flickr image video audio googledocs " +
    "wikipedia iframe facebook documentcloud juxtapose blockquote website"
).split(" ");

describe("media error icons", () => {
    it("every registered media type resolves to an icon that exists", async () => {
        const { loadErrorIcon } = await import("../src/media/Media");
        for (const type of MEDIA_TYPES) {
            expect(ICON_GLYPHS.has(loadErrorIcon(type))).toBe(true);
        }
    });

    it("uses the type's own glyph when one exists", async () => {
        const { loadErrorIcon } = await import("../src/media/Media");
        expect(loadErrorIcon("youtube")).toBe("youtube");
        expect(loadErrorIcon("flickr")).toBe("flickr");
    });

    it("substitutes a glyph for the types the font has none for", async () => {
        const { loadErrorIcon } = await import("../src/media/Media");
        expect(loadErrorIcon("dailymotion")).toBe("video");
        expect(loadErrorIcon("audio")).toBe("music");
        expect(loadErrorIcon("website")).toBe("web");
    });

    it("falls back to a generic glyph for an unknown or missing type", async () => {
        const { loadErrorIcon } = await import("../src/media/Media");
        expect(loadErrorIcon("something-new")).toBe("web");
        expect(loadErrorIcon("")).toBe("web");
        expect(loadErrorIcon(undefined)).toBe("web");
    });
});
