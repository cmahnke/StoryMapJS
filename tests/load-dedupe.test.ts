import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadCSS, loadJS } from "../src/core/Load";

/**
 * Two viewers on a page need the same third-party scripts (the YouTube and
 * SoundCloud APIs) and the same font stylesheet. Injecting them once per
 * viewer re-defines the global (`window.YT`) and re-applies the theme, so
 * repeat requests for one URL have to share a single element.
 */
/** The pristine method: re-patched per test, and restored after each one.
 *  Bound, so it can be restored as a plain property and still find `head`. */
const pristineAppendChild = document.head.appendChild.bind(document.head);

describe("loadJS/loadCSS deduplication", () => {
    /** Elements the loader injected, newest last. */
    let injected: HTMLElement[];
    /** When true, the test resolves/rejects each element itself. */
    let manual = false;

    beforeEach(() => {
        injected = [];
        manual = false;
        document.head.appendChild = ((node: Node) => {
            const result = pristineAppendChild(node);
            if (
                node instanceof HTMLElement &&
                (node.tagName === "SCRIPT" || node.tagName === "LINK")
            ) {
                injected.push(node);
                if (!manual) {
                    // the loaders only ever set onload/onerror, so nothing
                    // would ever settle in jsdom
                    queueMicrotask(() => (node as HTMLScriptElement).onload?.(new Event("load")));
                }
            }
            return result;
        }) as typeof document.head.appendChild;
    });

    afterEach(() => {
        // restore, or each beforeEach would wrap the previous wrapper and the
        // nested ones would all record the same element
        document.head.appendChild = pristineAppendChild;
        document.head.replaceChildren();
        injected = [];
    });

    /** Settle the most recently injected element. */
    function settleLast(event: "load" | "error"): void {
        const node = injected[injected.length - 1] as HTMLScriptElement;
        if (event === "load") node.onload?.(new Event("load"));
        else node.onerror?.(new Event("error"));
    }

    function count(tag: "SCRIPT" | "LINK", url: string): number {
        return [...document.head.querySelectorAll(tag)].filter(
            (n) => n.getAttribute("src") === url || n.getAttribute("href") === url,
        ).length;
    }

    it("injects one script for concurrent requests of the same URL", async () => {
        const url = "https://example.invalid/api.js";
        await Promise.all([loadJS(url), loadJS(url), loadJS(url)]);
        expect(count("SCRIPT", url)).toBe(1);
    });

    it("injects one script for a repeat request after the first resolved", async () => {
        const url = "https://example.invalid/again.js";
        await loadJS(url);
        await loadJS(url);
        expect(count("SCRIPT", url)).toBe(1);
    });

    it("injects one stylesheet for concurrent requests of the same URL", async () => {
        const url = "https://example.invalid/font.css";
        await Promise.all([loadCSS(url), loadCSS(url)]);
        expect(count("LINK", url)).toBe(1);
    });

    it("keeps different URLs separate", async () => {
        await Promise.all([
            loadJS("https://example.invalid/a.js"),
            loadJS("https://example.invalid/b.js"),
        ]);
        expect(count("SCRIPT", "https://example.invalid/a.js")).toBe(1);
        expect(count("SCRIPT", "https://example.invalid/b.js")).toBe(1);
    });

    it("a failed load is not cached, so the next caller retries", async () => {
        const url = "https://example.invalid/flaky.js";
        manual = true;
        const failing = loadJS(url);
        expect(injected.length).toBe(1);
        settleLast("error");
        await expect(failing).rejects.toThrow(/Failed to load/);

        // a cached failure would poison the URL for every later viewer
        manual = false;
        await expect(loadJS(url)).resolves.toBeUndefined();
        expect(count("SCRIPT", url)).toBe(2);
    });

    it("one caller's abort rejects only that caller", async () => {
        const url = "https://example.invalid/abort.js";
        const controller = new AbortController();
        manual = true;

        const aborted = loadJS(url, { signal: controller.signal });
        const sibling = loadJS(url);
        // the sibling must share the element, not queue a second injection
        expect(count("SCRIPT", url)).toBe(1);

        // the teardown case: one viewer goes away while a sibling still waits
        controller.abort();
        await expect(aborted).rejects.toThrow(/abort/i);
        expect(count("SCRIPT", url)).toBe(1);

        // ...and the shared load is still live for the other caller
        settleLast("load");
        await expect(sibling).resolves.toBeUndefined();
    });

    it("rejects immediately when handed an already-aborted signal", async () => {
        const url = "https://example.invalid/pre-aborted.js";
        manual = true;
        const controller = new AbortController();
        controller.abort();
        await expect(loadJS(url, { signal: controller.signal })).rejects.toThrow(/abort/i);
    });
});
