import { beforeAll, describe, expect, it, vi } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Inactive slides are translated off-screen but stay in the DOM, so without
 * help a screen reader reads every slide. `setActive()` hides inactive
 * slides from assistive tech (`aria-hidden` + `inert`) — without disturbing
 * preloading, which still builds media (including iframes) underneath.
 */

describe("slide visibility to assistive tech", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    type SlideProbe = {
        _el: { container: HTMLElement };
    };

    function slidesOf(storymap: StoryMap): SlideProbe[] {
        return (storymap as unknown as { _storyslider: { _slides: SlideProbe[] } })._storyslider
            ._slides;
    }

    function exposure(slides: SlideProbe[]): { hidden: (string | null)[]; inert: boolean[] } {
        return {
            hidden: slides.map((s) => s._el.container.getAttribute("aria-hidden")),
            inert: slides.map((s) => s._el.container.hasAttribute("inert")),
        };
    }

    function storymap(id: string): StoryMap {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(id, {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Paris", text: "Body." },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                    {
                        date: "",
                        text: { headline: "Berlin", text: "Body." },
                        location: { lat: 52.52, lon: 13.4 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
    }

    it("exposes exactly the active slide", () => {
        const sm = storymap("sm-visibility-one");
        const slides = slidesOf(sm);
        expect(slides).toHaveLength(3);
        // the overview starts active
        expect(exposure(slides)).toEqual({
            hidden: ["false", "true", "true"],
            inert: [false, true, true],
        });
        sm.goTo(1);
        expect(exposure(slides)).toEqual({
            hidden: ["true", "false", "true"],
            inert: [true, false, true],
        });
        sm.goTo(2);
        expect(exposure(slides)).toEqual({
            hidden: ["true", "true", "false"],
            inert: [true, true, false],
        });
        sm.dispose();
    });

    it("still preloads an iframe held by an inactive slide", async () => {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = "sm-visibility-iframe";
        document.body.appendChild(el);
        const sm = new StoryMap("sm-visibility-iframe", {
            storymap: {
                map_type: "osm",
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Embed", text: "Body." },
                        media: { url: "https://example.com/iframe/embed.html" },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                    {
                        date: "",
                        text: { headline: "Berlin", text: "Body." },
                        location: { lat: 52.52, lon: 13.4 },
                    },
                ],
            },
        } as unknown as StorymapDataWrapper);
        const slides = slidesOf(sm);
        // the iframe slide is inactive and hidden from AT ...
        expect(slides[1]._el.container.getAttribute("aria-hidden")).toBe("true");
        expect(slides[1]._el.container.hasAttribute("inert")).toBe(true);
        // ... yet the neighbor preload still builds its frame
        await vi.waitFor(
            () => {
                expect(slides[1]._el.container.querySelector("iframe")).not.toBeNull();
            },
            { timeout: 15_000 },
        );
        sm.dispose();
    }, 25_000);
});
