import { defineConfig } from "vite";
import { sitegen } from "./tasks/vite-plugin-sitegen";

// Dev/preview servers only (`vite`, `vite preview`, e2e). All builds run
// through rollup (see rollup.config.mjs).
export default defineConfig({
    plugins: [sitegen()],
    server: {
        port: 8000,
    },
});
