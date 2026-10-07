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

    // a URL-string tour loads asynchronously (the viewer re-fetches it
    // after construction), so __smReady does not imply layout yet — poll
    // for the container instead of asserting a single shot
    await expect
        .poll(() => page.evaluate(() => !!document.querySelector("#storymap-embed.vco-storymap")), {
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

test("static mode follows the reading position", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    await page.goto('/harness.html?slideshow=single&options={"mode":"static"}');

    await expect
        .poll(() => page.evaluate(() => (window as unknown as { __smReady?: boolean }).__smReady), {
            timeout: 30_000,
        })
        .toBe(true);

    // the opening goTo() keeps the scroll-spy deaf for its 600ms settle
    // window; scrolling inside it would go unheard (the entry fires once,
    // is ignored, and nothing re-fires)
    await page.waitForTimeout(800);

    // scroll the stacked list to the second slide: the scroll-spy must fire
    // change so the map follows (not just flip the active class)
    await page.evaluate(() => {
        const slides = document.querySelectorAll("#storymap-embed .vco-slide");
        slides[1]?.scrollIntoView({ block: "start" });
    });
    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        (window as unknown as { __sm?: { current_slide: number } }).__sm
                            ?.current_slide,
                ),
            { timeout: 15_000 },
        )
        .toBe(1);

    expect(pageErrors, "uncaught exceptions").toEqual([]);
    expect(
        await page.evaluate(() => (window as unknown as { __smErrors?: string[] }).__smErrors),
        "window errors",
    ).toEqual([]);
});

function collectPageErrors(page: Page): string[] {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}
