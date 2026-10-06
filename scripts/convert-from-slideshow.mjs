// Converts slideshow tours (W3C AnnotationCollection + extension, by URL or
// file) into storymap JSON ({ storymap: ... }) following
// docs/plans/SLIDESHOW_PLAN.md.
//
// Usage: node scripts/convert-from-slideshow.mjs [--settings settings.json]
//        [--out out.json] <tour-url-or-file> [...]
// With --out, all inputs must resolve to one document (a single input).
//
// The mapping itself is **not** here: it is the library's
// `slideshowToStorymapData()` (src/storymap/from-slideshow.ts), the
// counterpart of the `manifestToStorymapData()` the viewer reads with. This
// file is the file I/O around it (fetch + `next` page chain + optional
// player settings), and it re-exports the function so tests can convert
// in-process.
//
// Importing a TypeScript module from a `.mjs` file needs Node's type
// stripping, which is on by default from Node 22.18 and Node 23.6; the npm
// script passes `--experimental-strip-types` for Node 22.6-22.17.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
    followSlideshowPages,
    formatSlideshowWarning,
    isSlideshowCollection,
    slideshowToStorymapData,
} from "../src/storymap/from-slideshow.ts";

export {
    followSlideshowPages,
    formatSlideshowWarning,
    isSlideshowCollection,
    slideshowToStorymapData,
};

/** True when this file is the process entry point, not an import. */
const invokedDirectly =
    process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

function isUrl(value) {
    return /^(https?|file):\/\//i.test(value);
}

async function loadJson(source) {
    if (isUrl(source)) {
        const response = await fetch(source);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        return { doc: await response.json(), base: source };
    }
    return { doc: JSON.parse(readFileSync(source, "utf8")), base: source };
}

function resolveLink(link, base) {
    try {
        return new URL(link, base).href;
    } catch {
        return null;
    }
}

/** Fetch one slideshow tour plus its `next` page chain (bounded, cycle-guarded). */
export async function convertSlideshowSource(source, settings = null) {
    const { doc, base } = await loadJson(source);
    if (!isSlideshowCollection(doc)) {
        throw new Error("not a slideshow tour document");
    }
    // file inputs resolve `next` against the filesystem (node fetch cannot
    // do file: URLs), URL inputs against the tour URL
    const fromFile = !isUrl(source);
    const start = fromFile ? resolve(base) : base;
    const { pages: extraPages } = await followSlideshowPages({
        first: doc?.first,
        base: start,
        resolve: (link, current) => {
            if (fromFile) return join(dirname(current), link);
            return resolveLink(link, current);
        },
        load: async (absolute) => (await loadJson(absolute)).doc,
    });
    return slideshowToStorymapData(doc, { settings, extraPages });
}

function parseArgs(args) {
    const inputs = [];
    let settingsPath = null;
    let outPath = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--settings" && i + 1 < args.length) {
            settingsPath = args[++i];
        } else if (args[i] === "--out" && i + 1 < args.length) {
            outPath = args[++i];
        } else if (args[i] === "--help" || args[i] === "-h") {
            return { help: true };
        } else {
            inputs.push(args[i]);
        }
    }
    return { inputs, settingsPath, outPath };
}

async function main() {
    const { inputs, settingsPath, outPath, help } = parseArgs(process.argv.slice(2));
    if (help || inputs.length === 0) {
        console.log(
            "Usage: convert-from-slideshow.mjs [--settings settings.json] [--out out.json] <tour-url-or-file> [...]",
        );
        if (help) return;
        process.exitCode = 1;
        return;
    }
    let settings = null;
    if (settingsPath !== null) {
        try {
            settings = JSON.parse(readFileSync(settingsPath, "utf8"));
        } catch (err) {
            console.error(`✗ ${settingsPath}: ${err instanceof Error ? err.message : err}`);
            process.exitCode = 1;
            return;
        }
    }

    // Read and convert everything before writing anything: a failure on one
    // input must not leave another on disk, and two inputs with the same
    // basename would otherwise overwrite each other silently.
    const planned = [];
    const seen = new Map();
    let failed = false;
    for (const input of inputs) {
        const name = basename(input, extname(input)).replace(/[^a-z0-9-_]+/gi, "-");
        const out = outPath ?? join(process.cwd(), `${name}.storymap.json`);
        if (!outPath && seen.has(out)) {
            console.error(`✗ ${input}: writes the same ${name}.storymap.json as ${seen.get(out)}`);
            failed = true;
            continue;
        }
        seen.set(out, input);
        try {
            const { data, warnings } = await convertSlideshowSource(input, settings);
            for (const warning of warnings) {
                console.warn(`! ${input}: ${formatSlideshowWarning(warning)}`);
            }
            planned.push({ out, data });
        } catch (err) {
            console.error(`✗ ${input}: ${err instanceof Error ? err.message : err}`);
            failed = true;
        }
    }
    if (failed) {
        process.exitCode = 1;
        return;
    }
    if (outPath !== null && planned.length > 1) {
        console.error("✗ --out needs exactly one input");
        process.exitCode = 1;
        return;
    }

    for (const { out, data } of planned) {
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, `${JSON.stringify({ storymap: data }, null, 4)}\n`);
        console.log(`✓ ${out} (${data.slides.length} slide(s))`);
    }
    console.log(`Converted ${planned.length} tour(s).`);
}

if (invokedDirectly) {
    await main();
}
