import { defineConfig } from "vite";
import { resolve } from "node:path";

// Demo/test page build. Runs after the library build (emptyOutDir: false) so
// that `vite preview` serves the built library together with the demo pages.
export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: false,
        rollupOptions: {
            input: {
                index: resolve(process.cwd(), "index.html"),
                arya: resolve(process.cwd(), "arya.html"),
                harness: resolve(process.cwd(), "harness.html"),
            },
        },
    },
});
