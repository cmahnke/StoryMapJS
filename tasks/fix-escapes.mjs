// Fixes no-useless-escape by removing the backslash at the reported position.
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
const byFile = new Map();
for (const r of results) {
    for (const m of r.messages) {
        if (m.ruleId !== "no-useless-escape") continue;
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
        // the escape begins right before the reported column
        const before = line.slice(0, s.col);
        const after = line.slice(s.col);
        if (before.endsWith("\\")) {
            lines[s.line - 1] = before.slice(0, -1) + after;
        } else if (before.endsWith("\\") === false && line[s.col - 1] === "\\") {
            lines[s.line - 1] = line.slice(0, s.col - 1) + line.slice(s.col);
        } else {
            console.log("SKIP", file, s.line, s.col);
        }
    }
    writeFileSync(file, lines.join("\n"));
    console.log("fixed escapes", file.replace(/.*StoryMapJS\//, ""));
}
