import { test, expect, type Page } from "@playwright/test";

// StoryMap read from an IIIF Presentation 3.0 manifest (?manifest= fetches from
// public/examples-iiif/ and passes the manifest object to the constructor,
// exercising the manifest → storymap conversion path in the browser).
test("katrina manifest renders its slides", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    await page.goto("/harness.html?manifest=katrina");

    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);

    const state = await page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors,
        hasContainer: !!document.querySelector("#storymap-embed.vco-storymap"),
        slideCount: document.querySelectorAll("#storymap-embed .vco-slide").length,
    }));

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    expect(state.errors, "window errors").toEqual([]);
    expect(state.hasContainer, "no .vco-storymap rendered").toBe(true);
    // katrina has 8 canvases (an overview plus 7 story slides)
    expect(state.slideCount, "expected the katrina slides to render").toBe(8);

    // navigation across the converted slides works
    const next = page.locator("#storymap-embed .vco-slidenav-next").first();
    if (await next.isVisible()) {
        await next.click();
        await page.waitForTimeout(1500);
        expect(
            await page.evaluate(() => (window as unknown as { __smErrors?: string[] }).__smErrors),
            "window errors after navigation",
        ).toEqual([]);
    }
});

function collectPageErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}
