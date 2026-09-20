/**
 * Build the HTML versions of the repository documentation (README, migration
 * guide, IIIF proposal) for the landing page, plus the compiled site chrome
 * stylesheet. Output is committed under public/ so the dev server and the GH
 * Pages build both serve it.
 *
 * Usage: node tasks/build-docs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { compile } from "sass";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "docs");

const DOCS = [
    { md: "README.md", out: "readme.html", title: "README" },
    { md: "docs/migration-from-knightlab.md", out: "migration.html", title: "Migration guide" },
    {
        md: "docs/storymap-as-iiif-manifest.md",
        out: "iiif.html",
        title: "StoryMap data as IIIF manifests",
    },
];

const NAV = /* html */ `
    <nav class="sm-nav-top">
        <a class="sm-brand" href="../index.html">StoryMap <span>JS</span></a>
        <ul>
            <li><a href="https://github.com/cmahnke/StoryMapJS">GitHub</a></li>
            <li><a href="https://github.com/cmahnke/StoryMapJS/issues">Issues</a></li>
        </ul>
    </nav>
    <nav class="sm-subnav" aria-label="Page navigation">
        <div class="sm-subnav-inner">
            <span class="sm-brand-sm">Documentation</span>
            <ul>
                <li><a href="../index.html#overview">Overview</a></li>
                <li><a href="../index.html#examples">Examples</a></li>
                <li><a href="./readme.html">README</a></li>
                <li><a href="./migration.html">Migration guide</a></li>
                <li><a href="./iiif.html">IIIF docs</a></li>
            </ul>
        </div>
    </nav>`;

const FOOTER = /* html */ `
    <footer class="sm-footer">
        <p>
            A fork of <a href="https://github.com/NUKnightLab/StoryMapJS">NUKnightLab/StoryMapJS</a>,
            rewritten in TypeScript. Original tool by
            <a href="https://knightlab.northwestern.edu/">Northwestern University Knight Lab</a>.
            Available under the <a href="https://opensource.org/license/MPL-2-0">MPL-2.0</a> license.
        </p>
    </footer>`;

// relative markdown links (docs/*.md, schema/, public/) resolve against the
// generated page's location; map the common cases to sensible targets
function rewriteLinks(html) {
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

mkdirSync(outDir, { recursive: true });

// Compile the site chrome stylesheet to a static asset shared by every page
// (the widget styles are NOT part of it; they stay behind the iframe).
const siteCss = compile(join(root, "src/scss/site/site.scss")).css;
writeFileSync(join(root, "public", "site.css"), siteCss);
console.log("docs: src/scss/site/site.scss -> public/site.css");

for (const doc of DOCS) {
    const md = readFileSync(join(root, doc.md), "utf-8");
    const body = rewriteLinks(marked.parse(md, { async: false }));
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
