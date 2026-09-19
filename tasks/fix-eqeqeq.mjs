// eqeqeq: replace the flagged == / != at the reported position with === / !==
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
const byFile = new Map();
for (const r of results) {
    for (const m of r.messages) {
        if (m.ruleId !== "eqeqeq") continue;
        if (!byFile.has(r.filePath)) byFile.set(r.filePath, []);
        byFile.get(r.filePath).push({ line: m.line, col: m.column });
    }
}

for (const [file, sites] of byFile) {
    const lines = readFileSync(file, "utf8").split("\n");
    sites.sort((a, b) => b.col - a.col);
    for (const s of sites) {
        const line = lines[s.line - 1];
        if (!line) continue;
        const idx = s.col - 1;
        const two = line.slice(idx, idx + 2);
        if (two === "==") {
            lines[s.line - 1] = line.slice(0, idx) + "===" + line.slice(idx + 2);
        } else if (two === "!=") {
            lines[s.line - 1] = line.slice(0, idx) + "!==" + line.slice(idx + 2);
        } else if (line.slice(idx, idx + 3) === "===") {
            // already fine
        } else {
            console.log("SKIP", file, s.line, s.col, JSON.stringify(line.slice(idx - 5, idx + 8)));
        }
    }
    writeFileSync(file, lines.join("\n"));
}
console.log("eqeqeq fixed");
