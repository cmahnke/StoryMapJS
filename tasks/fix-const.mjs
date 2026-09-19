// prefer-const / no-var: convert flagged declarators to const/let at reported positions.
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
const byFile = new Map();
for (const r of results) {
    for (const m of r.messages) {
        if (!["prefer-const", "no-var"].includes(m.ruleId)) continue;
        if (!byFile.has(r.filePath)) byFile.set(r.filePath, []);
        byFile.get(r.filePath).push({ line: m.line, col: m.column, rule: m.ruleId });
    }
}

for (const [file, sites] of byFile) {
    const lines = readFileSync(file, "utf8").split("\n");
    const doneLines = new Set();
    sites.sort((a, b) => b.line - a.line);
    for (const s of sites) {
        if (doneLines.has(s.line)) continue;
        doneLines.add(s.line);
        const line = lines[s.line - 1];
        if (!line) continue;
        // replace the var/let keyword start with const (prefer-const) or let (no-var)
        const kw = s.rule === "prefer-const" ? "const" : "let";
        const m = line.match(/^(\s*)(var|let)(\s)/);
        if (m) {
            lines[s.line - 1] = line.replace(/^(\s*)(var|let)(\s)/, `$1${kw}$3`);
            // a multi-declarator (comma) can still be reassigned downstream; use let then
            // (caller can revisit) - keep const only for single declarators
            const rest = line.slice(m[0].length);
            if (kw === "const" && rest.includes(",")) {
                lines[s.line - 1] = line.replace(/^(\s*)(var|let)(\s)/, "$1let$3");
            }
        }
    }
    writeFileSync(file, lines.join("\n"));
}
console.log("const/let fixed");
