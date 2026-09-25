import { test, expect } from "@playwright/test";

// The embed page is the classic script-tag-free consumption path for
// published storymaps: a plain page loading the built ESM bundle. The `url`
// parameter is resolved against the site root, so relative URLs from the
// landing page cards work in dev, preview and GitHub Pages project subpaths.
test("embed page renders a storymap", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/embed/index.html?url=/examples/katrina.json");

    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            {
                timeout: 20_000,
                message: "waiting for slides to render",
            },
        )
        .toBeGreaterThan(0);

    expect(pageErrors, "uncaught exceptions on the embed page").toEqual([]);
});

test("embed page resolves a relative url parameter", async ({ page }) => {
    // this is exactly what the landing page example cards link to —
    // previously resolved against /embed/ and 404'd, leaving a blank page
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/embed/index.html?url=examples%2Fkatrina.json");

    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            { timeout: 20_000, message: "waiting for slides to render" },
        )
        .toBeGreaterThan(0);

    expect(pageErrors, "uncaught exceptions on the embed page").toEqual([]);
});

test("embed page honors start_at_slide", async ({ page }) => {
    await page.goto("/embed/index.html?url=examples%2Fkatrina.json&start_at_slide=2");

    // the viewer syncs the current slide into the URL hash
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 20_000 })
        .toBe("#slide-2");
});

test("embed page honors autoplay", async ({ page }) => {
    await page.goto("/embed/index.html?url=examples%2Fkatrina.json&autoplay=600");

    // autoplay advances past the first slide without any interaction
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 20_000 })
        .toBe("#slide-1");
});

test("embed page ignores an invalid autoplay parameter", async ({ page }) => {
    await page.goto("/embed/index.html?url=examples%2Fkatrina.json&autoplay=banana");

    // no autoplay timer is scheduled: the initial slide sticks
    await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 20_000 })
        .toBe("#slide-0");
    await page.waitForTimeout(3000);
    await expect(await page.evaluate(() => window.location.hash)).toBe("#slide-0");
});

test("embed page without url shows an input to open a storymap", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/embed/index.html");

    await expect(page.locator("#storymap-url-form")).toBeVisible();
    await expect(page.locator("#storymap-url-input")).toBeVisible();
    await expect(page.locator("#storymap-embed .vco-slide")).toHaveCount(0);

    await page.locator("#storymap-url-input").fill("examples/katrina.json");
    await page.locator("#storymap-url-form button[type=submit]").click();

    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            { timeout: 20_000, message: "waiting for slides to render after url submit" },
        )
        .toBeGreaterThan(0);

    expect(new URL(page.url()).searchParams.get("url")).toBe("examples/katrina.json");
    expect(pageErrors, "uncaught exceptions on the embed page").toEqual([]);
});
