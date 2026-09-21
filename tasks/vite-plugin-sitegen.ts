/**
 * Vite plugin that generates the site assets which used to be built by the
 * standalone tasks/build-fonts.mjs and tasks/build-docs.mjs scripts:
 *
 * - each src/scss/fonts/font.*.scss theme -> public/css/fonts/font.*.css,
 *   with @fontsource font binaries copied to public/css/fonts/files/
 * - src/scss/site/site.scss -> public/site.css
 * - README.md + docs/*.md -> public/docs/*.html (via marked)
 *
 * Everything lands under public/ so `vite dev` serves it and `vite build`
 * copies it verbatim into dist/. Runs on buildStart (dev server, library
 * build and demo build alike); all steps are idempotent.
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    readdirSync,
    copyFileSync,
    existsSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, basename } from "node:path";
import { marked } from "marked";
import * as sass from "sass";
import type { Plugin } from "vite";

const req = createRequire(import.meta.url);

// Resolve bare "@fontsource/..." imports through node_modules,
// and "pkg:..." URLs via dart-sass's NodePackageImporter.
const nodeImporter = {
    findFileUrl(url: string): URL | null {
        if (!url.startsWith("@")) return null;
        try {
            return new URL("file://" + req.resolve(url));
        } catch {
            return null;
        }
    },
};
const pkgImporter = new sass.NodePackageImporter();

function findFontFile(root: string, baseName: string): string | null {
    for (const scope of ["@fontsource", "@fontsource-variable"]) {
        const dir = join(root, "node_modules", scope);
        if (!existsSync(dir)) continue;
        for (const pkg of readdirSync(dir)) {
            const candidates = [
                join(dir, pkg, "files", baseName),
                join(dir, pkg, "files", baseName.replace(/\.woff2?$/, ".woff")),
            ];
            for (const c of candidates) {
                if (existsSync(c)) return c;
            }
        }
    }
    return null;
}

export function buildFonts(root: string = process.cwd()): void {
    // Output to public/ so `vite dev` serves the font CSS directly; the vite
    // build copies it verbatim into dist/css/fonts.
    const outDir = join(root, "public/css/fonts");
    const filesDir = join(outDir, "files");
    const fontDir = join(root, "src/scss/fonts");

    mkdirSync(filesDir, { recursive: true });

    const themes = readdirSync(fontDir).filter((f) => /^font\.[\w-]+\.scss$/.test(f));

    for (const theme of themes) {
        const source = readFileSync(join(fontDir, theme), "utf8");
        const result = sass.compileString(source, {
            importers: [pkgImporter, nodeImporter],
            loadPaths: [fontDir, join(root, "src/scss")],
            url: new URL("file://" + join(fontDir, theme)),
        });

        let css = result.css;

        // Rewrite font binary urls and copy the files
        css = css.replace(
            /url\((?:['"])?(\.\.?\/)?[^)"']*?([\w@.-]+\.woff2?|[\w@.-]+\.ttf|[\w@.-]+\.eot|[\w@.-]+\.svg)(?:['"])?\)/g,
            (m: string, _rel: string, baseName: string) => {
                // skip data urls handled by regex shape already
                const found = findFontFile(root, baseName);
                if (!found) {
                    console.warn(`  ! font binary not found: ${baseName}`);
                    return m;
                }
                copyFileSync(found, join(filesDir, basename(found)));
                return `url(files/${basename(found)})`;
            },
        );

        writeFileSync(join(outDir, theme.replace(/\.scss$/, ".css")), css);
        console.log(`FONT CSS compiled ${theme}`);
    }
}

interface DocEntry {
    md: string;
    out: string;
    title: string;
}

const DOCS: DocEntry[] = [
    { md: "README.md", out: "readme.html", title: "README" },
    { md: "docs/migration-from-knightlab.md", out: "migration.html", title: "Migration guide" },
    {
        md: "docs/storymap-as-iiif-manifest.md",
        out: "iiif.html",
        title: "StoryMap data as IIIF manifests",
    },
];

const NAV = /* html */ `
    <nav class="navbar navbar-dark">
        <ul>
            <li class="logo">
                <a href="../index.html">StoryMap <span>JS</span></a>
            </li>
        </ul>
        <ul class="nav-right">
            <li>
                <a class="button button-dark button-active" href="https://github.com/cmahnke/StoryMapJS"
                    >GitHub</a
                >
            </li>
            <li>
                <a class="button button-dark" href="https://github.com/cmahnke/StoryMapJS/issues"
                    >Issues</a
                >
            </li>
        </ul>
    </nav>
    <header class="header-product header-product-docs">
        <nav id="navbar-secondary" class="navbar navbar-subnav" aria-label="Page navigation">
            <ul>
                <li><a class="button" href="../index.html#overview">Overview</a></li>
                <li><a class="button" href="../index.html#examples">Examples</a></li>
                <li><a class="button" href="./readme.html">README</a></li>
                <li><a class="button" href="./migration.html">Migration guide</a></li>
                <li><a class="button" href="./iiif.html">IIIF docs</a></li>
                <li><a class="button" href="./api/index.html">API docs</a></li>
                <li><a class="button" href="../index.html#help">Help</a></li>
            </ul>
        </nav>
    </header>`;

const FOOTER = /* html */ `
    <footer class="footer-knightlab">
        <div class="footer-grid">
            <div>
                <div class="footer-brand">StoryMap <span>JS</span></div>
                <ul class="list-social">
                    <li>
                        <a href="https://github.com/cmahnke/StoryMapJS" title="StoryMapJS fork on GitHub"
                            >GitHub</a
                        >
                    </li>
                    <li>
                        <a href="https://github.com/NUKnightLab/StoryMapJS" title="Upstream Knight Lab repository"
                            >Upstream</a
                        >
                    </li>
                </ul>
            </div>
            <div class="footer-description">
                <p>
                    A TypeScript rewrite of
                    <a href="https://github.com/NUKnightLab/StoryMapJS">NUKnightLab/StoryMapJS</a>,
                    the original tool by
                    <a href="https://knightlab.northwestern.edu/">Northwestern University Knight Lab</a>.
                </p>
                <span class="copyright">
                    Released under the <a href="https://opensource.org/license/MPL-2-0">MPL-2.0</a> license.
                </span>
            </div>
        </div>
    </footer>`;

// relative markdown links (docs/*.md, schema/, public/) resolve against the
// generated page's location; map the common cases to sensible targets
function rewriteLinks(html: string): string {
    return html
        .replace(
            /href="[^"]*?DEVELOPMENT\.md"/g,
            'href="https://github.com/cmahnke/StoryMapJS/blob/main/DEVELOPMENT.md"',
        )
        .replace(
            /href="[^"]*?KNOWN_ISSUES\.md"/g,
            'href="https://github.com/cmahnke/StoryMapJS/blob/main/KNOWN_ISSUES.md"',
        )
        .replace(
            /href="[^"]*?CHANGELOG"/g,
            'href="https://github.com/cmahnke/StoryMapJS/blob/main/CHANGELOG"',
        )
        .replace(
            /href="\.\.\/schema\//g,
            'href="https://github.com/cmahnke/StoryMapJS/tree/main/schema/',
        )
        .replace(/href="\.\.\/public\//g, 'href="../')
        .replace(/href="\.\/docs\//g, 'href="./');
}

export function buildDocs(root: string = process.cwd()): void {
    const outDir = join(root, "public", "docs");
    mkdirSync(outDir, { recursive: true });

    // Compile the site chrome stylesheet to a static asset shared by every page
    // (the widget styles are NOT part of it; they stay behind the iframe).
    const siteCss = sass.compile(join(root, "src/scss/site/site.scss")).css;
    writeFileSync(join(root, "public", "site.css"), siteCss);
    console.log("docs: src/scss/site/site.scss -> public/site.css");

    for (const doc of DOCS) {
        const md = readFileSync(join(root, doc.md), "utf-8");
        const body = rewriteLinks(marked.parse(md, { async: false }) as string);
        const html = /* html */ `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${doc.title} — StoryMapJS</title>
        <meta name="description" content="${doc.title} — StoryMapJS documentation" />
        <link rel="stylesheet" href="../site.css" />
    </head>
    <body class="sm-site">
        ${NAV}
        <main class="sm-docs">
            ${body}
        </main>
        ${FOOTER}
    </body>
</html>
`;
        writeFileSync(join(outDir, doc.out), html);
        console.log(`docs: ${doc.md} -> public/docs/${doc.out}`);
    }
}

export function sitegen(): Plugin {
    return {
        name: "storymap-sitegen",
        buildStart() {
            buildFonts(process.cwd());
            buildDocs(process.cwd());
        },
    };
}
