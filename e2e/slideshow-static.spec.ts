import { test, expect, type Page } from "@playwright/test";

// A tour backed by a plain image file (?slideshow=static serves a tour
// whose image_srv is same-origin static, exercising the sniff → probe →
// static basemap path in the browser with no external network).
test("static-file tour paints its basemap", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    await page.goto("/harness.html?slideshow=static");

    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);

    await expect
        .poll(
            () =>
                page.evaluate(() => {
                    const sm = (
                        window as unknown as {
                            __sm?: {
                                map: {
                                    getLayers(): {
                                        getArray(): {
                                            getSource(): {
                                                getImageExtent?: () => number[] | null;
                                            } | null;
                                        }[];
                                    };
                                };
                            };
                        }
                    ).__sm;
                    const layers = sm?.map.getLayers().getArray() ?? [];
                    // a painted static basemap: a layer whose source exposes
                    // an image extent (class names are mangled in dist builds)
                    return layers.some(
                        (layer) => typeof layer.getSource()?.getImageExtent === "function",
                    );
                }),
            { timeout: 15_000 },
        )
        .toBe(true);

    const state = await page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors,
        slideCount: document.querySelectorAll("#storymap-embed .vco-slide").length,
    }));

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    expect(state.errors, "window errors").toEqual([]);
    expect(state.slideCount, "expected the tour slide to render").toBe(1);
});

function collectPageErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}
