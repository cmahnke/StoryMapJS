import { defineConfig } from "vite";
import { sitegen } from "./tasks/vite-plugin-sitegen";

// Docs-only regeneration (`npm run docs`): runs the sitegen plugin's
// buildStart side effects (public/ assets) without emitting a bundle.
export default defineConfig({
    plugins: [sitegen()],
    logLevel: "warn",
    build: {
        write: false,
        outDir: "dist",
        rollupOptions: {
            input: {
                sitegen: "./tasks/sitegen-stub.js",
            },
        },
    },
});
