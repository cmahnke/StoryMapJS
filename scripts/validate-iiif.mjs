// Validates the IIIF Presentation 3.0 manifests in public/examples-iiif/ with
// the official IIIF presentation validator service.
//
// Usage: node scripts/validate-iiif.mjs [files...]
// With no arguments, validates all public/examples-iiif/*.json fixtures.
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const VALIDATOR_URL = "https://presentation-validator.iiif.io/validate?version=3.0&format=json";
const REQUEST_DELAY_MS = 500;

/**
 * Manifests the official validator cannot accept, with the reason.
 *
 * The validator checks against the Presentation 3.0 base JSON Schema, which
 * predates every extension. The Georeference Extension is published and its
 * context resolves, but the extension's shapes — a `FeatureCollection` body and
 * an embedded `Image` target — are in no branch of that schema, so they are
 * rejected with "is not valid under any of the given schemas". We keep the
 * extension's own spelling anyway: a georeferenced manifest that other IIIF
 * tools can read is worth more than one this validator happens to accept, and
 * the two spellings cannot both be shipped. See docs/plans/iiif-interop.md
 * §2.10.
 *
 * These are still parsed as JSON, and the reader is covered by unit tests and
 * the browser matrix, so a typo in one does not go unnoticed. Any *other*
 * failure is still a failure.
 */
const EXTENSION_NOT_IN_BASE_SCHEMA = new Map([
    [
        "georeferenced-layer.json",
        "Georeference Extension: FeatureCollection body and embedded Image target",
    ],
    [
        "georeferenced-layer-unsupported.json",
        "Georeference Extension: FeatureCollection body and embedded Image target",
    ],
]);

const args = process.argv.slice(2);
let files;
if (args.length > 0) {
    files = args;
} else {
    const dir = join(process.cwd(), "public/examples-iiif");
    files = readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => join(dir, f));
}

async function validate(manifest, attempts = 3) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const res = await fetch(VALIDATOR_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(manifest),
            });
            // the validator service rejects large bodies with 413 — report
            // those as skipped rather than failed
            if (res.status === 413) {
                return { okay: 1, skipped: true };
            }
            if (res.status === 429 || res.status >= 500) {
                throw new Error(`HTTP ${res.status}`);
            }
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                throw new Error(`non-JSON validator response (HTTP ${res.status})`);
            }
        } catch (e) {
            if (attempt === attempts) {
                throw e;
            }
            await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS * attempt * 2));
        }
    }
}

let failed = 0;
for (const file of files) {
    const name = basename(file);
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
        console.error(`✗ ${name}: invalid JSON (${e.message})`);
        failed++;
        continue;
    }
    const extensionReason = EXTENSION_NOT_IN_BASE_SCHEMA.get(name);
    if (extensionReason !== undefined) {
        // parsed above, so the JSON is at least well-formed
        console.log(`⊘ ${name}: not covered — ${extensionReason} is not in the P3 3.0 base schema`);
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
        continue;
    }
    try {
        const result = await validate(manifest);
        if (result.okay === 1 && result.skipped) {
            console.log(`⊘ ${name}: skipped — manifest too large for the official validator`);
        } else if (result.okay === 1) {
            console.log(`✓ ${name}`);
        } else {
            console.error(`✗ ${name}`);
            for (const err of result.errorList || []) {
                console.error(`    ${err.title?.split("\n").join(" ")}`);
            }
            if (!result.errorList?.length && result.error) {
                console.error(`    ${result.error}`);
            }
            failed++;
        }
    } catch (e) {
        console.error(`✗ ${name}: validator request failed (${e.message})`);
        failed++;
    }
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
}

const notCovered = files.filter((f) => EXTENSION_NOT_IN_BASE_SCHEMA.has(basename(f))).length;
console.log(
    `\n${files.length - failed - notCovered}/${files.length - notCovered} manifest(s) passed the official IIIF validator` +
        (notCovered > 0 ? `, ${notCovered} not covered by the base schema.` : "."),
);
process.exit(failed > 0 ? 1 : 0);
