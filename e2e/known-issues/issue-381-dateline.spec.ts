import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #381 / #144 — "Minimap issues when path crosses International
 * Date Line" / "Crossing the dateline"
 * STILL APPLIES: the fit/line does not handle dateline-crossing marker sets —
 * markers land on opposite map copies (the horizontal spread spans nearly the
 * full viewport). Expected failure until dateline-aware fitting is added.
 */
test.fail("issue #381: markers across the dateline stay on the same map copy", async ({ page }) => {
    await page.goto(harnessUrl("issue-381-dateline"));
    await waitForStoryMap(page);
    await page.waitForTimeout(2500);

    const markerXs: number[] = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#storymap-embed .vco-map .vco-mapmarker")).map(
            (m) => Math.round(m.getBoundingClientRect().x),
        );
    });

    expect(markerXs.length).toBe(3);
    // all markers must be within a reasonable horizontal band (no marker at
    // the opposite side of the world)
    const min = Math.min(...markerXs);
    const max = Math.max(...markerXs);
    expect(max - min).toBeLessThan(900);
});

test("issue #144: navigating across the dateline moves the map continuously", async ({ page }) => {
    await page.goto(harnessUrl("issue-381-dateline"));
    await waitForStoryMap(page);

    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(3),
    );
    await page.waitForTimeout(2500);

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    expect(errors).toEqual([]);

    const state = await page.evaluate(() => ({
        slide: (window as unknown as { __sm?: { current_slide: number } }).__sm?.current_slide,
        hasView: !!document.querySelector("#storymap-embed .vco-map canvas"),
    }));
    expect(state.slide).toBe(3);
    expect(state.hasView).toBe(true);
});
