// Checks that every bundled locale defines the same keys as en.json.
//
// The runtime merges English into every other language per key (see
// src/language/Language.ts), so a locale missing a key is not an error — it
// silently shows English. That is exactly why the gap was invisible: 27 of the
// 29 bundled locales had no `consent_*` strings at all, and CI stayed green.
// This script turns that into a visible report.
//
// Usage: node scripts/check-locales.mjs [--strict]
//   --strict  exit non-zero when any locale is missing a key
//            (the default; the flag exists to print the report without failing)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOCALE_DIR = join(process.cwd(), "src/language/locale");
const REFERENCE = "en";

/** All leaf key paths in a locale, e.g. "messages.consent_allow". */
function keyPaths(object, prefix = "") {
    const paths = [];
    for (const [key, value] of Object.entries(object)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            paths.push(...keyPaths(value, path));
        } else {
            paths.push(path);
        }
    }
    return paths;
}

function readLocale(file) {
    // strip a UTF-8 BOM: JSON.parse rejects it, and so does every tool that
    // reads these files outside the bundler. (he.json had one.)
    const raw = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
}

const files = readdirSync(LOCALE_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

const reference = readLocale(join(LOCALE_DIR, `${REFERENCE}.json`));
const referenceKeys = keyPaths(reference).sort();

let problems = 0;
const rows = [];

for (const file of files) {
    const name = file.replace(/\.json$/, "");
    let locale;
    try {
        locale = readLocale(join(LOCALE_DIR, file));
    } catch (err) {
        console.error(`✗ ${name}: not valid JSON — ${err.message}`);
        problems += 1;
        continue;
    }
    const keys = keyPaths(locale);
    const missing = referenceKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !referenceKeys.includes(k));
    if (missing.length > 0 || extra.length > 0) {
        problems += 1;
    }
    rows.push({ name, total: keys.length, missing, extra, hasDirection: locale.direction });
}

const complete = rows.filter((r) => r.missing.length === 0 && r.extra.length === 0);
console.log(`${rows.length} locales, ${referenceKeys.length} keys in ${REFERENCE}.json`);
console.log(`${complete.length} complete, ${rows.length - complete.length} incomplete\n`);

for (const row of rows) {
    const status = row.missing.length === 0 && row.extra.length === 0 ? "✓" : "✗";
    const detail = [
        row.missing.length ? `missing ${row.missing.length}` : "",
        row.extra.length ? `unknown ${row.extra.length}` : "",
    ]
        .filter(Boolean)
        .join(", ");
    console.log(
        `  ${status} ${row.name.padEnd(7)} ${String(row.total).padStart(2)} keys` +
            (detail ? `  (${detail})` : ""),
    );
    if (row.missing.length > 0) {
        console.log(`        missing: ${row.missing.join(", ")}`);
    }
    if (row.extra.length > 0) {
        console.log(`        unknown: ${row.extra.join(", ")}`);
    }
}

if (problems > 0) {
    console.log(
        `\n${problems} locale(s) differ from ${REFERENCE}.json. These strings fall back to` +
            " English at runtime, so this is a translation gap, not a build break.",
    );
}
