import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * StoryMap hands its own `this.data` to the slider without cloning it, so
 * anything the slider writes into a slide object is visible to every other
 * viewer built from the same parsed document. The generated `uniqueid` is the
 * problem: it becomes a DOM element id in Slide, Text and Media, so a second
 * viewer adopting the first viewer's id emits a duplicate id on the page.
 */
function document_(): StorymapDataWrapper {
    return {
        storymap: {
            map_type: "osm",
            calculate_zoom: true,
            slides: [
                { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                {
                    date: "",
                    text: { headline: "Paris", text: "" },
                    location: { lat: 48.85, lon: 2.35 },
                },
                {
                    date: "",
                    text: { headline: "Rome", text: "" },
                    location: { lat: 41.9, lon: 12.5 },
                },
            ],
        },
    } as unknown as StorymapDataWrapper;
}

describe("multiple viewers on one page", () => {
    /** Disposed after every test: a viewer holds a page-wide language claim,
     *  and a claim leaked by a failed assertion would fail the next test. */
    const mounted: StoryMap[] = [];

    afterEach(() => {
        while (mounted.length > 0) {
            mounted.pop()?.dispose();
        }
        document.body.replaceChildren();
    });

    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function mount(id: string, data: StorymapDataWrapper, language = "en"): StoryMap {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        const sm = new StoryMap(id, data, { language }, {});
        mounted.push(sm);
        return sm;
    }

    it("gives each viewer its own slide element ids", () => {
        // the SAME document object, as an SPA that renders two stories from
        // one parsed payload would
        const data = document_();
        mount("sm-two-a", data);
        mount("sm-two-b", data);

        // several elements are created with id="" on purpose, which is not a
        // collision; only real values matter
        const ids = [...document.querySelectorAll("[id]")]
            .map((el) => el.id)
            .filter((value) => value !== "");
        const duplicates = ids.filter((value, index) => ids.indexOf(value) !== index);
        expect(duplicates).toEqual([]);
        expect(ids.length).toBeGreaterThan(0);

        // the slides really do get an id: `uniqueid` is optional in the
        // schema and absent from nearly every fixture, so a guard of
        // `=== ""` never fired and every slide got id=""
        const slide_ids = [...document.querySelectorAll(".vco-slide")].map((el) => el.id);
        expect(slide_ids.every((id) => id.startsWith("vco-slide-"))).toBe(true);

        // ...and the caller's document was not written to
        const slides = (data as unknown as { storymap: { slides: Record<string, unknown>[] } })
            .storymap.slides;
        for (const slide of slides) {
            expect(slide.uniqueid).toBeUndefined();
        }
    });

    it("mounts both viewers independently", () => {
        const a = mount("sm-two-c", document_());
        mount("sm-two-d", document_());

        for (const id of ["sm-two-c", "sm-two-d"]) {
            const host = document.getElementById(id) as HTMLElement;
            expect(host.querySelector(".vco-map")).not.toBeNull();
            expect(host.querySelector(".vco-storyslider")).not.toBeNull();
            expect(host.querySelectorAll(".vco-slide").length).toBeGreaterThan(0);
        }

        // disposing one leaves the other intact
        a.dispose();
        const kept = document.getElementById("sm-two-d") as HTMLElement;
        expect(kept.querySelector(".vco-storyslider")).not.toBeNull();
        expect(kept.children.length).toBeGreaterThan(0);
    });

    it("rejects a second viewer asking for a different language", () => {
        mount("sm-two-lang-a", document_(), "de");
        // the same language twice is the supported case
        expect(() => mount("sm-two-lang-b", document_(), "de")).not.toThrow();
        // a different one is a configuration error, and must not silently
        // repaint the first viewer in the other language
        expect(() => mount("sm-two-lang-c", document_(), "fr")).toThrow(/different languages/);
    });

    it("releases the language claim on dispose", () => {
        const a = mount("sm-two-lang-release", document_(), "de");
        a.dispose();
        // the SPA case: once the only German viewer is gone, a later one may
        // pick a different locale
        expect(() => mount("sm-two-lang-after", document_(), "ja")).not.toThrow();
    });
});
