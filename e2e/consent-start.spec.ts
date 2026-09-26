import { test, expect, type Page } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Start-of-story consent (`consent_required: true`): one dialog lists the
 * external services the story uses — map tiles, media services, web fonts
 * — with "Allow all" / "Decline all" plus per-service choices. Fully
 * translated (all locales).
 */

/** Click a start-dialog button by text. */
async function clickStartAction(page: Page, text: string): Promise<void> {
    await page.evaluate((label) => {
        const dialog = document.querySelector(".vco-consent-start");
        if (!dialog) return;
        for (const btn of Array.from(dialog.querySelectorAll("button"))) {
            if (btn.textContent?.trim() === label) {
                btn.click();
                return;
            }
        }
    }, text);
}

test("the start dialog lists the story's external services", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await waitForStoryMap(page);

    const dialog = page.locator(".vco-consent-start");
    await expect(dialog).toBeVisible();
    // katrina uses map tiles and YouTube
    await expect(dialog.locator(".vco-consent-service", { hasText: "map tiles" })).toHaveCount(1);
    await expect(dialog.locator(".vco-consent-service", { hasText: "YouTube" })).toHaveCount(1);
});

test("decline all loads no external content", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (r) => {
        if (/openfreemap|basemaps|tile|osm|youtube|vimeo|flickr/i.test(r.url())) {
            requests.push(r.url());
        }
    });

    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await waitForStoryMap(page);
    await clickStartAction(page, "Decline all");
    await page.waitForTimeout(4000);

    // navigating to a youtube slide still loads nothing external
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(3000);
    expect(requests.filter((r) => /youtube/i.test(r))).toEqual([]);
    expect(requests.filter((r) => /openfreemap|basemaps|tile|osm/i.test(r))).toEqual([]);
});

test("allow all loads map tiles and unblocks media", async ({ page }) => {
    const tileRequests: string[] = [];
    page.on("request", (r) => {
        if (/openfreemap|basemaps|tile|osm/i.test(r.url())) tileRequests.push(r.url());
    });

    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await waitForStoryMap(page);
    await clickStartAction(page, "Allow all");

    await expect
        .poll(() => tileRequests.length, { timeout: 20_000, message: "tiles load after allow all" })
        .toBeGreaterThan(0);
    // the dialog is gone
    await expect(page.locator(".vco-consent-start")).toHaveCount(0);
});

test("individual choices ask per-service on the slide", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { consent_required: true }));
    await waitForStoryMap(page);

    // allow map tiles individually, leave youtube unanswered
    await clickStartAction(page, "Allow"); // first row: map tiles
    await page.waitForTimeout(1000);

    // the dialog stays (youtube unanswered); navigate to the youtube slide:
    // the per-service ask appears there
    await expect(page.locator(".vco-consent-start")).toBeVisible();
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(2),
    );
    await page.waitForTimeout(3000);
    await expect(page.locator(".vco-media .vco-consent").first()).toBeVisible();
    expect(
        await page.evaluate(() => document.querySelectorAll("#storymap-embed iframe").length),
    ).toBe(0);
});

test("the start dialog is translated (german)", async ({ page }) => {
    await page.goto(harnessUrl("katrina", { consent_required: true, language: "de" }));
    await waitForStoryMap(page);

    const dialog = page.locator(".vco-consent-start");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".vco-consent-title")).toHaveText("Externe Inhalte");
    const actions = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".vco-consent-start-actions button")).map((b) =>
            b.textContent?.trim(),
        ),
    );
    expect(actions).toEqual(["Alle erlauben", "Alle ablehnen"]);
});
