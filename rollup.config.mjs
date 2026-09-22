/**
 * Unified rollup build for StoryMapJS (`npm run build` runs `rollup -c`).
 *
 * Configs (run in order):
 * - library: src/main.ts -> dist/js/storymap.js (ESM + sourcemap) plus the
 *   site assets (fonts/docs into public/), the widget stylesheet
 *   (dist/css/storymap.css) and the public/ -> dist/ copy.
 * - types: tsc-emitted declarations (dist/.dts-tmp/src/main.d.ts, produced by
 *   the `build:declarations` script) -> dist/js/storymap.d.ts via
 *   rollup-plugin-dts. No tsconfig.build.json: the declarations are emitted
 *   from the base tsconfig.json with CLI overrides.
 * - pages: index.html, demo.html and harness.html -> dist/ (demo/docs site).
 *
 * `vite` stays for `dev`/`preview`/e2e servers only (see vite.config.ts).
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { dts } from "rollup-plugin-dts";
import { buildDocs, buildFonts } from "./tasks/sitegen.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);

/**
 * Swallow style imports in the JS graph: the widget stylesheet is compiled
 * separately (see buildLibraryCss) and the demo pages link the built CSS, so
 * no CSS must end up in (or be resolved from) the JS bundles.
 */
function dropStyleImports() {
    return {
        name: "storymap-drop-styles",
        resolveId(id) {
            if (/\.(css|scss|sass|less)(\?.*)?$/.test(id)) {
                return { id: "\0storymap-empty-style", moduleSideEffects: false };
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

/**
 * Site assets: regenerate public/ (fonts, docs, site chrome), then — once
 * the library bundle is written — compile the widget stylesheet and copy
 * public/ verbatim into dist/.
 */
function siteAssets() {
    return {
        name: "storymap-site-assets",
        buildStart() {
            buildFonts(ROOT);
            buildDocs(ROOT);
        },
        writeBundle() {
            buildLibraryCss();
            cpSync(join(ROOT, "public"), join(ROOT, "dist"), { recursive: true });
        },
    };
}

const jsPlugins = () => [
    dropStyleImports(),
    resolve({ browser: true, extensions: [".ts", ".mts", ".mjs", ".js", ".json"] }),
    commonjs(),
    json({ compact: true }),
    typescript({ tsconfig: join(ROOT, "tsconfig.json") }),
];

const library = {
    input: join(ROOT, "src/main.ts"),
    output: { file: join(ROOT, "dist/js/storymap.js"), format: "es", sourcemap: true },
    plugins: [siteAssets(), ...jsPlugins()],
};

/** Strip side-effect style imports from declarations (they carry no types). */
const stripStyleImports = {
    name: "strip-style-imports",
    transform(code, id) {
        if (!id.endsWith(".d.ts")) {
            return null;
        }
        const stripped = code.replace(
            /^import\s+["'][^"']*\.(css|scss|sass|less)["'];?[ \t]*$/gm,
            "",
        );
        return stripped === code ? null : { code: stripped, map: null };
    },
};

const types = {
    input: join(ROOT, "dist/.dts-tmp/src/main.d.ts"),
    output: [{ file: join(ROOT, "dist/js/storymap.d.ts"), format: "es" }],
    // Bundle relative sources, keep bare package imports external so the
    // consumer resolves them from the installed dependencies.
    external: (id) => !id.startsWith(".") && !id.startsWith("\0") && !isAbsolute(id),
    plugins: [stripStyleImports, dts()],
};

const widgetCssLink = `<link rel="stylesheet" href="./css/storymap.css" />`;

const pages = {
    output: {
        dir: join(ROOT, "dist"),
        format: "es",
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
    },
    plugins: [
        html({
            input: ["index.html", "demo.html", "harness.html"],
            rootDir: ROOT,
            // site.css is a generated static asset (copied via public/);
            // leave the href alone instead of rebundling it.
            externalAssets: ["./site.css"],
            transformHtml: [
                (htmlString, { htmlFileName }) => {
                    // The demo pages used to get the widget styles from
                    // per-page CSS bundles; they now share the library CSS.
                    if (htmlFileName === "demo.html" || htmlFileName === "harness.html") {
                        return htmlString.replace("</head>", `    ${widgetCssLink}\n    </head>`);
                    }
                    return htmlString;
                },
            ],
        }),
        ...jsPlugins(),
    ],
};

export default [library, types, pages];
