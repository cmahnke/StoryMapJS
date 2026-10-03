import { beforeAll, describe, expect, it, vi } from "vitest";
import { StoryMap } from "../src/storymap/StoryMap";
import type { StorymapDataWrapper } from "../src/types";

/**
 * Layer switcher (`show_layers_control`): a disclosure button in the menubar
 * opens basemap radios and overlay checkboxes. Rows address built layers —
 * a malformed entry is skipped by the engine and never gets a row, so row
 * *i* and layer *i* stay the same index.
 */

describe("layers control", () => {
    beforeAll(() => {
        class ResizeObserverStub {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
    });

    function storymap(
        id: string,
        storymap: Record<string, unknown>,
        options: Record<string, unknown> = {},
    ): StoryMap {
        window.location.hash = "";
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            { storymap } as unknown as StorymapDataWrapper,
            { show_layers_control: true, ...options } as never,
        );
    }

    function baseStorymap(
        id: string,
        overlays: Record<string, unknown>[],
        options: Record<string, unknown> = {},
    ): StoryMap {
        return storymap(
            id,
            {
                map_type: "osm",
                overlays,
                slides: [
                    { date: "", type: "overview", text: { headline: "Overview", text: "" } },
                    {
                        date: "",
                        text: { headline: "Stop", text: "Body." },
                        location: { lat: 48.85, lon: 2.35 },
                    },
                ],
            },
            options,
        );
    }

    function checkboxes(id: string): HTMLInputElement[] {
        return Array.from(
            document.querySelectorAll(`#${id} .vco-layers-group input[type="checkbox"]`),
        ) as HTMLInputElement[];
    }

    function radios(id: string): HTMLInputElement[] {
        return Array.from(
            document.querySelectorAll(`#${id} .vco-layers-group input[type="radio"]`),
        ) as HTMLInputElement[];
    }

    function overlayEntry(map_type: string, extra: Record<string, unknown> = {}) {
        return { map_type, ...extra };
    }

    it("builds one checkbox row per built overlay, in order", () => {
        const sm = baseStorymap("sm-layers-rows", [
            overlayEntry("./tiles/a/{z}/{x}/{y}.png", { attribution: "A" }),
            overlayEntry("./tiles/b/{z}/{x}/{y}.png", { attribution: "B" }),
        ]);
        const rows = checkboxes("sm-layers-rows");
        expect(rows).toHaveLength(2);
        expect(rows[0].checked).toBe(true);
        sm.dispose();
    });

    it("skips malformed entries so rows stay on the built-layer index", () => {
        const sm = baseStorymap("sm-layers-skip", [
            overlayEntry("./tiles/a/{z}/{x}/{y}.png"),
            { attribution: "no source at all" },
            overlayEntry("./tiles/b/{z}/{x}/{y}.png"),
        ]);
        expect(sm.getOverlayCount()).toBe(2);
        const rows = checkboxes("sm-layers-skip");
        expect(rows).toHaveLength(2);
        const spy = vi.spyOn(sm, "setOverlayVisible");
        rows[1].checked = false;
        rows[1].dispatchEvent(new Event("change", { bubbles: true }));
        expect(spy).toHaveBeenCalledWith(1, false);
        sm.dispose();
    });

    it("hides control:false rows without removing the overlay", () => {
        const sm = baseStorymap("sm-layers-hidden", [
            overlayEntry("./tiles/a/{z}/{x}/{y}.png"),
            overlayEntry("./tiles/b/{z}/{x}/{y}.png", { control: false }),
        ]);
        expect(sm.getOverlayCount()).toBe(2);
        expect(checkboxes("sm-layers-hidden")).toHaveLength(1);
        sm.dispose();
    });

    it("renders locked rows checked and disabled and never toggles them", () => {
        const sm = baseStorymap("sm-layers-locked", [
            overlayEntry("./tiles/a/{z}/{x}/{y}.png", { locked: true, label: "Scan" }),
        ]);
        const rows = checkboxes("sm-layers-locked");
        expect(rows).toHaveLength(1);
        expect(rows[0].checked).toBe(true);
        expect(rows[0].disabled).toBe(true);
        const spy = vi.spyOn(sm, "setOverlayVisible");
        rows[0].dispatchEvent(new Event("change", { bubbles: true }));
        expect(spy).not.toHaveBeenCalled();
        expect(rows[0].checked).toBe(true);
        sm.dispose();
    });

    it("unchecking a row hides the layer", () => {
        const sm = baseStorymap("sm-layers-toggle", [overlayEntry("./tiles/a/{z}/{x}/{y}.png")]);
        const spy = vi.spyOn(sm, "setOverlayVisible");
        const rows = checkboxes("sm-layers-toggle");
        rows[0].checked = false;
        rows[0].dispatchEvent(new Event("change", { bubbles: true }));
        expect(spy).toHaveBeenCalledWith(0, false);
        sm.dispose();
    });

    it("selecting a basemap radio switches the basemap", () => {
        const sm = baseStorymap("sm-layers-basemap", [overlayEntry("./tiles/a/{z}/{x}/{y}.png")], {
            basemaps: [
                { map_type: "osm", label: "Streets" },
                { map_type: "osm:standard", label: "Standard" },
            ],
        });
        const rows = radios("sm-layers-basemap");
        expect(rows).toHaveLength(2);
        expect(rows[0].checked).toBe(true);
        const spy = vi.spyOn(sm, "setMapOption");
        rows[1].checked = true;
        rows[1].dispatchEvent(new Event("change", { bubbles: true }));
        expect(spy).toHaveBeenCalledWith("map_type", "osm:standard");
        sm.dispose();
    });

    it("fires basemapchange and overlaychange on the viewer", () => {
        const sm = baseStorymap("sm-layers-events", [overlayEntry("./tiles/a/{z}/{x}/{y}.png")], {
            basemaps: [{ map_type: "osm" }, { map_type: "osm:standard" }],
        });
        const seen: { name: string; payload: unknown }[] = [];
        sm.on("basemapchange", (e) => seen.push({ name: "basemapchange", payload: e }));
        sm.on("overlaychange", (e) => seen.push({ name: "overlaychange", payload: e }));
        vi.spyOn(sm, "setMapOption").mockImplementation(() => {});
        vi.spyOn(sm, "setOverlayVisible").mockImplementation(() => {});
        const radioRows = radios("sm-layers-events");
        radioRows[1].checked = true;
        radioRows[1].dispatchEvent(new Event("change", { bubbles: true }));
        const boxRows = checkboxes("sm-layers-events");
        boxRows[0].checked = false;
        boxRows[0].dispatchEvent(new Event("change", { bubbles: true }));
        expect(seen).toContainEqual({
            name: "basemapchange",
            payload: expect.objectContaining({ map_type: "osm:standard" }),
        });
        expect(seen).toContainEqual({
            name: "overlaychange",
            payload: expect.objectContaining({ index: 0, visible: false }),
        });
        sm.dispose();
    });

    it("uses basemaps entry 0 when map_type says nothing", () => {
        const sm = storymap(
            "sm-layers-initial",
            {
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
            },
            { basemaps: [{ map_type: "osm:standard", label: "Standard" }] },
        );
        expect(sm.options.map_type).toBe("osm:standard");
        expect(sm.getBaseLayer()).not.toBeNull();
        sm.dispose();
    });

    it("drops image-space candidates on a mercator view with a warning", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const sm = storymap(
            "sm-layers-refuse",
            {
                map_type: "osm",
                // image-space basemaps only fit an image-space view; this
                // story asks for image treatment without being one, so the
                // live view stays mercator and `iiif` is refused
                map_as_image: true,
                overlays: [],
                slides: [{ date: "", type: "overview", text: { headline: "Overview", text: "" } }],
            },
            { basemaps: [{ map_type: "osm" }, { map_type: "iiif" }] },
        );
        expect(radios("sm-layers-refuse")).toHaveLength(1);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("iiif"));
        expect(sm.map?.getView()?.getProjection()?.getCode()).toBe("EPSG:3857");
        warn.mockRestore();
        sm.dispose();
    });

    it("re-invokes function labels on refreshLabels", () => {
        let version = 1;
        const sm = baseStorymap("sm-layers-i18n", [overlayEntry("./tiles/a/{z}/{x}/{y}.png")], {
            basemaps: [{ map_type: "osm", label: () => `Streets v${version}` }],
        });
        const label = () =>
            document.querySelector(`#sm-layers-i18n .vco-layers-label`)?.textContent;
        expect(label()).toBe("Streets v1");
        version = 2;
        (sm as unknown as { _menubar: { refreshLabels(): void } })._menubar.refreshLabels();
        expect(label()).toBe("Streets v2");
        sm.dispose();
    });

    it("renders no button without the option", () => {
        const sm = baseStorymap("sm-layers-off", [overlayEntry("./tiles/a/{z}/{x}/{y}.png")], {
            show_layers_control: false,
        });
        expect(document.querySelectorAll("#sm-layers-off button.vco-menubar-layers").length).toBe(
            0,
        );
        sm.dispose();
    });
});
