// Validates storymap JSON files against schema/storymap.schema.json.
// Usage: node scripts/validate-storymap.mjs [files...]
// With no arguments, validates all public/examples/*.json fixtures.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateStorymap } from "../src/storymap/validate.ts";

const args = process.argv.slice(2);
let files;
if (args.length > 0) {
    files = args;
} else {
    const examplesDir = join(process.cwd(), "public/examples");
    files = readdirSync(examplesDir).filter((f) => f.endsWith(".json")).map((f) => join(examplesDir, f));
}

let failed = 0;
for (const file of files) {
    let data;
    try {
        data = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
        console.error(`✗ ${file}: invalid JSON (${e.message})`);
        failed++;
        continue;
    }
    const errors = validateStorymap(data);
    if (errors.length === 0) {
        console.log(`✓ ${file}`);
    } else {
        console.error(`✗ ${file}: ${errors.length} error${errors.length > 1 ? "s" : ""}`);
        for (const err of errors) {
            console.error(`    ${err.path || "(root)"}: ${err.message}`);
        }
        failed++;
    }
}

process.exit(failed > 0 ? 1 : 0);
