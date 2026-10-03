import { test, expect } from "@playwright/test";
import { getState, harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Layers control (`show_layers_control`): a disclosure button in the menubar
 * opens an absolutely-positioned panel of basemap radios and overlay
 * checkboxes (docs/plans/layers-control.md §1.3). Toggling a row drives the
 * matching layer and its credit, Escape dismisses the panel, and arrow keys
 * on a radio row stay native instead of paging the slider.
 */
test("layers control toggles overlays without paging the slider", async ({ page }) => {
    // NOTE: stubTiles() cannot run before goto here: its TILE_HOST matcher
    // (/osm|tile/.../i) matches the `basemaps` options payload in the
    // harness URL itself and would swallow the page. Stub only the overlay
    // tile paths, which can never collide with the harness document.
    const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64",
    );
    await page.route(/\/tiles\//, async (route) => {
        await route.fulfill({ status: 200, contentType: "image/png", body: png });
    });
    await page.goto(
        harnessUrl("layers-control", {
            show_layers_control: true,
            basemaps: [
                { map_type: "osm", label: "Streets" },
                { map_type: "./tiles/basemap-bright/{z}/{x}/{y}.png", label: "Bright" },
            ],
        }),
    );
    await waitForStoryMap(page);

    const button = page.locator("#storymap-embed button.vco-menubar-layers");
    await expect.poll(() => button.count()).toBe(1);

    await button.click();
    const panel = page.locator("#storymap-embed .vco-layers");
    await expect.poll(() => panel.isVisible()).toBe(true);

    const rows = panel.locator(".vco-layers-group input[type='checkbox']");
    await expect.poll(() => rows.count()).toBe(2);

    // the first overlay starts visible and credited
    const attribution = page.locator("#storymap-embed .vco-map-attribution");
    await expect.poll(() => attribution.textContent()).toContain("Historic sheet (demo overlay)");
    await expect.poll(() => rows.first().isChecked()).toBe(true);

    // unchecking the row hides the layer and drops its credit
    await rows.first().uncheck();
    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    (
                        window as unknown as {
                            __sm?: { getOverlayLayer(i: number): { getVisible(): boolean } | null };
                        }
                    ).__sm
                        ?.getOverlayLayer(0)
                        ?.getVisible() ?? null,
            ),
        )
        .toBe(false);
    await expect
        .poll(() => attribution.textContent())
        .not.toContain("Historic sheet (demo overlay)");

    // Escape closes the panel
    await page.keyboard.press("Escape");
    await expect.poll(() => panel.isHidden()).toBe(true);

    // keyboard:true (in the fixture) pages the slider on arrows globally, so a
    // radio row must keep them native: moving the selection must not turn the
    // slide.
    await button.click();
    await expect.poll(() => panel.isVisible()).toBe(true);
    const radios = panel.locator(".vco-layers-group input[type='radio']");
    await expect.poll(() => radios.count()).toBe(2);
    const before = (await getState(page)).currentSlide;
    await radios.first().focus();
    await page.keyboard.press("ArrowRight");
    // A page would animate for ~a second (see e2e/keyboard.spec.ts), so a
    // fixed dwell is the only honest negative assertion here.
    await page.waitForTimeout(1500);
    const state = await getState(page);
    expect(state.currentSlide).toBe(before);
    expect(state.errors).toEqual([]);
});
