import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./known-issues/helpers";

/** `__smReady` means the instance exists; the map is built a tick later. */
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

/**
 * `map.addTo()` / `map.removeFrom()` are the pre-0.10 container methods,
 * restored because `DomMixed` always provided them. The OpenLayers-specific
 * part is that the map target is bound at construction and the viewport size
 * is cached, so moving the map into a differently sized parent used to leave it
 * painting at the old size until an unrelated resize, and `removeFrom()` left
 * the renderer drawing into a detached node.
 *
 * None of that is testable in jsdom: it needs real layout and a real renderer,
 * which is why this is a browser spec.
 */

test("moving the map re-anchors the viewport and re-measures it", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);

    // a second, deliberately different-sized host
    const geometry = await page.evaluate(() => {
        const other = document.createElement("div");
        other.id = "second-host";
        other.style.width = "420px";
        other.style.height = "300px";
        other.style.position = "absolute";
        other.style.left = "0px";
        other.style.top = "0px";
        document.body.appendChild(other);
        return true;
    });
    expect(geometry).toBe(true);

    const sizes = await page.evaluate(async () => {
        const sm = (
            window as unknown as {
                __sm: {
                    // the engine owns addTo/removeFrom; the public handle is
                    // the raw ol/Map, which is where the size and target live
                    _map: {
                        addTo(el: HTMLElement): unknown;
                        // the engine's own container is what addTo() moves;
                        // getTarget() is a child of it
                        _el: { container: HTMLElement };
                    };
                    map: { getSize(): number[] | undefined; getTarget(): Element | undefined };
                };
            }
        ).__sm;
        const wait = () =>
            new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const size = () => Array.from(sm.map?.getSize() ?? []);

        const before = size();
        // addTo() moves the engine's container (the .vco-map div), not the
        // element getTarget() returns — that is a child of it. So "home" is
        // the container's parent, and asking for getTarget().parentElement
        // here would resolve to the container itself and append it into
        // itself.
        const home = sm._map._el.container.parentElement as HTMLElement;

        const other = document.getElementById("second-host") as HTMLElement;
        sm._map.addTo(other);
        await wait();
        const inOther = { size: size(), target: sm.map.getTarget() };

        // and back again — the move has to be reversible
        sm._map.addTo(home);
        await wait();
        const back = { size: size(), target: sm.map.getTarget() };

        return { before, inOther, back };
    });

    // the map element really moved and came back
    expect(sizes.inOther.target).toBeTruthy();
    expect(sizes.back.target).toBeTruthy();
    expect(sizes.inOther.size[0]).toBeGreaterThan(0);
    expect(sizes.inOther.size[1]).toBeGreaterThan(0);

    // Re-measured against the new parent, not the viewport it was built in.
    // Only the width tracks the host: the storymap sets the map's height as an
    // inline pixel value during layout, so the height is deliberately
    // independent of where the map sits.
    expect(sizes.before[0]).toBeGreaterThan(1000);
    expect(sizes.inOther.size[0]).toBeLessThan(600);
    // and the move is reversible
    expect(sizes.back.size[0]).toBeGreaterThan(1000);
});

test("removeFrom() detaches the renderer from the document", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);

    const result = await page.evaluate(async () => {
        const sm = (
            window as unknown as {
                __sm: {
                    _map: { removeFrom(el: HTMLElement): unknown };
                    map: { getTarget(): Element | undefined };
                };
            }
        ).__sm;
        const home = document.getElementById("storymap-embed") as HTMLElement;
        sm._map.removeFrom(home);
        return { target: sm.map?.getTarget() };
    });
    // a renderer with no target cannot keep painting into a detached node
    expect(result.target).toBeFalsy();
});

test("createPopup() stays a deprecated no-op and does not throw", async ({ page }) => {
    // map_popup has always been inert: the base implementation was an empty
    // body and the Leaflet override's body was commented out. Restored as a
    // no-op for pre-0.10 callers, so it must be callable and inert.
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);
    await waitForMap(page);

    const result = await page.evaluate(() => {
        const sm = (window as unknown as { __sm: { getMarkers(): unknown[] } }).__sm;
        const marker = sm.getMarkers()[0] as { createPopup?: (d?: unknown, o?: unknown) => void };
        const errors: string[] = [];
        try {
            marker?.createPopup?.({}, {});
        } catch (e) {
            errors.push(String(e));
        }
        return { errors, hasMethod: typeof marker?.createPopup === "function" };
    });
    expect(result.errors).toEqual([]);
    expect(result.hasMethod).toBe(true);
});
