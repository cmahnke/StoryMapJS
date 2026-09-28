import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap, collectPageErrors } from "./known-issues/helpers";

/**
 * A story with no map: `map_type: "none"`.
 *
 * This is the product feature the internals plan's P0 exists for. The
 * interesting part is not that the map is invisible - it is that no `ol/Map`
 * is ever constructed, so there are no tile requests to consent to and nothing
 * for `loaded` to wait on.
 */
test.describe('map_type: "none"', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(harnessUrl("no-map"));
        await waitForStoryMap(page);
    });

    test("builds no map engine and no map pane", async ({ page }) => {
        const state = await page.evaluate(() => {
            const sm = (
                window as unknown as {
                    __sm: {
                        map: unknown;
                        _map: unknown;
                        _el: { map: unknown; container: { className: string } };
                    };
                }
            ).__sm;
            return {
                map: sm.map === null,
                engine: sm._map === null,
                pane: sm._el.map === null,
                paneInDom: !!document.querySelector("#storymap-embed .vco-map"),
                classes: sm._el.container.className,
            };
        });

        expect(state.map).toBe(true);
        expect(state.engine).toBe(true);
        expect(state.pane).toBe(true);
        expect(state.paneInDom).toBe(false);
        expect(state.classes).toContain("vco-layout-no-map");
    });

    test("requests no tiles at all", async ({ page }) => {
        const hosts: string[] = [];
        page.on("request", (req) => {
            const url = new URL(req.url());
            if (req.resourceType() !== "image") return;
            if (/tile|openstreetmap|arcgis|stamen|basemaps/i.test(url.href)) {
                hosts.push(url.host);
            }
        });

        await page.evaluate(() =>
            (window as unknown as { __sm: { goTo(n: number): void } }).__sm.goTo(1),
        );
        await page.waitForTimeout(2500);

        expect(hosts).toEqual([]);
    });

    test("fires loaded and shows the story", async ({ page }) => {
        const fired = await page.evaluate(async () => {
            const sm = (
                window as unknown as {
                    __sm: {
                        current_slide: number;
                        goTo(n: number): void;
                    };
                }
            ).__sm;
            await new Promise((r) => setTimeout(r, 600));
            sm.goTo(2);
            await new Promise((r) => setTimeout(r, 1600));
            return {
                current: sm.current_slide,
                headline: document
                    .querySelectorAll("#storymap-embed .vco-slide")[2]
                    ?.querySelector(".vco-headline")?.textContent,
            };
        });

        expect(fired.current).toBe(2);
        expect(fired.headline).toContain("Third slide");
    });

    test("the slider panel fills the width, with no map behind it", async ({ page }) => {
        const layout = await page.evaluate(() => {
            const panel = document.querySelector("#storymap-embed .vco-storyslider");
            const container = document.querySelector("#storymap-embed") as HTMLElement;
            if (!panel) return null;
            const p = panel.getBoundingClientRect();
            const c = container.getBoundingClientRect();
            return {
                panelWidth: p.width,
                containerWidth: c.width,
                // opaque, because there is nothing to fade over
                background: getComputedStyle(panel).backgroundColor,
            };
        });

        expect(layout).not.toBeNull();
        if (layout) {
            expect(layout.panelWidth).toBeGreaterThan(layout.containerWidth * 0.9);
            expect(layout.background).not.toMatch(/rgba\(.*,\s*0\)/);
        }
    });

    test("hides the overview control, which has no map to zoom out to", async ({ page }) => {
        const display = await page.evaluate(() => {
            const button = document.querySelector(
                "#storymap-embed .vco-menubar-button",
            ) as HTMLElement | null;
            return button ? getComputedStyle(button).display : "missing";
        });

        expect(display).toBe("none");
    });

    test("the hash and progress bar follow the slide", async ({ page }) => {
        await page.evaluate(() =>
            (window as unknown as { __sm: { goTo(n: number): void } }).__sm.goTo(1),
        );
        await page.waitForTimeout(1200);

        await expect(page).toHaveURL(/#slide-1/);
    });

    test("no page errors", async ({ page }) => {
        const errors = collectPageErrors(page);
        await page.waitForTimeout(1200);
        expect(errors).toEqual([]);
    });
});
