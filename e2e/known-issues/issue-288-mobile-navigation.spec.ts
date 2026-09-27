import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #288 — "Storymap filling mobile screen prevents navigation past
 * the storymap"
 * FIXED: the story slider sets `touch-action: pan-y`, so a vertical swipe
 * scrolls the embedding page instead of being captured as a map pan, while the
 * viewer keeps working on a small screen.
 *
 * This spec previously shrank the viewport to phone dimensions and force-clicked
 * a nav arrow, which tested neither half of that. Without `hasTouch` the
 * browser still reports `pointer: fine` and `maxTouchPoints: 0`, so
 * `Browser.touch` and `Browser.mobile` are both false and the *desktop* branch
 * runs; and `.vco-slidenav-next` is `display: none` on mobile, so the click was
 * landing on a hidden element.
 */
test.use({ hasTouch: true });

/**
 * A real touch drag. Synthetic TouchEvents cannot scroll a page — only a real
 * input gesture can — so this goes through CDP, which is Chromium-only. The
 * callers skip where it is unavailable rather than silently passing.
 */
async function touchDrag(
    page: import("@playwright/test").Page,
    from: { x: number; y: number },
    to: { x: number; y: number },
): Promise<boolean> {
    let client: import("@playwright/test").CDPSession;
    try {
        client = await page.context().newCDPSession(page);
    } catch {
        return false; // not a CDP-capable browser
    }
    const steps = 8;
    await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: from.x, y: from.y }],
    });
    for (let i = 1; i <= steps; i++) {
        await client.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [
                {
                    x: from.x + ((to.x - from.x) * i) / steps,
                    y: from.y + ((to.y - from.y) * i) / steps,
                },
            ],
        });
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await client.detach().catch(() => {});
    return true;
}

test("the mobile branch is the one under test", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    // The precondition the old spec was missing: with hasTouch the browser
    // reports a coarse pointer, which is exactly what Browser.mobile reads, so
    // the mobile layout — not the desktop one — is what renders.
    //
    // Only `pointer: coarse` is asserted. `navigator.maxTouchPoints` and
    // "ontouchstart" in window are Chromium-specific under Playwright's
    // hasTouch: Firefox and WebKit both report a coarse pointer but leave
    // maxTouchPoints at 0, so asserting them would fail on two of the three
    // engines for no product reason. (Browser.touch does read ontouchstart,
    // which is a genuine engine difference worth knowing about, but it is not
    // what makes the mobile *layout* kick in.)
    const branch = await page.evaluate(() => ({
        coarse: window.matchMedia("(pointer: coarse)").matches,
    }));
    expect(branch.coarse).toBe(true);

    // the menubar goes icon-only on mobile, which is the observable
    // consequence of that branch
    const fullscreen = await page.evaluate(() => {
        const buttons = Array.from(
            document.querySelectorAll("#storymap-embed .vco-menubar-button"),
        );
        return buttons.map((b) => b.textContent?.trim() ?? "");
    });
    expect(fullscreen.some((label) => /full screen/i.test(label))).toBe(false);
    expect(fullscreen.length).toBeGreaterThan(0);
});

test("the slider carries touch-action: pan-y, the rule the fix is about", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const touchAction = await page.evaluate(() => {
        const slider = document.querySelector("#storymap-embed .vco-storyslider");
        return slider ? getComputedStyle(slider).touchAction : null;
    });
    // pan-y is what lets a vertical gesture scroll the embedding page instead
    // of being consumed as a map pan
    expect(touchAction).toBe("pan-y");
});

test("a vertical touch drag scrolls the page past the storymap", async ({ page }) => {
    test.skip(
        (test.info().project.name ?? "chromium") !== "chromium",
        "a real touch drag needs CDP; synthetic TouchEvents cannot scroll",
    );

    await page.setViewportSize({ width: 390, height: 500 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    // something below the storymap to scroll to
    await page.evaluate(() => {
        document.body.style.minHeight = "3000px";
    });
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    const dragged = await touchDrag(page, { x: 195, y: 420 }, { x: 195, y: 120 });
    expect(dragged).toBe(true);
    await page.waitForTimeout(1200);

    // the original symptom: the storymap swallowed the gesture and the page
    // could not be scrolled past it
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("the viewer still works on a small screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 720 });
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    // the nav arrows are display:none at this width, so the reachable
    // navigation is the menubar and the slide panel. Assert those are there
    // rather than force-clicking a hidden arrow, which is what the old spec
    // effectively did.
    await expect(page.locator("#storymap-embed .vco-menubar")).toBeVisible();
    await expect(page.locator("#storymap-embed .vco-menubar-button").first()).toBeVisible();
    await expect(page.locator("#storymap-embed .vco-storyslider")).toBeVisible();
    await expect(page.locator("#storymap-embed .vco-slide").first()).toBeVisible();

    const state = await page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        slide: (window as unknown as { __sm: { current_slide: number } }).__sm.current_slide,
        arrowsHidden:
            getComputedStyle(
                document.querySelector("#storymap-embed .vco-slidenav-next") as HTMLElement,
            ).display === "none",
    }));
    expect(state.errors).toEqual([]);
    expect(state.slide).toBe(0);
    // documents *why* the old spec had to force the click
    expect(state.arrowsHidden).toBe(true);
});
