import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Accessibility: slide changes are announced via an aria-live="polite"
 * status region (the headline or the slide position).
 */
test("slide changes are announced in the live region", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);

    const region = page.locator("#storymap-embed [aria-live='polite'][role='status']");
    await expect(region).toHaveCount(1);
    await expect(region).toBeAttached();

    // the initial announcement names the first slide
    await expect(region).not.toHaveText("");

    // navigating announces the new slide's headline
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await expect
        .poll(() => region.textContent(), { timeout: 10_000 })
        .not.toBe(await region.evaluate((el) => el.dataset.previous ?? ""));

    const text = await region.textContent();
    expect(text).toBeTruthy();
});

test("the live region is visually hidden", async ({ page }) => {
    await page.goto(harnessUrl("issue-305-start-at-slide"));
    await waitForStoryMap(page);

    const styles = await page.evaluate(() => {
        const el = document.querySelector("#storymap-embed [aria-live='polite']");
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { clipPath: cs.clipPath, position: cs.position, width: cs.width };
    });
    expect(styles?.clipPath).toBe("inset(50%)");
    expect(styles?.position).toBe("absolute");
    expect(styles?.width).toBe("1px");
});
