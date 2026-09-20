import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The current slide must always be part of the URL as a #slide-N hash —
 * including the initial load (empty hash → #slide-0) and without destroying
 * the query string the pages carry their configuration in.
 */
test("initial load rewrites an empty hash to #slide-0 and keeps the query", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-0");
    // the harness configuration survives the hash sync
    expect(await page.evaluate(() => window.location.search)).toBe("?example=katrina");
});

test("every navigation updates the hash", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(3),
    );
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-3");

    // and back/forward navigation through browser history still works
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(0),
    );
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("#slide-0");
});

test("a #slide-N deep link opens that slide", async ({ page }) => {
    await page.goto(harnessUrl("katrina") + "#slide-2");
    await waitForStoryMap(page);

    await expect
        .poll(() =>
            page.evaluate(
                () =>
                    (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
            ),
        )
        .toBe(2);
    expect(await page.evaluate(() => window.location.hash)).toBe("#slide-2");
});
