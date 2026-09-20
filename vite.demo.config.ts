import { defineConfig } from "vite";
import { resolve } from "node:path";

// Demo/test page build. Runs after the library build (emptyOutDir: false) so
// that `vite preview` serves the built library together with the demo pages.
// Relative base so the pages work on GitHub Pages project URLs (a subpath).
export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: false,
        rollupOptions: {
            input: {
                index: resolve(process.cwd(), "index.html"),
                demo: resolve(process.cwd(), "demo.html"),
                harness: resolve(process.cwd(), "harness.html"),
            },
        },
    },
});
