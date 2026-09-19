// Renames unused vars to _-prefixed (or removes unused import specifiers) based on eslint JSON output.
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
for (const r of results) {
    if (!r.messages.length) continue;
    let src = readFileSync(r.filePath, "utf8");
    const lines = src.split("\n");
    let changed = false;

    for (const m of r.messages) {
        if (m.ruleId !== "@typescript-eslint/no-unused-vars") continue;
        const name = (m.message.match(/'([^']+)' is/) || [])[1];
        if (!name) continue;
        const line = lines[m.line - 1];
        if (line === undefined) continue;

        if (/^\s*import\b/.test(line) || /^\s*} from /.test(line)) {
            // remove the specifier from the import list
            const spec = new RegExp(`(\\{[^}]*?)\\b${name}\\b,?\\s*([^}]*\\})`);
            if (spec.test(line)) {
                lines[m.line - 1] = line.replace(spec, (mm, before, after) => {
                    let b = before.replace(/,\s*$/, "");
                    let a = after;
                    if (!b.trim().endsWith("{") && a.trim() && !a.startsWith(",")) a = ", " + a;
                    if (!b.trim() && a.startsWith(",")) a = a.slice(1);
                    return b + a;
                });
                changed = true;
                continue;
            }
        }
        // plain local: rename to _NAME
        const renamed = line.replace(new RegExp(`\\b${name}\\b`), `_${name}`);
        if (renamed !== line) {
            lines[m.line - 1] = renamed;
            changed = true;
        }
    }

    if (changed) {
        writeFileSync(r.filePath, lines.join("\n"));
        console.log("fixed", r.filePath.replace(/.*StoryMapJS\//, ""));
    }
}
