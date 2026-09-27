import { test, expect, type Page } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

const IIIF_INFO =
    "https://iiif.io/api/image/3.0/example/reference/28473c77da3deebe4375c3a50572d9d3-laocoon/info.json";

/**
 * `imageready` exists because a real IIIF/zoomify source is attached
 * *asynchronously*: OpenLayers can fire `loadend`, and the viewer can fire
 * `loaded`, before the imagery is on the map. The only test for it drove a
 * hand-rolled fake engine in jsdom, which cannot model an async attach at all.
 * This is the browser-level check the event was written for.
 */

interface Imageready {
    type: string;
    payload: {
        kind?: string;
        source?: { state?: string; type?: string; url?: string };
        layer?: { type?: string; state?: string } | null;
    };
}

function events(page: Page): Promise<Imageready[]> {
    return page.evaluate(() => (window as unknown as { __events?: Imageready[] }).__events ?? []);
}

function imageready(page: Page): Promise<Imageready[]> {
    return events(page).then((all) => all.filter((e) => e.type === "imageready"));
}

test("imageready fires once per source, and only once the source is ready", async ({ page }) => {
    // iiif-wellcome is an image-mode IIIF story: the source is built from
    // info.json and attached after construction, which is the whole reason
    // this event exists
    await page.goto(harnessUrl("iiif-wellcome") + "&record=imageready");
    await waitForStoryMap(page);

    await expect
        .poll(() => imageready(page).then((e) => e.length), { timeout: 30_000 })
        .toBeGreaterThan(0);

    const seen = await imageready(page);
    // one event per source object: the base layer and the minimap can ask
    // about the same source, and a host should not have to filter duplicates
    const sources = new Set(seen.map((e) => JSON.stringify(e.payload.source)));
    expect(sources.size).toBe(seen.length);

    for (const event of seen) {
        expect(event.payload.kind).toBe("iiif");
        // the payload's whole value: the source is usable at the moment it
        // fires, which `loaded` does not guarantee
        expect(event.payload.source?.state).toBe("ready");
        expect(event.payload.layer).not.toBeNull();
    }
});

test("the map is already measurable when imageready fires", async ({ page }) => {
    // The point of the event: a host that overlays or measures its own layers
    // needs a sized viewport and a resolved view the instant it arrives, since
    // `loaded` can fire before the imagery exists. The harness snapshots the
    // map at fire time, which is the only way to check this without the test
    // racing the event — it cannot attach a listener before construction.
    await page.goto(harnessUrl("iiif-wellcome") + "&record=imageready");
    await waitForStoryMap(page);
    await expect
        .poll(() => imageready(page).then((e) => e.length), { timeout: 30_000 })
        .toBeGreaterThan(0);

    for (const event of await imageready(page)) {
        const target = (event.payload as unknown as { target?: Record<string, unknown> }).target;
        // a sized viewport
        expect(Array.isArray(target?.size)).toBe(true);
        expect((target?.size as number[])[0]).toBeGreaterThan(0);
        expect((target?.size as number[])[1]).toBeGreaterThan(0);
        // a resolved view, in the projection the mode chose
        expect(target?.center).not.toBeNull();
        expect(target?.resolution).toBeGreaterThan(0);
        expect(target?.projection).toBe("EPSG:4326");
    }
});

test("imageready is not a synonym for loaded", async ({ page }) => {
    // The case the event exists for, made deterministic: hold the info.json
    // back so the viewer reports itself loaded with no imagery at all. If
    // imageready were just a second name for `loaded` it would already have
    // fired by then.
    //
    // Known blind spot: the harness subscribes *after* the constructor, so an
    // event fired during construction would be invisible here. Covering that
    // would need a local stub source the test controls end to end.
    let release: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
        release = resolve;
    });
    await page.route(IIIF_INFO, async (route) => {
        await held;
        await route.continue();
    });

    await page.goto(harnessUrl("iiif-wellcome") + "&record=imageready,loaded");
    await waitForStoryMap(page);

    // the viewer reports itself ready with the imagery still outstanding
    await expect.poll(() => imageready(page).then((e) => e.length), { timeout: 5_000 }).toBe(0);
    const readyWithoutImagery = await page.evaluate(
        () => (window as unknown as { __smReady?: boolean }).__smReady === true,
    );
    expect(readyWithoutImagery).toBe(true);

    release?.();
    await expect
        .poll(() => imageready(page).then((e) => e.length), { timeout: 30_000 })
        .toBeGreaterThan(0);
    for (const event of await imageready(page)) {
        expect(event.payload.source?.state).toBe("ready");
    }
    expect(
        await page.evaluate(
            () => (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        ),
    ).toEqual([]);
});

test("a plain tile map still loads and reports no errors", async ({ page }) => {
    // OSM is an ordinary tile layer that is ready synchronously, so there is
    // nothing asynchronous to wait for. This guards the event machinery
    // against breaking a normal map.
    await page.goto(harnessUrl("empty") + "&record=imageready");
    await waitForStoryMap(page);
    await page.waitForTimeout(2000);

    const state = await page.evaluate(() => ({
        errors: (window as unknown as { __smErrors?: string[] }).__smErrors ?? [],
        map: !!(window as unknown as { __sm?: { map?: unknown } }).__sm?.map,
    }));
    expect(state.errors).toEqual([]);
    expect(state.map).toBe(true);
    await expect(page.locator("#storymap-embed .vco-map")).toBeVisible();
});
