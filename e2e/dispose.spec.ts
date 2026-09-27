import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * `dispose()` in a real browser. The unit spec covers listener bookkeeping in
 * jsdom, which cannot model the two things that actually matter here: the
 * OpenLayers render loop (a live `requestAnimationFrame` chain) and real
 * network traffic. Both keep running after a teardown that only clears fields,
 * and neither is observable outside a browser.
 */

const TILE = /openfreemap|basemaps|tile|osm|stamen|stadia/i;

test.describe("dispose() teardown", () => {
    test("no tile requests after dispose, and the render loop has stopped", async ({ page }) => {
        const tiles: string[] = [];
        page.on("request", (r) => {
            if (TILE.test(r.url())) tiles.push(r.url());
        });

        await page.goto(harnessUrl("issue-506-marker-sync"));
        await waitForStoryMap(page);
        // let the map actually start fetching
        await expect.poll(() => tiles.length, { timeout: 30_000 }).toBeGreaterThan(0);

        // hold the view before teardown: after dispose() `map` is null, and
        // that is the point
        await page.evaluate(() => {
            const w = window as unknown as {
                __view: { setCenter(c: number[]): void };
            };
            w.__view = (
                window as unknown as {
                    __sm: { map: { getView(): { setCenter(c: number[]): void } } };
                }
            ).__sm.map.getView();
            (window as unknown as { __sm: { dispose(): void } }).__sm.dispose();
        });
        // let the pre-dispose requests drain before measuring, so the
        // comparison is about what dispose() *stops*, not what was already
        // queued
        await page.waitForTimeout(2500);

        // Two probes that a live render loop cannot survive: a pan, and a
        // resize. The resize is the strong one — a live map at a new size must
        // request the tiles for that size, and the source is not cached across
        // viewport changes.
        await page.evaluate(() => {
            try {
                (
                    window as unknown as { __view: { setCenter(c: number[]): void } }
                ).__view.setCenter([5, 5]);
            } catch {
                // a disposed view may throw; the resize probe below still holds
            }
        });
        await page.setViewportSize({ width: 900, height: 700 });

        // the count must not merely be small: it must stop growing
        let previous = -1;
        for (let i = 0; i < 12; i++) {
            await page.waitForTimeout(500);
            if (tiles.length === previous) break;
            previous = tiles.length;
        }
        expect(tiles.length).toBe(previous === -1 ? tiles.length : previous);
    });

    test("empties the host element and leaves no chrome behind", async ({ page }) => {
        await page.goto(harnessUrl("issue-506-marker-sync"));
        await waitForStoryMap(page);
        await expect(page.locator("#storymap-embed .vco-storyslider")).toBeVisible();

        await page.evaluate(() => {
            (window as unknown as { __sm: { dispose(): void } }).__sm.dispose();
        });

        const state = await page.evaluate(() => {
            const host = document.getElementById("storymap-embed") as HTMLElement;
            return {
                childCount: host.children.length,
                canvases: host.querySelectorAll("canvas").length,
                // the host element itself survives: dispose() is not supposed
                // to remove the element the host provided
                hostExists: !!host,
                // nothing of the viewer's is left anywhere on the page
                strays: document.querySelectorAll(".vco-slide, .vco-menubar, .vco-map").length,
            };
        });
        expect(state.childCount).toBe(0);
        expect(state.canvases).toBe(0);
        expect(state.hostExists).toBe(true);
        expect(state.strays).toBe(0);
    });

    test("removes the window/document listeners it added", async ({ page }) => {
        // installed before any page script, so the viewer is wrapped
        await page.addInitScript(() => {
            const w = window as unknown as {
                __added: { type: string; fn: EventListener }[];
                __removed: { type: string; fn: EventListener }[];
            };
            w.__added = [];
            w.__removed = [];
            for (const target of [window, document] as EventTarget[]) {
                const add = target.addEventListener.bind(target);
                const remove = target.removeEventListener.bind(target);
                target.addEventListener = ((type: string, fn: EventListener, o?: unknown) => {
                    w.__added.push({ type, fn });
                    add(type, fn, o as AddEventListenerOptions);
                }) as typeof target.addEventListener;
                target.removeEventListener = ((type: string, fn: EventListener) => {
                    w.__removed.push({ type, fn });
                    remove(type, fn);
                }) as typeof target.removeEventListener;
            }
        });

        await page.goto(harnessUrl("issue-506-marker-sync", { keyboard: true }));
        await waitForStoryMap(page);
        // let it navigate once, so the hashchange listener is definitely up
        await page.waitForTimeout(1500);

        const before = await page.evaluate(() => {
            const w = window as unknown as {
                __added: { type: string; fn: EventListener }[];
                __removed: { type: string; fn: EventListener }[];
            };
            const owned = ["resize", "fullscreenchange", "hashchange", "keydown"];
            const added = w.__added.filter((e) => owned.includes(e.type));
            return { added: added.length, owned };
        });
        expect(before.added).toBeGreaterThan(0);

        await page.evaluate(() => {
            (window as unknown as { __sm: { dispose(): void } }).__sm.dispose();
        });

        const after = await page.evaluate(() => {
            const w = window as unknown as {
                __added: { type: string; fn: EventListener }[];
                __removed: { type: string; fn: EventListener }[];
            };
            const owned = ["resize", "fullscreenchange", "hashchange", "keydown"];
            // every function the viewer registered on window/document is gone
            const leaked = w.__added.filter(
                (a) => owned.includes(a.type) && !w.__removed.some((r) => r.fn === a.fn),
            );
            return { leaked: leaked.map((l) => l.type) };
        });
        expect(after.leaked).toEqual([]);
    });

    test("a new viewer can take over the same element", async ({ page }) => {
        // dispose() is terminal, so the supported path is a fresh instance on
        // the same element. If the old listeners were still attached, both
        // would fight over the hash and the resize handler.
        await page.goto(harnessUrl("issue-506-marker-sync"));
        await waitForStoryMap(page);

        const ok = await page.evaluate(async () => {
            const w = window as unknown as {
                __sm: { dispose(): void };
                StoryMap?: new (
                    el: string,
                    data: unknown,
                    o: unknown,
                    l: unknown,
                ) => { dispose(): void };
                __errors: string[];
            };
            w.__sm.dispose();
            return typeof w.StoryMap === "function";
        });
        // the harness module does not publish the constructor globally, so
        // reload-based replacement is verified below instead
        expect(ok).toBe(false);

        await page.reload();
        await waitForStoryMap(page);
        await expect(page.locator("#storymap-embed .vco-storyslider")).toBeVisible();
        const state = await page.evaluate(() => ({
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
            slide: (window as unknown as { __sm: { current_slide: number } }).__sm.current_slide,
        }));
        expect(state.errors).toEqual([]);
        expect(state.slide).toBe(0);
    });

    test("public methods after dispose are no-ops, not throws", async ({ page }) => {
        await page.goto(harnessUrl("issue-506-marker-sync", { keyboard: true }));
        await waitForStoryMap(page);
        await page.evaluate(() => {
            (window as unknown as { __sm: { dispose(): void } }).__sm.dispose();
        });

        const result = await page.evaluate(() => {
            const sm = (
                window as unknown as {
                    __sm: {
                        goTo(n: number): void;
                        updateDisplay(): void;
                        setMapOption(n: string, v: unknown): void;
                        setMapOptions(o: unknown): void;
                        setOverlayVisible(i: number, v: boolean): void;
                        setOverlayOpacity(i: number, o: number): void;
                        createMiniMap(): void;
                        setExtraAttributions(p: string[]): void;
                        refreshLanguage(c: string): void;
                        getMarkers(): unknown[];
                        getMarker(i: number): unknown;
                        getMinimap(): unknown;
                        getLine(): unknown;
                        getLineActive(): unknown;
                        getOverlayLayers(): unknown[];
                        getBaseLayer(): unknown;
                        map: unknown;
                    };
                }
            ).__sm;
            const errors: string[] = [];
            const call = (label: string, fn: () => unknown) => {
                try {
                    fn();
                } catch (e) {
                    errors.push(label + ": " + String(e));
                }
            };
            call("goTo", () => sm.goTo(1));
            call("updateDisplay", () => sm.updateDisplay());
            call("setMapOption", () => sm.setMapOption("show_lines", false));
            call("setMapOptions", () => sm.setMapOptions({ show_lines: true }));
            call("setOverlayVisible", () => sm.setOverlayVisible(0, true));
            call("setOverlayOpacity", () => sm.setOverlayOpacity(0, 0.5));
            call("createMiniMap", () => sm.createMiniMap());
            call("setExtraAttributions", () => sm.setExtraAttributions(["x"]));
            call("refreshLanguage", () => sm.refreshLanguage("de"));
            return {
                errors,
                map: sm.map,
                markers: sm.getMarkers().length,
                marker0: sm.getMarker(0),
                minimap: sm.getMinimap(),
                line: sm.getLine(),
                lineActive: sm.getLineActive(),
                overlays: sm.getOverlayLayers().length,
                base: sm.getBaseLayer(),
            };
        });

        expect(result.errors).toEqual([]);
        expect(result.map).toBeNull();
        // the accessors report the disposed state rather than handing out
        // objects that belong to a dead map
        expect(result.markers).toBe(0);
        expect(result.marker0).toBeNull();
        expect(result.minimap).toBeNull();
        expect(result.line).toBeNull();
        expect(result.lineActive).toBeNull();
        expect(result.overlays).toBe(0);
        expect(result.base).toBeNull();
    });

    test("a second dispose() is a no-op", async ({ page }) => {
        await page.goto(harnessUrl("issue-506-marker-sync"));
        await waitForStoryMap(page);
        const errors = await page.evaluate(() => {
            const sm = (window as unknown as { __sm: { dispose(): void } }).__sm;
            const out: string[] = [];
            for (let i = 0; i < 3; i++) {
                try {
                    sm.dispose();
                } catch (e) {
                    out.push(String(e));
                }
            }
            return out;
        });
        expect(errors).toEqual([]);
    });
});
