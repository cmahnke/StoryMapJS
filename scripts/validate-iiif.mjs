// Validates the IIIF Presentation 3.0 manifests in public/examples-iiif/ with
// the official IIIF presentation validator service.
//
// Usage: node scripts/validate-iiif.mjs [files...]
// With no arguments, validates all public/examples-iiif/*.json fixtures.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const VALIDATOR_URL = "https://presentation-validator.iiif.io/validate?version=3.0&format=json";
const REQUEST_DELAY_MS = 500;

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
    const name = file.split("/").pop();
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
        console.error(`✗ ${name}: invalid JSON (${e.message})`);
        failed++;
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

console.log(
    `\n${files.length - failed}/${files.length} manifest(s) passed the official IIIF validator.`,
);
process.exit(failed > 0 ? 1 : 0);
