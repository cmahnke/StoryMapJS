import { test, expect, type Page } from "@playwright/test";
import { harnessUrl } from "./known-issues/helpers";

/**
 * GDPR consent mode (`consent_required: true`): every external service asks
 * for permission before anything is loaded — map tiles, media embeds.
 * Denied services show a placeholder instead.
 */

/** Click the Allow/Deny button of the consent ask visible in the viewport. */
async function clickVisibleButton(page: Page, kind: "allow" | "deny"): Promise<boolean> {
    return page.evaluate((kindLocal) => {
        const buttons = [
            ...document.querySelectorAll(
                kindLocal === "allow" ? ".vco-consent-allow" : ".vco-consent-deny",
            ),
        ];
        const visible = buttons.find((btn) => {
            const r = btn.getBoundingClientRect();
            return (
                r.x >= 0 &&
                r.x < window.innerWidth &&
                r.y >= 0 &&
                r.y < window.innerHeight &&
                r.width > 0
            );
        });
        if (visible) {
            (visible as HTMLButtonElement).click();
            return true;
        }
        return false;
    }, kind);
}

test("map tiles are blocked until allowed", async ({ page }) => {
    const tileRequests: string[] = [];
    page.on("request", (r) => {
        if (/openfreemap|basemaps|tile|osm/i.test(r.url())) tileRequests.push(r.url());
    });

    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await page.waitForTimeout(4500);

    // the consent bar renders over the map; no tile requests yet
    await expect(page.locator(".vco-consent").first()).toBeVisible();
    const before = tileRequests.length;
    expect(before).toBe(0);

    await clickVisibleButton(page, "allow");
    await expect
        .poll(() => tileRequests.length, { timeout: 20_000, message: "tiles load after allowing" })
        .toBeGreaterThan(0);
    // the map-tiles ask is gone once answered (asks for other services in
    // preloaded slides legitimately remain until they are visited)
    await expect(page.locator(".vco-consent", { hasText: "map tiles" })).toHaveCount(0);
});

test("media embeds are blocked until allowed and show a placeholder on deny", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await page.waitForTimeout(4500);
    await clickVisibleButton(page, "allow"); // map tiles

    // navigate to a youtube slide: the media area shows the ask, no iframe
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(3000);
    await expect(page.locator(".vco-media .vco-consent").first()).toBeVisible();
    expect(
        await page.evaluate(() => document.querySelectorAll("#storymap-embed iframe").length),
    ).toBe(0);

    // deny: the placeholder replaces the media, no iframe ever loads
    await clickVisibleButton(page, "deny");
    await page.waitForTimeout(3000);
    await expect(page.locator(".vco-consent-blocked").first()).toBeVisible();
    expect(
        await page.evaluate(() => document.querySelectorAll("#storymap-embed iframe").length),
    ).toBe(0);
});

test("answering one panel resolves the pending panels of the same service", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await page.waitForTimeout(4500);
    await clickVisibleButton(page, "allow"); // map tiles

    // slide 2 and 4 are both youtube; the preloaded asks for both exist.
    // Allowing one resolves both — the other slide loads without asking.
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(3000);
    await clickVisibleButton(page, "allow");
    await page.waitForTimeout(4000);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(4),
    );
    await page.waitForTimeout(3500);
    // slide 4's youtube media loaded without a new ask (iframe present,
    // no visible ask for it)
    const iframes = await page.evaluate(
        () => document.querySelectorAll("#storymap-embed iframe").length,
    );
    expect(iframes).toBeGreaterThan(0);
});
