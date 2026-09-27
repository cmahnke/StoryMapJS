import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/**
 * `tile_source_factory` lets a host supply the base layer itself. It is the
 * documented extension point for a third-party layer (an Allmaps
 * `WarpedMapLayer`, say), and it is the one option whose value is a *function* —
 * which is why it could not be covered by the `?options={json}` harness
 * affordance. The factory arrives via `window.__tileSourceFactory`, installed by
 * an init script so it exists before the harness module runs.
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

test("the factory's layer is the one that ends up on the map", async ({ page }) => {
    // Returning a *decorated* default avoids needing OpenLayers constructors
    // inside the page (the bundle does not export them), while still proving
    // the claim under test: whatever the factory returns is what becomes the
    // base layer, not the built-in one.
    await page.addInitScript(() => {
        (
            window as unknown as {
                __tileSourceFactory?: (
                    mapType: string,
                    context: { createDefault: () => { setOpacity(o: number): unknown } },
                ) => unknown;
            }
        ).__tileSourceFactory = (_mapType, context) => {
            const layer = context.createDefault();
            layer.setOpacity(0.42);
            return layer;
        };
    });

    await page.goto(harnessUrl("empty"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(1500);

    const state = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { getBaseLayer(): unknown } }).__sm;
        const base = sm.getBaseLayer() as { getOpacity(): number } | null;
        return {
            opacity: base?.getOpacity() ?? null,
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
    // the factory's opacity survived, so the map is using the factory's layer
    expect(state.opacity).toBeCloseTo(0.42, 5);
    expect(state.errors).toEqual([]);
});

test("a factory returning null falls through to the default map_type", async ({ page }) => {
    // the documented escape hatch: `null`/`undefined` means "use the built-in
    // map_type handling", so a factory can decorate selectively
    await page.addInitScript(() => {
        (window as unknown as { __tileSourceFactory?: () => null }).__tileSourceFactory = () =>
            null;
    });

    await page.goto(harnessUrl("empty"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(1500);

    const state = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { getBaseLayer(): unknown; map: unknown } }).__sm;
        const base = sm.getBaseLayer() as { getSource(): { getUrls?(): string[] } } | null;
        return {
            hasBase: !!base,
            urls: base?.getSource?.().getUrls?.() ?? [],
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
    // the default OSM source, not a factory layer
    expect(state.hasBase).toBe(true);
    expect(state.urls.length).toBeGreaterThan(0);
    expect(state.errors).toEqual([]);
});

test("the factory receives the map_type and a createDefault escape hatch", async ({ page }) => {
    // the factory contract itself: (map_type, { options, createDefault }) => layer
    await page.addInitScript(() => {
        (
            window as unknown as {
                __factoryCalls?: {
                    mapType: unknown;
                    hasCreateDefault: boolean;
                    hasOptions: boolean;
                }[];
                __tileSourceFactory?: (
                    mapType: string,
                    context: { options: unknown; createDefault: () => unknown },
                ) => unknown;
            }
        ).__factoryCalls = [];
        (
            window as unknown as {
                __tileSourceFactory?: (
                    mapType: string,
                    context: { options: unknown; createDefault: () => unknown },
                ) => unknown;
            }
        ).__tileSourceFactory = (mapType, context) => {
            const w = window as unknown as {
                __factoryCalls?: {
                    mapType: unknown;
                    hasCreateDefault: boolean;
                    hasOptions: boolean;
                }[];
            };
            w.__factoryCalls?.push({
                mapType,
                hasCreateDefault: typeof context.createDefault === "function",
                hasOptions: !!context.options,
            });
            // delegate, which is the documented way to keep the default
            return context.createDefault();
        };
    });

    // issue-177-color-vars sets map_type: "osm" and is not an image map. The
    // `empty` fixture sets no map_type at all, and the value the factory then
    // receives is the "" option default — so naming a fixture that sets it is
    // what makes "the factory gets the document's map_type" distinguishable
    // from "the factory gets a string".
    await page.goto(harnessUrl("issue-177-color-vars"));
    await waitForStoryMap(page);
    await waitForMap(page);
    await page.waitForTimeout(1500);

    const calls = await page.evaluate(
        () => (window as unknown as { __factoryCalls?: unknown[] }).__factoryCalls ?? [],
    );
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls as {
        mapType: string;
        hasCreateDefault: boolean;
        hasOptions: boolean;
    }[]) {
        expect(call.mapType).toBe("osm");
        expect(call.hasCreateDefault).toBe(true);
        expect(call.hasOptions).toBe(true);
    }
    // delegating through createDefault gives a working map
    const state = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { getBaseLayer(): unknown } }).__sm;
        return {
            hasBase: !!sm.getBaseLayer(),
            errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        };
    });
    expect(state.hasBase).toBe(true);
    expect(state.errors).toEqual([]);
});
