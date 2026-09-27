import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * Runtime surface added with the OpenLayers work: changing options after
 * construction, extending the attribution, rebuilding the minimap, and
 * switching the UI language. None of it had a browser test, and each is a
 * place where a runtime change can leave the map and the data disagreeing.
 */

async function waitForMap(page: import("@playwright/test").Page) {
    await expect
        .poll(
            () =>
                page.evaluate(
                    () => !!(window as unknown as { __sm?: { map?: unknown } }).__sm?.map,
                ),
            { timeout: 30_000 },
        )
        .toBe(true);
}

test("setMapOption toggles the route line at runtime", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(1500);

    const lineVisible = () =>
        page.evaluate(() => {
            const sm = (window as unknown as { __sm: { getLine(): unknown } }).__sm;
            const line = sm.getLine() as { getVisible(): boolean } | null;
            return line ? line.getVisible() : null;
        });

    expect(await lineVisible()).toBe(true);
    await page.evaluate(() => {
        (
            window as unknown as { __sm: { setMapOption(n: string, v: unknown): void } }
        ).__sm.setMapOption("show_lines", false);
    });
    await page.waitForTimeout(800);
    expect(await lineVisible()).toBe(false);

    // and back on, so the change is a toggle rather than a one-way door
    await page.evaluate(() => {
        (
            window as unknown as { __sm: { setMapOption(n: string, v: unknown): void } }
        ).__sm.setMapOption("show_lines", true);
    });
    await page.waitForTimeout(800);
    expect(await lineVisible()).toBe(true);
});

test("setMapOptions applies several keys at once", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);

    const result = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: {
                    setMapOptions(o: Record<string, unknown>): void;
                    options: Record<string, unknown>;
                };
            }
        ).__sm;
        sm.setMapOptions({ show_lines: false, map_opacity: 0.5 });
        return {
            showLines: sm.options.show_lines,
            opacity: sm.options.map_opacity,
            // the change reached the engine's options too, not just ours
            engineHasIt: (sm as unknown as { _map: { options: Record<string, unknown> } })._map
                .options.show_lines,
        };
    });
    expect(result.showLines).toBe(false);
    expect(result.opacity).toBe(0.5);
    expect(result.engineHasIt).toBe(false);
});

test("setExtraAttributions appends to the credit line", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(1500);

    const credit = () =>
        page.evaluate(() => {
            const el = document.querySelector(".vco-map-attribution");
            return el?.textContent?.trim() ?? "";
        });
    const before = await credit();
    expect(before.length).toBeGreaterThan(0);

    await page.evaluate(() => {
        (
            window as unknown as {
                __sm: { setExtraAttributions(parts: string[]): void };
            }
        ).__sm.setExtraAttributions(["Imagery courtesy of a custom layer"]);
    });
    await page.waitForTimeout(800);

    const after = await credit();
    expect(after).toContain("Imagery courtesy of a custom layer");
    // additive, not a replacement
    for (const fragment of before
        .split("|")
        .map((f) => f.trim())
        .filter(Boolean)) {
        expect(after).toContain(fragment);
    }
});

test("createMiniMap rebuilds the overview control", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(2000);

    // documented as idempotent enough for a host to call after a map_type swap
    // or a deferred consent grant
    const result = await page.evaluate(() => {
        const sm = (
            window as unknown as {
                __sm: { getMinimap(): unknown; createMiniMap(): void };
            }
        ).__sm;
        const before = !!sm.getMinimap();
        const errors: string[] = [];
        for (let i = 0; i < 2; i++) {
            try {
                sm.createMiniMap();
            } catch (e) {
                errors.push(String(e));
            }
        }
        return { before, after: !!sm.getMinimap(), errors };
    });
    expect(result.errors).toEqual([]);
    expect(result.before).toBe(true);
    expect(result.after).toBe(true);
});

test("refreshLanguage repaints the chrome", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const chrome = () =>
        page.evaluate(() => {
            const host = document.getElementById("storymap-embed") as HTMLElement;
            return {
                overview: host.querySelector(".vco-menubar-button")?.textContent?.trim() ?? "",
                rtl: host.classList.contains("vco-rtl"),
            };
        });

    const english = await chrome();
    expect(english.overview).toBe("Map Overview");
    expect(english.rtl).toBe(false);

    await page.evaluate(() => {
        (window as unknown as { __sm: { refreshLanguage(c: string): void } }).__sm.refreshLanguage(
            "de",
        );
    });
    await page.waitForTimeout(500);
    const german = await chrome();
    expect(german.overview).toBe("Kartenübersicht");

    // right-to-left is a layout class on the container, and it has to follow
    await page.evaluate(() => {
        (window as unknown as { __sm: { refreshLanguage(c: string): void } }).__sm.refreshLanguage(
            "he",
        );
    });
    await page.waitForTimeout(500);
    const hebrew = await chrome();
    expect(hebrew.rtl).toBe(true);

    expect(
        await page.evaluate(
            () => (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        ),
    ).toEqual([]);
});
