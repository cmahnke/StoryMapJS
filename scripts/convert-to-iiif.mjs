// Converts legacy StoryMap JSON fixtures (public/examples/*.json) into IIIF
// Presentation API 3.0 manifests (public/examples-iiif/<name>.json) following
// the mapping proposed in docs/storymap-as-iiif-manifest.md.
//
// Usage: node scripts/convert-to-iiif.mjs [files...]
// With no arguments, converts all public/examples/*.json fixtures.
//
// Every fixture in public/examples-iiif/ is generated here except
// georeferenced-layer.json and georeferenced-layer-unsupported.json, which
// are hand-authored: a georeferenced layer is a manifest-only feature
// (storymap JSON cannot express ground control points), so there is nothing
// to convert from.
//
// The mapping itself is **not** here: it is the library's
// `storymapToManifest()` (src/storymap/to-iiif.ts), the counterpart of the
// `manifestToStorymapData()` the viewer reads with. This file is the file I/O
// around it, and it re-exports the function so
// tests/iiif-roundtrip.test.ts can convert in-process: that test asserts that
// regenerating a fixture is a no-op (so a hand edit to a generated file is
// caught) and that a manifest converts back to the storymap it came from. That
// is what makes each docs/plans/iiif-interop.md §2 term migration checkable
// as "unchanged in meaning" rather than by reading a fixture diff.
//
// Importing a TypeScript module from a `.mjs` file needs Node's type
// stripping, which is on by default from Node 22.18 and Node 23.6; `npm run
// convert:iiif` passes `--experimental-strip-types` for Node 22.6-22.17.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { storymapToManifest } from "../src/storymap/to-iiif.ts";

export { storymapToManifest };

/** True when this file is the process entry point, not an import. */
const invokedDirectly =
    process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

function main() {
    const args = process.argv.slice(2);
    let files;
    if (args.length > 0) {
        files = args;
    } else {
        const examplesDir = join(process.cwd(), "public/examples");
        files = readdirSync(examplesDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => join(examplesDir, f));
    }

    const outDir = join(process.cwd(), "public/examples-iiif");
    mkdirSync(outDir, { recursive: true });

    let converted = 0;
    for (const file of files) {
        const name = file
            .split("/")
            .pop()
            .replace(/\.json$/, "");
        const legacy = JSON.parse(readFileSync(file, "utf8"));
        const manifest = storymapToManifest(name, legacy);
        const outPath = join(outDir, `${name}.json`);
        writeFileSync(outPath, `${JSON.stringify(manifest, null, 4)}\n`);
        converted++;
        console.log(`✓ ${outPath} (${manifest.items.length} canvas(es))`);
    }
    console.log(`Converted ${converted} storymap(s) to ${outDir}/`);
}

if (invokedDirectly) {
    main();
}
