import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Connections between previous slides stay marked: stepping forward through
 * the story accumulates the traveled path on the active line instead of
 * replacing it with the latest hop. Only the latest hop animates — the
 * already-traveled prefix stays drawn red from the first frame while the
 * new segment traces progressively. (katrina slide 0 is an overview without
 * a location, so the traveled path starts at marker 1.)
 */
test("forward navigation keeps previous connections marked", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    const readCoords = () =>
        page.evaluate(() => {
            const coords = (
                window as unknown as {
                    __sm?: {
                        _map?: {
                            _line_active?: {
                                getSource?(): {
                                    getFeatures?(): {
                                        getGeometry?(): { getCoordinates?(): number[][] };
                                    }[];
                                };
                            };
                        };
                    };
                }
            ).__sm?._map?._line_active
                ?.getSource?.()
                .getFeatures?.()[0]
                ?.getGeometry?.()
                .getCoordinates?.();
            return coords ?? [];
        });
    const goTo = (n: number) =>
        page.evaluate(
            (x) => (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(x),
            n,
        );

    await goTo(1);
    await page.waitForTimeout(2200);
    await goTo(2);
    await page.waitForTimeout(2200);
    const afterTwo = await readCoords();
    // traveled path [1..2]
    expect(afterTwo.length).toBe(2);

    await goTo(3);
    // sample mid-animation: the traveled prefix is already fully drawn
    // while only the new hop is still tracing
    await page.waitForTimeout(150);
    const during = await readCoords();
    expect(during.length).toBeGreaterThanOrEqual(2);
    expect(during[0]).toEqual(afterTwo[0]);
    expect(during[1]).toEqual(afterTwo[1]);

    await page.waitForTimeout(2200);
    const afterThree = await readCoords();
    // traveled path [1..3]: the 1->2 connection stays marked, ...
    expect(afterThree.length).toBe(3);
    // ... starting at exactly the same point as before
    expect(afterThree[0]).toEqual(afterTwo[0]);
    expect(afterThree[1]).toEqual(afterTwo[1]);
    // ... and mid-animation only the new hop was still growing
    expect(during.length < 3 || JSON.stringify(during[2]) !== JSON.stringify(afterThree[2])).toBe(
        true,
    );
});
