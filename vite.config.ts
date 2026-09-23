import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { defineConfig, type Plugin } from "vite";
import dts from "unplugin-dts/vite";
import { sitegen } from "./plugins/sitegen";

// Single vite config for everything (replaces rollup.config.mjs).
// - `vite` / `vite preview`         -> dev + preview servers (sitegen only)
// - `vite build --mode lib`         -> dist/js/storymap.js (+map) + dist/js/storymap.d.ts
//                                      + dist/css/storymap.css (+ public/ copy via publicDir)
// - `vite build --mode pages`       -> dist/index.html + dist/demo.html + dist/harness.html
//                                      (+ assets, public/ copy). Must run after lib;
//                                      uses emptyOutDir:false to preserve lib outputs.
// `npm run build` runs lib then pages (see package.json).
const ROOT = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);

/**
 * Swallow style imports in the JS graph: the widget stylesheet is compiled
 * separately (see libraryCss) and the demo pages link the built CSS, so
 * no CSS must end up in (or be resolved from) the JS bundles.
 * Build-only: dev keeps real CSS for HMR.
 */
function dropStyleImports(): Plugin {
    return {
        name: "storymap-drop-styles",
        enforce: "pre",
        resolveId(id) {
            if (/\.(css|scss|sass|less)(\?.*)?$/.test(id.split("?")[0].split("#")[0])) {
                // Only swallow relative/source + ol styles; leave package CSS
                // imports that vite handles? No - swallow all like rollup did.
                return "\0storymap-empty-style";
            }
            return null;
        },
        load(id) {
            if (id === "\0storymap-empty-style") {
                return "export default {};";
            }
            return null;
        },
    };
}

/** Compile src/scss/VCO.StoryMap.scss + ol/ol.css -> dist/css/storymap.css. */
function buildLibraryCss() {
    const widgetCss = sass
        .compile(join(ROOT, "src/scss/VCO.StoryMap.scss"), {
            style: "compressed",
            loadPaths: [join(ROOT, "src/scss")],
        })
        .css.trimEnd();
    // ol ships ol.css expanded; re-compress so the bundle stays minified.
    const olCss = sass
        .compileString(readFileSync(req.resolve("ol/ol.css"), "utf8"), {
            style: "compressed",
        })
        .css.trimEnd();
    mkdirSync(join(ROOT, "dist/css"), { recursive: true });
    writeFileSync(join(ROOT, "dist/css/storymap.css"), `${widgetCss}\n${olCss}\n`);
}

function libraryCss(): Plugin {
    return {
        name: "storymap-library-css",
        writeBundle() {
            buildLibraryCss();
        },
    };
}

const widgetCssLink = `<link rel="stylesheet" href="./css/storymap.css" />`;

/** Inject shared widget CSS link into demo/harness pages + preserve site.css. */
function widgetCssLinks(): Plugin {
    return {
        name: "storymap-widget-css-links",
        transformIndexHtml(html, ctx) {
            const file = ctx.filename ?? "";
            if (file.endsWith("demo.html") || file.endsWith("harness.html")) {
                return html.replace("</head>", `    ${widgetCssLink}\n    </head>`);
            }
            if (file.endsWith("index.html") && !html.includes("site.css")) {
                // index.html links the generated static asset public/site.css;
                // vite drops the relative href at build time (it is not a
                // source asset), so re-inject it like the rollup
                // externalAssets: ["./site.css"] handling did.
                return html.replace(
                    "</head>",
                    `    <link rel="stylesheet" href="./site.css" />\n    </head>`,
                );
            }
            return html;
        },
    };
}

export default defineConfig(({ mode }) => {
    if (mode === "lib") {
        return {
            plugins: [
                sitegen(),
                dropStyleImports(),
                libraryCss(),
                dts({
                    tsconfigPath: join(ROOT, "tsconfig.json"),
                    include: ["src"],
                    bundleTypes: true,
                }),
            ],
            build: {
                outDir: join(ROOT, "dist"),
                emptyOutDir: true,
                sourcemap: true,
                copyPublicDir: true,
                lib: {
                    entry: resolve(ROOT, "src/main.ts"),
                    name: "StoryMap",
                    formats: ["es"],
                    fileName: "js/storymap",
                },
            },
            server: { port: 8000 },
        };
    }
    if (mode === "pages") {
        return {
            // Relative asset URLs (./assets/...) so dist/ works from any
            // subpath (GitHub Pages project sites); matches old rollup output.
            base: "./",
            plugins: [sitegen(), dropStyleImports(), widgetCssLinks()],
            build: {
                outDir: join(ROOT, "dist"),
                emptyOutDir: false,
                copyPublicDir: true,
                sourcemap: false,
                rollupOptions: {
                    input: {
                        index: resolve(ROOT, "index.html"),
                        demo: resolve(ROOT, "demo.html"),
                        harness: resolve(ROOT, "harness.html"),
                    },
                    output: {
                        entryFileNames: "assets/[name]-[hash].js",
                        chunkFileNames: "assets/[name]-[hash].js",
                        assetFileNames: "assets/[name]-[hash][extname]",
                    },
                },
            },
            server: { port: 8000 },
        };
    }
    // Dev / preview servers only.
    return {
        plugins: [sitegen()],
        server: {
            port: 8000,
        },
    };
});
