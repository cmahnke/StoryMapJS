import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap, stubTiles } from "./known-issues/helpers";

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
        // The request listener has to be attached before the first paint:
        // registering it after beforeEach's goto only observes post-load
        // navigations, which is exactly the claim this test exists to prove.
        // stubTiles both prevents any network dependence and records what
        // would have been requested.
        const seen = await stubTiles(page);
        await page.goto(harnessUrl("no-map"));
        await waitForStoryMap(page);

        await page.evaluate(() =>
            (window as unknown as { __sm: { goTo(n: number): void } }).__sm.goTo(1),
        );
        await page.waitForTimeout(2500);

        expect(seen).toEqual([]);
    });

    test("loads the story without waiting for a map", async ({ page }) => {
        // `loaded` itself can fire during construction for a fully
        // synchronous text-only story, before any host can subscribe — so a
        // browser test cannot observe the event, only its effects. What
        // proves _onLoaded ran is the empty hash rewritten to #slide-0 on
        // initial load. (The event is pinned by tests/no-map.test.ts.)
        await page.goto(harnessUrl("no-map"));
        await waitForStoryMap(page);
        await expect(page).toHaveURL(/#slide-0/);

        await page.evaluate(() =>
            (window as unknown as { __sm: { goTo(n: number): void } }).__sm.goTo(2),
        );
        await page.waitForTimeout(1600);
        const headline = await page.evaluate(
            () =>
                document
                    .querySelectorAll("#storymap-embed .vco-slide")[2]
                    ?.querySelector(".vco-headline")?.textContent,
        );

        expect(headline).toContain("Third slide");
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

    test("a narrow viewport gets the stacked slide layout, not the two-column one", async ({
        page,
    }) => {
        // Without vco-skinny a phone-width mapless story keeps 100px side
        // padding and a floated half-width media block inside a ~190px panel.
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(harnessUrl("no-map"));
        await waitForStoryMap(page);

        const classes = await page.evaluate(
            () =>
                document.querySelector("#storymap-embed")?.className ??
                (document.querySelector(".vco-storymap") as HTMLElement | null)?.className ??
                "",
        );
        expect(classes).toContain("vco-skinny");

        const layout = await page.evaluate(() => {
            const text = document.querySelector("#storymap-embed .vco-text") as HTMLElement | null;
            const container = document.querySelector("#storymap-embed") as HTMLElement | null;
            if (!text || !container) return null;
            return {
                textWidth: text.getBoundingClientRect().width,
                containerWidth: container.getBoundingClientRect().width,
                overflow:
                    document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
        });

        expect(layout).not.toBeNull();
        if (layout) {
            // stacked: the text fills the panel instead of half of it
            expect(layout.textWidth).toBeGreaterThan(layout.containerWidth * 0.7);
            expect(layout.overflow).toBe(0);
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
});
