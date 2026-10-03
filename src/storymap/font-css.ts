/**
 * Font-theme stylesheet resolution.
 *
 * Pure functions (no viewer state), extracted from `StoryMap.ts` so the
 * 2000-line viewer file does not also own URL policy. Both are re-exported
 * from `./StoryMap`, so existing import paths keep working.
 */

/**
 * Resolve a `font_css` value to an absolute stylesheet URL.
 *
 * - `stock:<name>` resolves against the library location.
 * - Absolute URLs pass through untouched.
 * - Anything else resolves against the page URL, so hosts can reference
 *   themes vendored into their own public dir (e.g. "fonts/font.css").
 */
export function resolveFontCssUrl(font: string): string {
    if (font.startsWith("stock:")) {
        const font_name = font.split(":")[1] || "default";
        // A crafted name ("stock:../../secret") would otherwise resolve to an
        // arbitrary same-origin file next to the bundle, because the name is
        // concatenated into a URL path. Only accept a bare theme name.
        if (!/^[a-z0-9-]+$/i.test(font_name)) {
            console.warn(
                "StoryMapJS: ignoring font_css with an invalid stock theme name",
                font_name,
            );
            return new URL(/* @vite-ignore */ "../css/fonts/font.default.css", import.meta.url)
                .href;
        }
        // resolved against the library location: one directory up from
        // src/main.ts (dev) and js/storymap.js (build) in both cases
        return new URL("../css/fonts/font." + font_name + ".css", import.meta.url).href;
    }
    // Absolute URL, protocol-relative, or a data: URL. Note this must be a
    // real URL test, not a `/^(http|https|\/\/)/` prefix check: the old prefix
    // test false-positived on a relative path that merely *starts* with those
    // letters (e.g. "httpfonts.css"), which raised a spurious consent prompt
    // for a same-origin file.
    if (/^[a-z][a-z0-9+.-]*:/i.test(font) || font.startsWith("//")) {
        return font;
    }
    return new URL(font, document.baseURI).href;
}

/** True when `url` points off-origin (or at a data: URL) and needs a consent ask. */
export function isExternalUrl(url: string): boolean {
    // data:/blob: are not off-origin but are not a theme stylesheet either
    if (/^(data|blob):/i.test(url)) {
        return true;
    }
    try {
        return new URL(url, document.baseURI).origin !== window.location.origin;
    } catch {
        // unparseable: treat as external, so we err towards asking
        return true;
    }
}
