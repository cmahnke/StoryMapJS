/**
 * Vite dev-server plugin: regenerates the site assets on startup so
 * `vite dev` serves them from public/ without a build step.
 *
 * The generation logic lives in tasks/sitegen.mjs (shared with the rollup
 * build); this wrapper only adapts it to the Vite plugin API.
 */
import type { Plugin } from "vite";

export function sitegen(): Plugin {
    return {
        name: "storymap-sitegen",
        async buildStart() {
            const { buildFonts, buildDocs } = await import("./sitegen.mjs");
            buildFonts(process.cwd());
            buildDocs(process.cwd());
        },
    };
}
