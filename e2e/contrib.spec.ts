import { test, expect, type Page } from "@playwright/test";

/**
 * The contrib examples load the built artifacts (../../dist/) and exercise
 * plain-HTML, autoplay and React integration of the fork's ESM build. They
 * run against the static repo-root server (port 8300, see
 * playwright.config.ts) — NOT the vite preview of dist/.
 */

async function waitForReady(page: Page, timeout = 30_000) {
    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        !!(window as unknown as { storymap?: { ready?: boolean } }).storymap?.ready,
                ),
            { timeout },
        )
        .toBe(true);
}

const BASE = "http://localhost:8300";

test("contrib storymap-basic renders", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(`${BASE}/contrib/examples/storymap-basic.html`);
    await waitForReady(page);

    const slides = await page.evaluate(
        () => document.querySelectorAll("#mapdiv .vco-slide").length,
    );
    expect(slides).toBeGreaterThan(1);
    expect(errors).toEqual([]);
});

test("contrib storymap-autoload advances slides", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(`${BASE}/contrib/examples/storymap-autoload.html`);
    await waitForReady(page);

    // autoplay advances after 5s; interaction would stop it, so don't touch
    await expect
        .poll(
            () =>
                page.evaluate(
                    () =>
                        (window as unknown as { storymap?: { current_slide?: number } }).storymap
                            ?.current_slide,
                ),
            { timeout: 15_000 },
        )
        .toBeGreaterThan(0);
    expect(errors).toEqual([]);
});

test("contrib storymap-react renders", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(`${BASE}/contrib/examples/storymap-react.html`);
    await waitForReady(page);

    const slides = await page.evaluate(() => document.querySelectorAll("#root .vco-slide").length);
    expect(slides).toBeGreaterThan(1);
    expect(errors).toEqual([]);
});
