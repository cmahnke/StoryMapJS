import { test, expect } from "@playwright/test";
import { harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #452 — "Remove or update CSS zoom property"
 * FIXED: the stylesheets no longer use the non-standard `zoom` property.
 *
 * This previously walked `document.styleSheets` looking for a declared `zoom`.
 * That approach produces a false positive outside Chromium: OpenLayers ships
 * `.ol-viewport canvas { all: unset }`, and Firefox and WebKit enumerate `zoom`
 * as a *declared* property once `all` has reset it, while Chromium does not. The
 * shipped CSS has no `zoom` declaration at all on any engine, so the walk was
 * reporting a CSSOM enumeration difference as a style regression.
 *
 * It now asserts on the stylesheet's source text, which is both engine
 * independent and closer to the issue's intent: a `zoom` declaration in our CSS
 * is a bug, whatever the CSSOM says about inherited/reset properties.
 */
const ZOOM_DECLARATION = /(?:^|[;{\s])zoom\s*:/i;

test("issue #452: our stylesheets declare no zoom property", async ({ page }) => {
    await page.goto(harnessUrl("issue-506-marker-sync"));
    await waitForStoryMap(page);

    const sources = await page.evaluate(async () => {
        const own: { href: string; text: string }[] = [];
        for (const sheet of Array.from(document.styleSheets)) {
            const href = sheet.href ?? "";
            // our own widget stylesheet. The harness page also links the
            // generated site chrome, which is not the viewer's concern here.
            if (!href.includes("/css/storymap.css")) continue;
            own.push({ href, text: await fetch(href).then((r) => r.text()) });
        }
        return own;
    });

    // the stylesheet was found, so the check below is not vacuous
    expect(sources.length).toBeGreaterThan(0);
    for (const { href, text } of sources) {
        const offending: string[] = [];
        // report the declaration with a little context when one is found
        const re = new RegExp(ZOOM_DECLARATION.source, "gi");
        for (const match of text.matchAll(re)) {
            offending.push(text.slice(Math.max(0, match.index - 20), match.index + 40));
        }
        expect(offending, `zoom declarations in ${href}`).toEqual([]);

        // A guard on the guard: `.ol-zoom`, `.ol-zoomslider` and
        // `.vco-icon-zoom-in` all contain the substring, and none of them is the
        // property. Without this the regex could be matching those and the
        // assertion above would be meaningless.
        expect(text).toContain(".ol-zoom");
        expect(text).not.toMatch(ZOOM_DECLARATION);
    }
});
