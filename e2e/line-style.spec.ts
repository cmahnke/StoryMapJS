import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * The marker-connecting lines must render like the original: dashed
 * (line_dash "5,5") with line_join "miter", on BOTH the inactive route
 * line and the active line, from the initial render on.
 */
test("route lines are dashed like the original from the start", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    const lines = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm?: {
                    _map?: {
                        _line?: {
                            getStyle(): {
                                getStroke?(): { getLineDash?(): number[]; getLineJoin?(): string };
                            };
                        };
                        _line_active?: {
                            getStyle(): {
                                getStroke?(): { getLineDash?(): number[]; getLineJoin?(): string };
                            };
                        };
                    };
                };
            }
        ).__sm?._map;
        const read = (l: {
            getStyle(): { getStroke?(): { getLineDash?(): number[]; getLineJoin?(): string } };
        }) => {
            const stroke = l?.getStyle()?.getStroke();
            return { dash: stroke?.getLineDash(), join: stroke?.getLineJoin() };
        };
        return { inactive: read(sm?._line), active: read(sm?._line_active) };
    });

    expect(lines.inactive.dash).toEqual([5, 5]);
    expect(lines.inactive.join).toBe("miter");
    expect(lines.active.dash).toEqual([5, 5]);
    expect(lines.active.join).toBe("miter");
});

/**
 * The active (red) line must be drawn progressively in sync with the view
 * animation: halfway through the pan, halfway the route is red — not the
 * whole line at once.
 */
test("the active line traces the route during the animation", async ({ page }) => {
    await page.goto(harnessUrl("katrina"));
    await waitForStoryMap(page);

    // settle on the first real marker (instant navigation, full line)
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(1),
    );
    await page.waitForTimeout(2500);

    const readPoints = () =>
        page.evaluate(() => {
            const map = (window as unknown as { __sm?: { _map?: { _line_active?: unknown } } }).__sm
                ?._map;
            const source = (
                map?._line_active as {
                    getSource?(): {
                        getFeatures?(): { getGeometry?(): { getCoordinates?(): unknown[] } }[];
                    };
                }
            )?.getSource?.();
            return source?.getFeatures?.()[0]?.getGeometry?.().getCoordinates?.().length ?? 0;
        });

    const before = await readPoints();

    // jump to a distant marker: the view animation runs ~1s; sample early
    await page.evaluate(() =>
        (window as unknown as { __sm?: { goTo(n: number): void } }).__sm?.goTo(4),
    );
    await page.waitForTimeout(120);
    const during = await readPoints();
    await page.waitForTimeout(2500);
    const after = await readPoints();

    // the line starts short (a prefix of the path) and grows to full length
    expect(during).toBeGreaterThan(0);
    expect(during).toBeLessThanOrEqual(after);
    expect(during).toBeLessThan(after || Infinity);
    expect(before).not.toBe(after);
    // ... and it settles at the complete geometry (katrina slides 1→4 cross
    // several intermediate markers)
    expect(after).toBeGreaterThan(before);
});
