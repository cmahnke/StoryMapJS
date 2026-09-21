import { test, expect } from "@playwright/test";

/**
 * The landing page (Knight Lab product page look, rebuilt with own SCSS):
 * chrome sections present, example cards open the embed player with a
 * relative url parameter, FAQ accordion toggles.
 */
test("landing page renders the product chrome", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(String(err)));

    await page.goto("/index.html");

    await expect(page.locator(".navbar-dark")).toBeVisible();
    await expect(page.locator(".header-product .product-logo")).toContainText("StoryMap");
    await expect(page.locator("#navbar-secondary")).toBeVisible();
    await expect(page.locator("#overview")).toBeVisible();
    await expect(page.locator("#help")).toBeVisible();
    await expect(page.locator("ul.accordion li")).toHaveCount(10);
    await expect(page.locator(".footer-knightlab")).toBeVisible();

    // example cards are populated by src/site/site.ts
    const cards = await page.locator(".cards .card").count();
    expect(cards).toBeGreaterThan(5);
    expect(pageErrors).toEqual([]);
});

test("the demo iframe renders the storymap", async ({ page }) => {
    await page.goto("/index.html");
    await expect(
        page.frameLocator(".demo-frame").locator("#storymap-embed.vco-storymap"),
    ).toHaveCount(1);
    await expect
        .poll(
            () => page.frameLocator(".demo-frame").locator("#storymap-embed .vco-slide").count(),
            { timeout: 30_000 },
        )
        .toBeGreaterThan(0);
});

test("example cards open the embed player", async ({ page }) => {
    await page.goto("/index.html");
    await page.locator(".cards .card").first().click();

    await expect(page).toHaveURL(/embed\/index\.html\?url=/);
    await expect
        .poll(
            () =>
                page.evaluate(() => document.querySelectorAll("#storymap-embed .vco-slide").length),
            {
                timeout: 30_000,
            },
        )
        .toBeGreaterThan(0);
});

test("the FAQ accordion toggles", async ({ page }) => {
    await page.goto("/index.html#faq");
    const item = page.locator("ul.accordion li").nth(2);
    const box = item.locator("input[type=checkbox]");

    await box.uncheck();
    await expect(item.locator(".accordion-content")).toHaveCSS("max-height", "0px");
    await box.check();
    await expect
        .poll(() => item.locator(".accordion-content").evaluate((el) => el.clientHeight > 0))
        .toBe(true);
});
