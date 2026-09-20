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
