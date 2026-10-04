import { afterEach, describe, expect, it, vi } from "vitest";
import Slide from "../src/slider/Slide";
import type { StorymapSlide } from "../src/types";

/**
 * V2 of #358: a slide renders a second visible media slot. `media` plus
 * `media_extra` build one `Media` each, in order; a document without
 * `media_extra` renders exactly as before (no marker class, no layout
 * attribute, `_media` still the first item).
 */

const IMAGE = "https://example.com/photo.jpg";
const IFRAME = "https://example.com/iframe/embed/123";
const AUDIO = "https://example.com/tone.mp3";

type MediaProbe = {
    fire: (type: string, data?: unknown) => void;
    options?: { media_type?: string };
};

type SlideProbe = {
    _el: { container: HTMLElement };
    _media: MediaProbe | null;
    _medias: MediaProbe[];
    _media_ended_fns: { media: MediaProbe; fn: () => void }[];
    _state: { loaded: boolean };
    has: { media: boolean };
    hasPlayableMedia: () => boolean;
    onMediaEnded: (fn: () => void) => void;
    loadMedia: () => void;
    stopMedia: () => void;
    dispose: () => void;
};

function build(data: StorymapSlide): SlideProbe {
    const slide = new Slide(data, {}) as unknown as SlideProbe;
    document.body.appendChild(slide._el.container);
    return slide;
}

function textSlide(
    media?: StorymapSlide["media"],
    extra?: StorymapSlide["media_extra"],
    layout?: StorymapSlide["media_layout"],
): StorymapSlide {
    return {
        text: { headline: "Headline", text: "Body." },
        media: media ?? null,
        ...(extra !== undefined ? { media_extra: extra } : {}),
        ...(layout !== undefined ? { media_layout: layout } : {}),
    };
}

afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
});

describe("single-media display parity", () => {
    it("renders one item with no marker class, attribute or alias change", () => {
        const slide = build(textSlide({ url: IMAGE }));
        expect(slide.has.media).toBe(true);
        expect(slide._medias).toHaveLength(1);
        expect(slide._media).toBe(slide._medias[0]);
        expect(slide._el.container.querySelectorAll(".vco-media")).toHaveLength(1);
        expect(slide._el.container.classList.contains("vco-slide-media-multiple")).toBe(false);
        expect(slide._el.container.getAttribute("data-layout")).toBeNull();
        slide.dispose();
    });

    it("has no media for null media and no extras", () => {
        const slide = build(textSlide(null));
        expect(slide.has.media).toBe(false);
        expect(slide._medias).toHaveLength(0);
        expect(slide._media).toBeNull();
        expect(slide._el.container.querySelectorAll(".vco-media")).toHaveLength(0);
        slide.dispose();
    });

    it("has no media for an empty media url", () => {
        const slide = build(textSlide({ url: "" }));
        expect(slide.has.media).toBe(false);
        expect(slide._medias).toHaveLength(0);
        slide.dispose();
    });

    it("an extra alone still makes a media slide", () => {
        const slide = build(textSlide(null, [{ url: IMAGE }]));
        expect(slide.has.media).toBe(true);
        expect(slide._medias).toHaveLength(1);
        expect(slide._media).toBe(slide._medias[0]);
        slide.dispose();
    });

    it("skips extras without a url", () => {
        const slide = build(textSlide({ url: IMAGE }, [{ url: "" }, { url: IMAGE }]));
        expect(slide._medias).toHaveLength(2);
        slide.dispose();
    });
});

describe("two-item slides", () => {
    it("renders two media subtrees, stacked by default", () => {
        const slide = build(textSlide({ url: IMAGE }, [{ url: IFRAME }]));
        expect(slide._medias).toHaveLength(2);
        expect(slide._media).toBe(slide._medias[0]);
        expect(slide._el.container.querySelectorAll(".vco-media")).toHaveLength(2);
        expect(slide._el.container.classList.contains("vco-slide-media-multiple")).toBe(true);
        expect(slide._el.container.getAttribute("data-layout")).toBe("stack");
        slide.dispose();
    });

    it("row seats exactly two items; anything else stacks", () => {
        const row = build(textSlide({ url: IMAGE }, [{ url: IFRAME }], "row"));
        expect(row._el.container.getAttribute("data-layout")).toBe("row");
        row.dispose();

        const three = build(textSlide({ url: IMAGE }, [{ url: IFRAME }, { url: AUDIO }], "row"));
        expect(three._medias).toHaveLength(3);
        expect(three._el.container.getAttribute("data-layout")).toBe("stack");
        three.dispose();
    });

    it("renders two media items once loaded, one an iframe", () => {
        vi.useFakeTimers();
        const slide = build(textSlide({ url: IMAGE }, [{ url: IFRAME }]));
        slide.loadMedia();
        vi.advanceTimersByTime(1300);
        const items = slide._el.container.querySelectorAll(".vco-media-item");
        expect(items).toHaveLength(2);
        expect(
            slide._el.container.querySelectorAll(".vco-media-item.vco-media-iframe"),
        ).toHaveLength(1);
        slide.dispose();
        vi.useRealTimers();
    });

    it("stopMedia stops every item and rearms when nothing loaded", () => {
        const slide = build(textSlide({ url: IMAGE }, [{ url: AUDIO }]));
        slide.loadMedia();
        expect(slide._state.loaded).toBe(true);
        slide.stopMedia();
        // neither item's deferred load ran, so a revisit retries
        expect(slide._state.loaded).toBe(false);
        slide.dispose();
    });
});

describe("playback across items", () => {
    it("hasPlayableMedia sees an audible item in any position", () => {
        const none = build(textSlide({ url: IMAGE }));
        expect(none.hasPlayableMedia()).toBe(false);
        none.dispose();

        const first = build(textSlide({ url: AUDIO }));
        expect(first.hasPlayableMedia()).toBe(true);
        first.dispose();

        const second = build(textSlide({ url: IMAGE }, [{ url: AUDIO }]));
        expect(second.hasPlayableMedia()).toBe(true);
        second.dispose();
    });

    it("media_ended only waits when exactly one item is playable", () => {
        let calls = 0;
        const single = build(textSlide({ url: AUDIO }));
        single.onMediaEnded(() => {
            calls += 1;
        });
        single._medias[0].fire("media_ended");
        expect(calls).toBe(1);
        single.dispose();

        let multiCalls = 0;
        const multi = build(textSlide({ url: AUDIO }, [{ url: AUDIO }]));
        multi.onMediaEnded(() => {
            multiCalls += 1;
        });
        multi._medias[0].fire("media_ended");
        multi._medias[1].fire("media_ended");
        expect(multiCalls).toBe(0);
        multi.dispose();
    });

    it("dispose detaches every media_ended handler it registered", () => {
        const fired: string[] = [];
        const slide = build(textSlide({ url: AUDIO }));
        slide.onMediaEnded(() => fired.push("one"));
        slide.onMediaEnded(() => fired.push("two"));
        expect(slide._media_ended_fns).toHaveLength(2);
        const media = slide._medias[0];
        slide.dispose();
        media.fire("media_ended");
        expect(fired).toEqual([]);
    });

    it("dispose detaches media_loaded from every item", () => {
        const slide = build(textSlide({ url: IMAGE }, [{ url: IFRAME }]));
        const medias = [...slide._medias];
        slide.dispose();
        // detached handlers: firing afterwards reaches nothing
        for (const media of medias) {
            media.fire("media_loaded");
        }
        expect(slide._medias).toHaveLength(0);
        expect(slide._media).toBeNull();
    });
});
