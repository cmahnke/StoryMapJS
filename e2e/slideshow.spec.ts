import { test, expect, type Page } from "@playwright/test";

// StoryMap reads a slideshow tour (?slideshow= fetches from
// public/examples-slideshow/ and passes the raw tour to the constructor,
// exercising detector → translator → wiring in the browser).
test("slideshow tour renders its slides", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    await page.goto("/harness.html?slideshow=single");

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
    // the single tour fixture converts to two slides
    expect(state.slideCount, "expected the tour slides to render").toBe(2);

    // the opening stop carries a 45° rotation: the region fit and the
    // rotation glide run sequentially, so poll instead of sleeping fixed
    await expect
        .poll(
            () =>
                page.evaluate(() =>
                    (
                        window as unknown as {
                            __sm?: { map: { getView(): { getRotation(): number } } };
                        }
                    ).__sm?.map
                        .getView()
                        .getRotation(),
                ),
            { timeout: 15_000 },
        )
        .toBeCloseTo(Math.PI / 4, 1);

    // navigation across the converted slides works, rotating to the stop
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
