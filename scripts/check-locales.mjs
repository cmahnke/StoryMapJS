// Checks that every bundled locale defines the same keys as en.json.
//
// The runtime merges English into every other language per key (see
// src/language/Language.ts), so a locale missing a key is not an error — it
// silently shows English. That is exactly why the gap was invisible: 27 of the
// 29 bundled locales had no `consent_*` strings at all, and CI stayed green.
//
// The remaining gaps are recorded in .expected-gaps.json and are enforced:
// a new missing key fails, and so does a key listed in the baseline that has
// since been translated (which forces the baseline to shrink).
//
// Usage: node scripts/check-locales.mjs [--strict] [--write-baseline]
//   --strict          exit non-zero on any gap outside the baseline
//   --write-baseline  rewrite .expected-gaps.json from the current state
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCALE_DIR = join(process.cwd(), "src/language/locale");
const BASELINE_FILE = join(LOCALE_DIR, ".expected-gaps.json");
const REFERENCE = "en";
const STRICT = process.argv.includes("--strict");
const WRITE_BASELINE = process.argv.includes("--write-baseline");

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
    // dotfiles share the directory with the locale data (.expected-gaps.json),
    // and are not locales
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
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

if (!WRITE_BASELINE && !STRICT) {
    if (problems > 0) {
        console.log(
            `\n${problems} locale(s) differ from ${REFERENCE}.json. These strings fall back` +
                " to English at runtime, so this is a translation gap, not a build break.",
        );
    }
    process.exit(0);
}

// --- enforcement -------------------------------------------------------------

const gaps = {};
for (const row of rows) {
    if (row.missing.length > 0) gaps[row.name] = row.missing.sort();
}

if (WRITE_BASELINE) {
    writeFileSync(BASELINE_FILE, JSON.stringify(gaps, null, 4) + "\n", "utf8");
    const count = Object.values(gaps).reduce((n, keys) => n + keys.length, 0);
    console.log(
        `wrote ${Object.keys(gaps).length} locales / ${count} expected gaps to .expected-gaps.json`,
    );
    process.exit(0);
}

let baseline = {};
if (existsSync(BASELINE_FILE)) {
    try {
        baseline = JSON.parse(readFileSync(BASELINE_FILE, "utf8"));
    } catch (err) {
        console.error(`✗ .expected-gaps.json is not valid JSON — ${err.message}`);
        process.exit(1);
    }
}

const failures = [];

// 1. A key the reference has that no locale listed, or a key a locale invented.
for (const row of rows) {
    if (row.extra.length > 0) {
        failures.push(
            `${row.name}: has key(s) not in ${REFERENCE}.json — ${row.extra.join(", ")}` +
                " (typo, or the key was removed from en.json?)",
        );
    }
}

// 2. A key the baseline did not allow.
for (const [name, missing] of Object.entries(gaps)) {
    const allowed = new Set(baseline[name] ?? []);
    const unexpected = missing.filter((key) => !allowed.has(key));
    if (unexpected.length > 0) {
        failures.push(
            `${name}: newly missing ${unexpected.length} key(s) — ${unexpected.join(", ")}` +
                "\n    translate it, or re-record with --write-baseline if leaving it English is intended",
        );
    }
}

// 3. A baseline entry that has since been filled in, so the baseline is stale.
for (const [name, expected] of Object.entries(baseline)) {
    if (expected.length === 0) continue;
    const actual = new Set(gaps[name] ?? []);
    const fixed = expected.filter((key) => !actual.has(key));
    if (fixed.length > 0) {
        failures.push(
            `${name}: ${fixed.length} expected gap(s) are now translated — ${fixed.join(", ")}` +
                "\n    shrink the baseline with --write-baseline",
        );
    }
}

// 4. A baseline entry for a locale that no longer exists.
for (const name of Object.keys(baseline)) {
    if (!rows.some((r) => r.name === name)) {
        failures.push(`${name}: listed in .expected-gaps.json but no such locale is bundled`);
    }
}

if (failures.length > 0) {
    console.error(`\n✗ ${failures.length} locale problem(s):`);
    for (const failure of failures) {
        console.error(`  - ${failure}`);
    }
    process.exit(1);
}

console.log("\n✓ every locale gap matches the recorded baseline");
