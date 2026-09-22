import { test, expect } from "@playwright/test";
import { collectPageErrors, harnessUrl, waitForStoryMap } from "./helpers";

/**
 * KNOWN ISSUE #405 — "Use Custom Marker Error"
 * FIXED: storymaps with use_custom_markers render the custom icon images
 * without throwing.
 *
 * REGRESSION: custom markers briefly rendered BOTH the default pin glyph
 * (:before) and the custom image, because the marker element always kept
 * the vco-mapmarker class. Custom markers must not carry the pin class
 * (nor its ::before glyph); default markers keep it.
 */

test("issue #405: custom markers render without errors", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto(harnessUrl("instagram_couch"));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const markers = await page.evaluate(() => {
        const beforeContent = (el: Element): string =>
            window.getComputedStyle(el, "::before").content;
        const customs = Array.from(
            document.querySelectorAll(
                "#storymap-embed .vco-mapmarker-custom, #storymap-embed .vco-mapmarker-image-icon",
            ),
        );
        const pins = Array.from(
            document.querySelectorAll(
                "#storymap-embed .vco-mapmarker, #storymap-embed .vco-mapmarker-active",
            ),
        );
        return {
            total: customs.length + pins.length,
            customIcon: document.querySelectorAll("#storymap-embed .vco-mapmarker-custom").length,
            customImage: document.querySelectorAll("#storymap-embed .vco-mapmarker-image-icon")
                .length,
            defaultPin: pins.length,
            // a custom marker must not paint the default pin glyph ...
            customWithPinGlyph: customs.filter((el) => beforeContent(el) !== "none").length,
            // ... but must contain its image ...
            customWithoutImg: customs.filter((el) => !el.querySelector("img")).length,
            // while default pins must not contain an image ...
            defaultWithImg: pins.filter((el) => el.querySelector("img")).length,
            // ... but must paint the pin glyph
            defaultWithoutPinGlyph: pins.filter((el) => beforeContent(el) === "none").length,
        };
    });

    expect(errors).toEqual([]);
    expect(markers.total).toBeGreaterThan(0);
    expect(markers.customIcon + markers.customImage).toBeGreaterThan(0);
    expect(markers.customWithPinGlyph).toBe(0);
    expect(markers.customWithoutImg).toBe(0);
    expect(markers.defaultWithImg).toBe(0);
    expect(markers.defaultWithoutPinGlyph).toBe(0);
});

test("issue #405: per-slide icon markers hide the default pin", async ({ page }) => {
    const errors = collectPageErrors(page);
    // marktwain carries an `icon` per slide but no use_custom_markers flag:
    // force the custom-icon path via options override
    await page.goto(harnessUrl("marktwain", { use_custom_markers: true }));
    await waitForStoryMap(page);
    await page.waitForTimeout(1500);

    const markers = await page.evaluate(() => {
        const beforeContent = (el: Element): string =>
            window.getComputedStyle(el, "::before").content;
        const customs = Array.from(
            document.querySelectorAll("#storymap-embed .vco-mapmarker-custom"),
        );
        return {
            customIcon: customs.length,
            customWithPinGlyph: customs.filter((el) => beforeContent(el) !== "none").length,
            customWithoutImg: customs.filter((el) => !el.querySelector("img")).length,
            leftoverPins: document.querySelectorAll(
                "#storymap-embed .vco-mapmarker, #storymap-embed .vco-mapmarker-active",
            ).length,
        };
    });

    expect(errors).toEqual([]);
    expect(markers.customIcon).toBeGreaterThan(0);
    expect(markers.customWithPinGlyph).toBe(0);
    expect(markers.customWithoutImg).toBe(0);
    expect(markers.leftoverPins).toBe(0);
});
