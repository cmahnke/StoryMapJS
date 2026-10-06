import { beforeAll, describe, expect, test, vi } from "vitest";
import { clampRegion } from "../src/storymap/iiif-shared";
import {
    buildSlideFilter,
    isStaticImageUrl,
    normalizeMask,
    slideBasemapKey,
    slideRotationRad,
} from "../src/map/slideView";
import { manifestToStorymapData } from "../src/storymap/iiif";
import { storymapToManifest } from "../src/storymap/to-iiif";
import { validateStorymap } from "../src/storymap/validate";
import { StoryMap } from "../src/storymap/StoryMap";
import MenuBar from "../src/ui/MenuBar";
import { shouldShowInfo } from "../src/media/Media";
import type { StorymapData, StorymapDataWrapper } from "../src/types";

describe("clampRegion", () => {
    test("keeps a valid region unchanged", () => {
        expect(clampRegion([10, 20, 30, 40], 1000, 800)).toEqual([10, 20, 30, 40]);
    });
    test("pulls a negative origin to zero, preserving the far edge", () => {
        expect(clampRegion([-922, 1005, 2129, 949], null, null)).toEqual([0, 1005, 1207, 949]);
    });
    test("intersects with known canvas dimensions", () => {
        expect(clampRegion([-10, -10, 5000, 5000], 1000, 800)).toEqual([0, 0, 1000, 800]);
        expect(clampRegion([900, 700, 500, 500], 1000, 800)).toEqual([900, 700, 100, 100]);
    });
    test("returns null when nothing visible remains", () => {
        expect(clampRegion([2000, 2000, 10, 10], 1000, 800)).toBeNull();
        expect(clampRegion([-10, 0, 5, 10], null, null)).toBeNull();
        expect(clampRegion([0, 0, 0, 10], 1000, 800)).toBeNull();
        expect(clampRegion([0, 0, 10, 0], 1000, 800)).toBeNull();
        expect(clampRegion([NaN, 0, 10, 10], 1000, 800)).toBeNull();
    });
});

describe("slideRotationRad", () => {
    test("converts degrees to radians", () => {
        expect(slideRotationRad({ rotation: 90 })).toBeCloseTo(Math.PI / 2);
        expect(slideRotationRad({ rotation: -45 })).toBeCloseTo(-Math.PI / 4);
    });
    test("is null for absent, zero or mistyped rotation", () => {
        expect(slideRotationRad({})).toBeNull();
        expect(slideRotationRad({ rotation: 0 })).toBeNull();
        expect(slideRotationRad(null)).toBeNull();
        expect(slideRotationRad({ rotation: "90" } as unknown as { rotation: number })).toBeNull();
        expect(slideRotationRad({ rotation: NaN })).toBeNull();
        expect(slideRotationRad({ rotation: Infinity })).toBeNull();
    });
});

describe("buildSlideFilter", () => {
    test("is empty for absent or default grading", () => {
        expect(buildSlideFilter(undefined)).toBe("");
        expect(buildSlideFilter(null)).toBe("");
        expect(buildSlideFilter({})).toBe("");
        expect(buildSlideFilter({ brightness: 100, contrast: 100 })).toBe("");
    });
    test("renders each grading as a CSS filter function", () => {
        expect(buildSlideFilter({ brightness: 120, sepia: 30 })).toBe(
            "brightness(120%) sepia(30%)",
        );
        expect(buildSlideFilter({ hueRotate: -90, blur: 2 })).toBe("hue-rotate(-90deg) blur(2px)");
        expect(buildSlideFilter({ contrast: 80, saturate: 150 })).toBe(
            "contrast(80%) saturate(150%)",
        );
    });
    test("clamps ranges and drops mistyped values", () => {
        expect(buildSlideFilter({ brightness: 500 })).toBe("brightness(200%)");
        expect(buildSlideFilter({ blur: -3 })).toBe("blur(0px)");
        expect(buildSlideFilter({ hueRotate: 400 })).toBe("hue-rotate(180deg)");
        expect(buildSlideFilter({ brightness: "high" } as unknown as { brightness: number })).toBe(
            "",
        );
    });
});

describe("normalizeMask", () => {
    test("passes a valid mask through with defaults", () => {
        expect(normalizeMask({ x: 0.1, y: 0.2, w: 0.5, h: 0.5 })).toEqual({
            x: 0.1,
            y: 0.2,
            w: 0.5,
            h: 0.5,
            color: "rgba(0,0,0,0.5)",
            invert: false,
            opacity: 1,
        });
    });
    test("keeps a valid color and invert flag", () => {
        const mask = normalizeMask({ x: 0, y: 0, w: 1, h: 1, color: "#ff0000cc", invert: true });
        expect(mask?.color).toBe("#ff0000cc");
        expect(mask?.invert).toBe(true);
    });
    test("rejects unusable shapes", () => {
        expect(normalizeMask(undefined)).toBeNull();
        expect(normalizeMask(null)).toBeNull();
        expect(normalizeMask({ x: 0, y: 0, w: 0, h: 1 })).toBeNull();
        expect(
            normalizeMask({
                x: 0,
                y: 0,
                w: 1,
            } as unknown as import("../src/types").StorymapSlideMask),
        ).toBeNull();
        expect(
            normalizeMask("passepartout" as unknown as import("../src/types").StorymapSlideMask),
        ).toBeNull();
    });
    test("clamps fractions and falls back on bad colors", () => {
        const mask = normalizeMask({ x: -0.5, y: 0, w: 2, h: 2, color: "not-a-color" });
        expect(mask?.x).toBe(0);
        expect(mask?.w).toBe(1);
        expect(mask?.color).toBe("rgba(0,0,0,0.5)");
    });
});

describe("isStaticImageUrl", () => {
    test("sniffs unambiguous raster files only", () => {
        expect(isStaticImageUrl("https://example.org/sheet.jpg")).toBe(true);
        expect(isStaticImageUrl("https://example.org/sheet.JPEG?w=1")).toBe(true);
        expect(isStaticImageUrl("https://example.org/i.png")).toBe(true);
        expect(isStaticImageUrl("https://example.org/i.tif")).toBe(true);
        // .jpx/.jp2 can be IIIF bases too: service attempt first
        expect(isStaticImageUrl("https://example.org/00000001.jpx")).toBe(false);
        expect(isStaticImageUrl("https://example.org/i.jp2")).toBe(false);
        expect(isStaticImageUrl("https://example.org/iiif/image/1")).toBe(false);
        expect(isStaticImageUrl("https://example.org/iiif/image/1/info.json")).toBe(false);
        expect(isStaticImageUrl("https://example.org/tiles/{z}/{x}/{y}.png")).toBe(false);
        expect(isStaticImageUrl("osm:bright")).toBe(false);
        expect(isStaticImageUrl("mapbox://styles/a/b")).toBe(false);
        expect(isStaticImageUrl("data:image/png;base64,iVBOR")).toBe(false);
    });

    test("sniffs same-origin relative image files", () => {
        expect(isStaticImageUrl("/examples-slideshow/static/pixel.png")).toBe(true);
        expect(isStaticImageUrl("./tiles/sheet.jpg")).toBe(true);
        expect(isStaticImageUrl("../img/scan.tif")).toBe(true);
        expect(isStaticImageUrl("./tiles/{z}/{x}/{y}.png")).toBe(false);
        expect(isStaticImageUrl("/iiif/image/1")).toBe(false);
    });
});

describe("slideBasemapKey", () => {
    test("returns the key only for a non-empty string", () => {
        expect(slideBasemapKey({ basemap: "osm:bright" })).toBe("osm:bright");
        expect(slideBasemapKey({})).toBeNull();
        expect(slideBasemapKey({ basemap: "" })).toBeNull();
        expect(slideBasemapKey(null)).toBeNull();
    });
});

function manifestWithCanvas(canvas: Record<string, unknown>): Record<string, unknown> {
    return {
        "@context": [
            "http://iiif.io/api/presentation/3/context.json",
            "https://cmahnke.github.io/StoryMapJS/navplace-properties.json",
            "https://cmahnke.github.io/StoryMapJS/context.json",
        ],
        id: "https://example.org/manifest",
        type: "Manifest",
        label: { none: ["Slideshow features"] },
        items: [canvas],
    };
}

function canvasWith(id: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        id,
        type: "Canvas",
        width: 1000,
        height: 800,
        items: [
            {
                id: `${id}/page/1`,
                type: "AnnotationPage",
                items: [
                    {
                        id: `${id}/annotation/1`,
                        type: "Annotation",
                        motivation: "painting",
                        body: { id: "https://example.org/image.jpg", type: "Image" },
                        target: id,
                    },
                ],
            },
        ],
        ...extra,
    };
}

describe("narration playback flags", () => {
    test("round-trips the full bag through a manifest", () => {
        const data: StorymapData = {
            slides: [
                {
                    text: { headline: "A" },
                    narration: {
                        url: "https://example.org/a.mp3",
                        loop: true,
                        offset: 4.5,
                        play: "click",
                        stopOnExit: false,
                        stopAllPrevious: false,
                    },
                },
            ],
        };
        expect(validateStorymap({ storymap: data })).toEqual([]);
        const manifest = storymapToManifest("slideshow", { storymap: data });
        const back = manifestToStorymapData(manifest as unknown as Record<string, unknown>);
        expect(back.slides[0]?.narration).toEqual({
            url: "https://example.org/a.mp3",
            loop: true,
            offset: 4.5,
            play: "click",
            stopOnExit: false,
            stopAllPrevious: false,
        });
    });

    test("reads storymap: flags off a supplementing annotation", () => {
        const canvas = canvasWith("https://example.org/canvas/1");
        const page = (canvas.items as Record<string, unknown>[])[0] as Record<string, unknown>;
        (page.items as Record<string, unknown>[]).push({
            id: "https://example.org/canvas/1/annotation/narration",
            type: "Annotation",
            motivation: "supplementing",
            body: { id: "https://example.org/n.mp3", type: "Sound" },
            target: "https://example.org/canvas/1",
            "storymap:loop": true,
            "storymap:offset": 2,
        });
        const back = manifestToStorymapData(manifestWithCanvas(canvas));
        expect(back.slides[0]?.narration).toMatchObject({
            url: "https://example.org/n.mp3",
            loop: true,
            offset: 2,
        });
    });

    test("a bare narration still reads as url-only", () => {
        const data: StorymapData = {
            slides: [{ text: { headline: "A" }, narration: { url: "https://example.org/a.mp3" } }],
        };
        const manifest = storymapToManifest("slideshow", { storymap: data });
        const back = manifestToStorymapData(manifest as unknown as Record<string, unknown>);
        expect(back.slides[0]?.narration).toEqual({ url: "https://example.org/a.mp3" });
    });
});

describe("view terms round-trip", () => {
    test("rotation, basemap, filter, mask, slidetimeout and imgoverlay survive", () => {
        const data: StorymapData = {
            slides: [
                {
                    text: { headline: "A" },
                    location: {
                        lat: 1,
                        lon: 2,
                        rotation: 45,
                        basemap: "osm:bright",
                        filter: { sepia: 40 },
                        mask: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                    },
                    slidetimeout: 9000,
                    imgoverlay: { url: "https://example.org/overlay.png", opacity: 0.8 },
                },
            ],
        };
        expect(validateStorymap({ storymap: data })).toEqual([]);
        const manifest = storymapToManifest("slideshow", { storymap: data });
        const back = manifestToStorymapData(manifest as unknown as Record<string, unknown>);
        expect(back.slides[0]?.location).toMatchObject({
            lat: 1,
            lon: 2,
            rotation: 45,
            basemap: "osm:bright",
            filter: { sepia: 40 },
            mask: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
        });
        expect(back.slides[0]?.slidetimeout).toBe(9000);
        expect(back.slides[0]?.imgoverlay).toMatchObject({
            url: "https://example.org/overlay.png",
            opacity: 0.8,
        });
    });

    test("media playback flags survive", () => {
        const data: StorymapData = {
            slides: [
                {
                    text: { headline: "A" },
                    media: { url: "https://example.org/a.mp3", loop: true, offset: 3 },
                },
            ],
        };
        expect(validateStorymap({ storymap: data })).toEqual([]);
        const manifest = storymapToManifest("slideshow", { storymap: data });
        const back = manifestToStorymapData(manifest as unknown as Record<string, unknown>);
        expect(back.slides[0]?.media).toMatchObject({
            url: "https://example.org/a.mp3",
            loop: true,
            offset: 3,
        });
    });
});

describe("chrome options", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });

    // Helpers build translator output by default (sourced=true simulates a
    // slideshow-loaded tour via the documented escape hatch); pass false for
    // an internal document, which must render exactly as before.
    function chromeStorymap(id: string, storymap: Record<string, unknown>, sourced = true) {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            { storymap } as unknown as StorymapDataWrapper,
            sourced ? ({ slideshow_source: true } as Record<string, unknown>) : undefined,
        );
    }

    function twoSlides(extra: Record<string, unknown> = {}) {
        return {
            slides: [
                { text: { headline: "One", text: "" } },
                { text: { headline: "Two", text: "" } },
            ],
            ...extra,
        };
    }

    test("accepts every new option and slide field", () => {
        expect(
            validateStorymap({
                storymap: {
                    ...twoSlides({
                        progressbar: "dots",
                        textmode: "left",
                        textsize: 30,
                        fxmode: "fade",
                        mode: "static",
                        hudcolor: "#fff",
                        hudbgcolor: "#000",
                        hudopacity: 75,
                        shownav: false,
                        show_headings: false,
                        show_scrollbars: false,
                        viewerheight: "400px",
                    }),
                    slides: [
                        {
                            text: { headline: "A" },
                            location: {
                                rotation: 45,
                                filter: { sepia: 10 },
                                mask: { x: 0, y: 0, w: 1, h: 1 },
                                basemap: "osm:bright",
                            },
                            narration: { url: "https://example.org/a.mp3", loop: true },
                            slidetimeout: 5000,
                            imgoverlay: { url: "https://example.org/o.png" },
                        },
                    ],
                },
            }),
        ).toEqual([]);
    });

    test("rejects mistyped chrome values", () => {
        const slides = [{ text: { headline: "A" } }];
        expect(
            validateStorymap({
                storymap: { slides, progressbar: "circles" },
            } as unknown as StorymapDataWrapper),
        ).not.toEqual([]);
        expect(
            validateStorymap({
                storymap: { slides, textmode: "top" },
            } as unknown as StorymapDataWrapper),
        ).not.toEqual([]);
        expect(
            validateStorymap({
                storymap: { slides, fxmode: "spin" },
            } as unknown as StorymapDataWrapper),
        ).not.toEqual([]);
        expect(
            validateStorymap({
                storymap: { slides, viewerheight: "tall" },
            } as unknown as StorymapDataWrapper),
        ).not.toEqual([]);
    });

    test("applies container chrome without changing the default layout", () => {
        chromeStorymap("sm-chrome", twoSlides({ textmode: "left" }));
        const container = document.getElementById("sm-chrome");
        expect(container?.classList.contains("vco-textmode-left")).toBe(true);
        chromeStorymap("sm-chrome-plain", twoSlides({}));
        expect(
            document.getElementById("sm-chrome-plain")?.classList.contains("vco-textmode-left"),
        ).toBe(false);
        expect(
            document.getElementById("sm-chrome-plain")?.classList.contains("vco-no-headings"),
        ).toBe(false);
    });

    test("hides headings and scrollbars on request", () => {
        chromeStorymap("sm-chrome-hide", twoSlides({ show_headings: false }));
        expect(
            document.getElementById("sm-chrome-hide")?.classList.contains("vco-no-headings"),
        ).toBe(true);
        const sms = chromeStorymap(
            "sm-chrome-scroll",
            twoSlides({ show_headings: false, show_scrollbars: false }),
        );
        expect(
            document.getElementById("sm-chrome-scroll")?.classList.contains("vco-no-scrollbars"),
        ).toBe(true);
        expect(sms).toBeDefined();
    });

    test("publishes HUD palette, height and panel size as CSS state", () => {
        chromeStorymap(
            "sm-chrome-hud",
            twoSlides({
                hudcolor: "#fff",
                hudbgcolor: "#000",
                hudopacity: 50,
                viewerheight: "400px",
                textsize: 30,
            }),
        );
        const container = document.getElementById("sm-chrome-hud");
        expect(container?.style.getPropertyValue("--vco-hud-fg")).toBe("#fff");
        expect(container?.style.getPropertyValue("--vco-hud-bg")).toContain("color-mix");
        expect(container?.style.height).toBe("400px");
        expect(container?.style.getPropertyValue("--vco-panel-size")).toBe("30%");
    });

    test("static mode stacks the slider and follows scroll-spy navigation", () => {
        const sms = chromeStorymap("sm-chrome-static", twoSlides({ mode: "static" }));
        expect(
            document.getElementById("sm-chrome-static")?.classList.contains("vco-mode-static"),
        ).toBe(true);
        const slider = (
            sms as unknown as {
                _storyslider: {
                    current_slide: number;
                    _isStatic(): boolean;
                    goTo(
                        n: number,
                        fast?: boolean,
                        displayupdate?: boolean,
                        fromScroll?: boolean,
                    ): void;
                };
            }
        )._storyslider;
        expect(slider._isStatic()).toBe(true);
        slider.goTo(1, true, true, true);
        expect(slider.current_slide).toBe(1);
    });

    test("shownav false keeps the navigation chrome hidden", () => {
        const sms = chromeStorymap("sm-chrome-nav", twoSlides({ shownav: false }));
        const slider = (
            sms as unknown as {
                _storyslider: {
                    showNav(nav: unknown, show: boolean): void;
                    _nav: { next: { _el: { container: HTMLElement } } };
                };
            }
        )._storyslider;
        slider.showNav(slider._nav.next, true);
        expect(slider._nav.next._el.container.style.display).toBe("none");
    });
});

describe("menu progress styles", () => {
    test("dots render one step per slide that jumps to its slide", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const menubar = new MenuBar(container, document.body, {
            progressbar: "dots",
            show_progress: false,
        });
        const spy: number[] = [];
        menubar.on("progress_go", (e: { slide: number }) => spy.push(e.slide));
        menubar.setProgress(0, 3);
        const steps = container.querySelectorAll("[data-slide]");
        expect(steps).toHaveLength(3);
        (steps[2] as HTMLButtonElement).click();
        expect(spy).toEqual([2]);
        menubar.setProgress(2, 3);
        expect(steps[2].getAttribute("aria-selected")).toBe("true");
    });

    test("off and false render no progress chrome", () => {
        for (const progressbar of ["off", false]) {
            const container = document.createElement("div");
            document.body.appendChild(container);
            const menubar = new MenuBar(container, document.body, { progressbar });
            menubar.setProgress(0, 3);
            expect(container.querySelector(".vco-menubar-progress")).toBeNull();
        }
    });

    test("true keeps the classic bar for old stories", () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const menubar = new MenuBar(container, document.body, { show_progress: true });
        menubar.setProgress(1, 3);
        expect(
            (container.querySelector(".vco-menubar-progress-fill") as HTMLElement)?.style.width,
        ).toBe("50%");
    });
});

describe("map per-slide presentation", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });

    function geoStorymap(id: string, locations: Record<string, unknown>[], sourced = true) {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            {
                storymap: {
                    slides: locations.map((location, n) => ({
                        text: { headline: `S${n}`, text: "" },
                        location: { lat: 10 + n, lon: 20, ...location },
                    })),
                },
            } as unknown as StorymapDataWrapper,
            sourced ? ({ slideshow_source: true } as Record<string, unknown>) : undefined,
        );
    }

    test("rotation applies instantly and resets on plain slides", () => {
        const sms = geoStorymap("sm-rot", [{ rotation: 45 }, {}]);
        const harness = sms as unknown as {
            map: { getView(): { getRotation(): number } };
            _map: {
                _applySlideRotation(loc: unknown, duration?: number, instant?: boolean): void;
            };
        };
        harness._map._applySlideRotation({ rotation: 45 }, undefined, true);
        expect(harness.map.getView().getRotation()).toBeCloseTo(Math.PI / 4);
        harness._map._applySlideRotation({}, undefined, true);
        expect(harness.map.getView().getRotation()).toBe(0);
    });

    test("filter grading and mask paint onto the viewport", () => {
        const sms = geoStorymap("sm-mask", [{}, {}]);
        const harness = sms as unknown as {
            map: { getViewport(): HTMLElement };
            _map: {
                _applySlideFilterAndMask(loc: unknown): void;
                _mask_el: HTMLElement | null;
            };
        };
        harness._map._applySlideFilterAndMask({
            filter: { sepia: 40 },
            mask: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
        });
        expect(harness.map.getViewport().style.filter).toContain("sepia(40%)");
        expect(harness._map._mask_el).not.toBeNull();
        harness._map._applySlideFilterAndMask({});
        expect(harness.map.getViewport().style.filter).toBe("");
        expect(harness._map._mask_el).toBeNull();
    });

    test("per-slide basemaps swap through a cache and restore", () => {
        const sms = geoStorymap("sm-base", [{}, {}]);
        const harness = sms as unknown as {
            _map: {
                _tile_layer: object | null;
                _switchSlideBasemap(loc: unknown): void;
                _slide_basemap: string | null;
            };
        };
        const map = harness._map;
        const first = map._tile_layer;
        map._switchSlideBasemap({ basemap: "stamen:toner-lite" });
        expect(map._slide_basemap).toBe("stamen:toner-lite");
        expect(map._tile_layer).not.toBe(first);
        map._switchSlideBasemap({ basemap: "stamen:toner-lite" });
        const cached = map._tile_layer;
        map._switchSlideBasemap({});
        expect(map._slide_basemap).toBeNull();
        expect(map._tile_layer).toBe(first);
        expect(cached).not.toBe(first);
    });

    test("a failed info.json falls back to a probed static layer", async () => {
        const sms = geoStorymap("sm-base-fallback", [{}, {}], true);
        const harness = sms as unknown as {
            _map: {
                _tile_layer: object | null;
                _basemap_cache: Map<string, object>;
                _switchSlideBasemap(loc: unknown): void;
                _probeStaticImage(url: string): Promise<{ width: number; height: number }>;
                _slide_basemap: string | null;
            };
        };
        const map = harness._map;
        const first = map._tile_layer;
        vi.stubGlobal(
            "fetch",
            () => Promise.reject(new Error("no service here")) as Promise<Response>,
        );
        try {
            map._probeStaticImage = () => Promise.resolve({ width: 640, height: 480 });
            map._switchSlideBasemap({ basemap: "https://example.org/00000001.jpx" });
            await new Promise((resolve) => setTimeout(resolve, 0));
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(map._slide_basemap).toBe("https://example.org/00000001.jpx");
            const layer = map._basemap_cache.get("https://example.org/00000001.jpx") as {
                getSource(): object | null;
                constructor: { name: string };
            };
            expect(layer.constructor.name).toBe("ImageLayer");
            expect(layer.getSource()).not.toBeNull();
            expect(map._tile_layer).toBe(layer);
            expect(map._tile_layer).not.toBe(first);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test("image overlays pin by extent and clear on null", () => {
        const sms = geoStorymap("sm-imgo", [{}, {}]);
        const harness = sms as unknown as {
            map: { getLayers(): { getLength(): number } };
            _map: {
                setSlideImageOverlay(overlay: unknown): void;
            };
        };
        const before = harness.map.getLayers().getLength();
        harness._map.setSlideImageOverlay({
            url: "https://example.org/overlay.png",
            extent: [19, 9, 21, 11],
            opacity: 0.5,
        });
        expect(harness.map.getLayers().getLength()).toBe(before + 1);
        harness._map.setSlideImageOverlay(null);
        expect(harness.map.getLayers().getLength()).toBe(before);
    });
});

describe("narration playback", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
        vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(
            () => Promise.resolve() as unknown as Promise<void>,
        );
    });

    function narrated(id: string, narrations: Record<string, unknown>[], sourced = true) {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            {
                storymap: {
                    slides: narrations.map((narration, n) => ({
                        text: { headline: `S${n}`, text: "" },
                        narration,
                    })),
                },
            } as unknown as StorymapDataWrapper,
            sourced ? ({ slideshow_source: true } as Record<string, unknown>) : undefined,
        );
    }

    type NarrationHarness = {
        current_slide: number;
        data: { slides: { narration?: { url: string } & Record<string, unknown> }[] };
        _playNarration(slide: unknown, allow?: boolean): void;
        _narration_el: HTMLAudioElement | null;
        _ambient_el: HTMLAudioElement | null;
        _replayNarrationAfterGesture: boolean;
    };

    test("a bare narration plays as before, with loop and offset", () => {
        const sms = narrated("sm-narr", [
            { url: "https://example.org/a.mp3", loop: true, offset: 5 },
        ]);
        const harness = sms as unknown as NarrationHarness;
        harness._playNarration(harness.data.slides[0], true);
        const el = harness._narration_el;
        expect(el?.src).toContain("https://example.org/a.mp3");
        expect(el?.loop).toBe(true);
        el?.dispatchEvent(new Event("loadedmetadata"));
        expect(el?.currentTime).toBe(5);
    });

    test("play click arms paused instead of playing", () => {
        const sms = narrated("sm-narr-click", [
            { url: "https://example.org/a.mp3", play: "click" },
        ]);
        const harness = sms as unknown as NarrationHarness;
        const play = vi.spyOn(window.HTMLMediaElement.prototype, "play");
        play.mockClear();
        harness._playNarration(harness.data.slides[0], true);
        expect(harness._narration_el?.src).toContain("https://example.org/a.mp3");
        expect(play).not.toHaveBeenCalled();
    });

    test("a persistent bed survives across same-URL slides", () => {
        const bed = { url: "https://example.org/bed.mp3", stopOnExit: false };
        const sms = narrated("sm-narr-bed", [bed, bed]);
        const harness = sms as unknown as NarrationHarness;
        harness._playNarration(harness.data.slides[0], true);
        const ambient = harness._ambient_el;
        expect(ambient?.src).toContain("https://example.org/bed.mp3");
        const pause = vi.spyOn(ambient as HTMLAudioElement, "pause");
        harness._playNarration(harness.data.slides[1], true);
        expect(pause).not.toHaveBeenCalled();
        expect(harness._ambient_el).toBe(ambient);
    });

    test("a new URL replaces the bed unless overlap is allowed", () => {
        const sms = narrated("sm-narr-replace", [
            { url: "https://example.org/bed.mp3", stopOnExit: false },
            { url: "https://example.org/next.mp3" },
        ]);
        const harness = sms as unknown as NarrationHarness;
        harness._playNarration(harness.data.slides[0], true);
        expect(harness._ambient_el?.src).toContain("bed.mp3");
        harness._playNarration(harness.data.slides[1], true);
        expect(harness._narration_el?.src).toContain("next.mp3");
        expect(harness._ambient_el?.getAttribute("src")).toBeNull();
    });
});

describe("internal documents stay unchanged", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });

    function internalStorymap(id: string, storymap: Record<string, unknown>) {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        // no slideshow_source: the document names the new keys anyway, and
        // every one of them must stay inert
        return new StoryMap(id, { storymap } as unknown as StorymapDataWrapper);
    }

    test("chrome options reset to defaults", () => {
        const sms = internalStorymap("sm-int-chrome", {
            slides: [
                { text: { headline: "One", text: "" } },
                { text: { headline: "Two", text: "" } },
            ],
            textmode: "left",
            textsize: 30,
            fxmode: "fade",
            mode: "static",
            hudcolor: "#fff",
            hudbgcolor: "#000",
            hudopacity: 50,
            shownav: false,
            show_headings: false,
            show_scrollbars: false,
            viewerheight: "400px",
            progressbar: "dots",
            show_info: false,
        });
        const options = (sms as unknown as { options: Record<string, unknown> }).options;
        expect(options.textmode).toBe("right");
        expect(options.textsize).toBeUndefined();
        expect(options.fxmode).toBe("slide");
        expect(options.mode).toBe("standard");
        expect(options.hudcolor).toBe("");
        expect(options.hudbgcolor).toBe("");
        expect(options.hudopacity).toBeUndefined();
        expect(options.shownav).toBe(true);
        expect(options.show_headings).toBe(true);
        expect(options.show_scrollbars).toBe(true);
        expect(options.viewerheight).toBe("");
        expect(options.show_info).toBe(true);
        expect(options.progressbar).toBeUndefined();
        const container = document.getElementById("sm-int-chrome");
        expect(container?.classList.contains("vco-textmode-left")).toBe(false);
        expect(container?.classList.contains("vco-no-headings")).toBe(false);
        expect(container?.classList.contains("vco-mode-static")).toBe(false);
        expect(container?.style.getPropertyValue("--vco-hud-fg")).toBe("");
        expect(container?.style.height).toBe("");
    });

    test("slide presentation fields stay inert", () => {
        const sms = internalStorymap("sm-int-map", {
            slides: [
                {
                    text: { headline: "S0", text: "" },
                    location: {
                        lat: 10,
                        lon: 20,
                        rotation: 45,
                        filter: { sepia: 40 },
                        mask: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                        basemap: "stamen:toner-lite",
                    },
                    narration: { url: "https://example.org/a.mp3", loop: true, offset: 5 },
                    slidetimeout: 1,
                    imgoverlay: { url: "https://example.org/o.png" },
                },
                { text: { headline: "S1", text: "" }, location: { lat: 11, lon: 21 } },
            ],
        });
        const harness = sms as unknown as {
            map: {
                getViewport(): HTMLElement;
                getLayers(): { getLength(): number };
                getView(): { getRotation(): number };
            };
            _map: {
                _mask_el: HTMLElement | null;
                _tile_layer: object | null;
                _slide_basemap: string | null;
            };
        };
        const layersBefore = harness.map.getLayers().getLength();
        const tileLayer = harness._map._tile_layer;
        const nav = sms as unknown as { goTo(n: number): void };
        // arrive at the fully-loaded slide from elsewhere: none of its
        // presentation fields may move the map
        nav.goTo(1);
        nav.goTo(0);
        expect(harness.map.getView().getRotation()).toBe(0);
        expect(harness.map.getViewport().style.filter).toBe("");
        expect(harness._map._mask_el).toBeNull();
        expect(harness._map._tile_layer).toBe(tileLayer);
        expect(harness._map._slide_basemap).toBeNull();
        expect(harness.map.getLayers().getLength()).toBe(layersBefore);
    });

    test("per-slide dwell stays on the global interval", () => {
        vi.useFakeTimers();
        try {
            const el = document.createElement("div");
            el.id = "sm-int-dwell";
            document.body.appendChild(el);
            const sms = new StoryMap("sm-int-dwell", {
                storymap: {
                    autoplay: 100,
                    slides: [
                        {
                            text: { headline: "S0", text: "" },
                            slidetimeout: 10000,
                        },
                        { text: { headline: "S1", text: "" } },
                    ],
                },
            } as unknown as StorymapDataWrapper);
            const current = () => (sms as unknown as { current_slide: number }).current_slide;
            expect(current()).toBe(0);
            vi.advanceTimersByTime(150);
            // gated: the 10s per-slide dwell is ignored, the global 100ms wins
            expect(current()).toBe(1);
        } finally {
            vi.useRealTimers();
        }
    });

    test("narration plays url-only with the global dwell", () => {
        const sms = internalStorymap("sm-int-narr", {
            slides: [
                {
                    text: { headline: "S0", text: "" },
                    narration: { url: "https://example.org/a.mp3", loop: true, offset: 5 },
                    slidetimeout: 1,
                },
            ],
        });
        const harness = sms as unknown as {
            data: { slides: { narration?: { url: string } }[] };
            _playNarration(slide: unknown, allow?: boolean): void;
            _narration_el: HTMLAudioElement | null;
            _ambient_el: HTMLAudioElement | null;
        };
        harness._playNarration(harness.data.slides[0], true);
        expect(harness._narration_el?.src).toContain("https://example.org/a.mp3");
        expect(harness._narration_el?.loop).toBe(false);
        expect(harness._ambient_el).toBeNull();
    });
});

describe("shouldShowInfo", () => {
    test("hides only for flagged tours that opt out", () => {
        expect(shouldShowInfo({})).toBe(true);
        expect(shouldShowInfo({ show_info: false })).toBe(true);
        expect(shouldShowInfo({ slideshow_source: true })).toBe(true);
        expect(shouldShowInfo({ slideshow_source: true, show_info: false })).toBe(false);
        expect(shouldShowInfo({ slideshow_source: true, show_info: true })).toBe(true);
    });
});

describe("static fallback probing", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });

    function probeStorymap(id: string, iiif: Record<string, unknown>, sourced: boolean) {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(
            id,
            {
                storymap: {
                    map_type: "iiif",
                    map_as_image: true,
                    iiif: { url: "https://iiif.example.org/info.json", attribution: "", ...iiif },
                    slides: [{ text: { headline: "S0", text: "" } }],
                },
            } as unknown as StorymapDataWrapper,
            sourced ? ({ slideshow_source: true } as Record<string, unknown>) : undefined,
        );
    }

    type ProbeMap = {
        _useStaticFallback(layer: object): boolean;
        _probeStaticImage(url: string): Promise<{ width: number; height: number }>;
        _buildStaticLayer(layer: object, url: string, width: number, height: number): void;
        getLayers(): { getLength(): number };
    };

    function probeMapOf(sms: StoryMap): ProbeMap {
        return (sms as unknown as { _map: ProbeMap })._map;
    }

    test("without dims and without the flag the legacy error path stands", () => {
        const sms = probeStorymap(
            "sm-probe-off",
            { fallbackUrl: "https://example.org/full.jpg" },
            false,
        );
        const map = probeMapOf(sms);
        const errors: unknown[][] = [];
        const orig = console.error;
        console.error = (...args: unknown[]) => {
            errors.push(args);
        };
        try {
            expect(map._useStaticFallback({} as object)).toBe(false);
        } finally {
            console.error = orig;
        }
        expect(errors).toEqual([]);
    });

    test("with the flag a dim-less fallback probes instead of failing", async () => {
        const sms = probeStorymap(
            "sm-probe-on",
            { fallbackUrl: "https://example.org/full.jpg" },
            true,
        );
        const map = probeMapOf(sms);
        const seen: string[] = [];
        map._probeStaticImage = (url: string) => {
            seen.push(url);
            return Promise.resolve({ width: 800, height: 600 });
        };
        const built: { width: number; height: number }[] = [];
        const origBuild = map._buildStaticLayer.bind(map);
        map._buildStaticLayer = (layer: object, url: string, width: number, height: number) => {
            built.push({ width, height });
            return origBuild(layer, url, width, height);
        };
        // construction itself already probed once (the info.json fetch
        // fails with no network); drain it and test the explicit call
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise((resolve) => setTimeout(resolve, 0));
        seen.length = 0;
        built.length = 0;
        expect(map._useStaticFallback({} as object)).toBe(true);
        await Promise.resolve();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(seen).toEqual(["https://example.org/full.jpg"]);
        expect(built).toEqual([{ width: 800, height: 600 }]);
    });

    test("a failed probe logs instead of painting", async () => {
        const sms = probeStorymap(
            "sm-probe-fail",
            { fallbackUrl: "https://example.org/full.jpg" },
            true,
        );
        const map = probeMapOf(sms);
        map._probeStaticImage = () => Promise.reject(new Error("load error"));
        const errors: unknown[][] = [];
        const orig = console.error;
        console.error = (...args: unknown[]) => {
            errors.push(args);
        };
        try {
            expect(map._useStaticFallback({} as object)).toBe(true);
            await new Promise((resolve) => setTimeout(resolve, 0));
            await new Promise((resolve) => setTimeout(resolve, 0));
        } finally {
            console.error = orig;
        }
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe("slideshow page chains", () => {
    beforeAll(() => {
        if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
            class ResizeObserverStub {
                observe() {}
                unobserve() {}
                disconnect() {}
            }
            (globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
        }
    });

    type ChainHarness = {
        _followSlideshowPages(
            doc: unknown,
            url: string,
        ): Promise<{ pages: unknown[]; complete: boolean }>;
    };

    function harness(id: string): ChainHarness {
        const el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
        return new StoryMap(id, {
            storymap: { slides: [{ text: { headline: "S0", text: "" } }] },
        } as unknown as StorymapDataWrapper) as unknown as ChainHarness;
    }

    function page(next?: string) {
        return { type: "AnnotationPage", items: [], ...(next !== undefined ? { next } : {}) };
    }

    test("follows relative chains in order", async () => {
        const sms = harness("sm-chain");
        vi.stubGlobal(
            "fetch",
            (url: string) =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(url.endsWith("/p2") ? page("/tour/p3") : page()),
                }) as Promise<Response>,
        );
        try {
            const result = await sms._followSlideshowPages(
                { first: page("/tour/p2") },
                "https://example.org/tour",
            );
            expect(result.complete).toBe(true);
            expect(result.pages).toHaveLength(2);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test("stops on cycles, errors and the hop bound", async () => {
        const sms = harness("sm-chain-stop");
        vi.stubGlobal("fetch", (url: string) => {
            if (url.endsWith("/loop")) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(page("https://example.org/tour")),
                }) as Promise<Response>;
            }
            return Promise.reject(new Error("down")) as Promise<Response>;
        });
        try {
            const cycled = await sms._followSlideshowPages(
                { first: page("/loop") },
                "https://example.org/tour",
            );
            expect(cycled.complete).toBe(false);
            expect(cycled.pages).toHaveLength(1);
            const broken = await sms._followSlideshowPages(
                { first: page("/missing") },
                "https://example.org/tour",
            );
            expect(broken.complete).toBe(false);
            expect(broken.pages).toHaveLength(0);
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test("a bare first page completes immediately", async () => {
        const sms = harness("sm-chain-bare");
        const result = await sms._followSlideshowPages({ first: page() }, "https://example.org/t");
        expect(result).toEqual({ pages: [], complete: true });
    });
});
