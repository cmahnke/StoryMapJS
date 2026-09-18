import { defineConfig } from "vite";

// Library build: emits dist/js/storymap.js (UMD global "KLStoryMap"),
// dist/js/storymap.es.js (ESM) and dist/css/storymap.css.
export default defineConfig({
    server: {
        port: 8000,
    },
    build: {
        outDir: "dist",
        assetsInlineLimit: 0,
        lib: {
            entry: "src/main.js",
            name: "KLStoryMap",
            formats: ["es", "umd"],
            fileName: (format) => (format === "es" ? "js/storymap.es.js" : "js/storymap.js"),
            cssFileName: "css/storymap",
        },
        rollupOptions: {
            output: {
                assetFileNames: (asset) => {
                    const names = asset.names ?? (asset.name ? [asset.name] : []);
                    if (names.some((n) => n.endsWith(".css"))) {
                        return "css/storymap.css";
                    }
                    return "css/icons/[name][extname]";
                },
            },
        },
    },
});
