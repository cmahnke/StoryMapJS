// prefer-const: split the flagged declarator out of its declaration statement as const.
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
const byFile = new Map();
for (const r of results) {
    for (const m of r.messages) {
        if (m.ruleId !== "prefer-const") continue;
        const name = (m.message.match(/'([^']+)'/) || [])[1];
        if (!name) continue;
        if (!byFile.has(r.filePath)) byFile.set(r.filePath, []);
        byFile.get(r.filePath).push({ line: m.line, name });
    }
}

// Find the full statement (keyword line .. line ending with ;) and split out `name = init`.
function splitDeclarator(lines, lineIdx, name) {
    // find statement start
    let start = lineIdx;
    while (start > 0 && !/(^|\s)(let|var|const)\s/.test(lines[start]) && !/[;{}]/.test(lines[start].trim().slice(0, 1))) {
        start--;
    }
    if (!/(^|\s)(let|var|const)\s/.test(lines[start])) return false;
    // find statement end (semicolon at depth 0)
    let end = start;
    let depth = 0;
    while (end < lines.length) {
        for (const ch of lines[end]) {
            if (ch === "(" || ch === "[" || ch === "{") depth++;
            if (ch === ")" || ch === "]" || ch === "}") depth--;
        }
        if (depth <= 0 && /;\s*$/.test(lines[end])) break;
        end++;
    }
    const statement = lines.slice(start, end + 1).join("\n");
    // extract `name = <value>` up to the next top-level comma or end
    const declRe = new RegExp(`([,;]|(^|\\n)\\s*(?:let|var)\\s+)${name}\\s*=([\\s\\S]*?)(?=,\\s*[\\w$]+\\s*=|,\\s*[\\w$]+\\s*[,;)]|$)`);
    const m = statement.match(declRe);
    if (!m) return false;
    const init = m[3].trim().replace(/;$/, "");
    const kwMatch = statement.match(/(^|\n)(\s*)(let|var)\s/);
    if (!kwMatch) return false;
    const indent = kwMatch[2];
    // remove declarator from statement
    let cleaned = statement.replace(declRe, (mm, pre) => (pre.startsWith(",") ? pre : ""));
    cleaned = cleaned.replace(/,\s*;/g, ";").replace(/,\s*$/, ";");
    // dedent initializer continuation lines
    const initLines = init.split("\n").map((l) => l.replace(new RegExp("^" + indent), "")).join("\n");
    lines.splice(start, end - start + 1, cleaned, `${indent}const ${name} = ${initLines};`);
    return true;
}

for (const [file, sites] of byFile) {
    const lines = readFileSync(file, "utf8").split("\n");
    let any = false;
    sites.sort((a, b) => b.line - a.line);
    for (const s of sites) {
        if (splitDeclarator(lines, s.line - 1, s.name)) any = true;
    }
    if (any) {
        writeFileSync(file, lines.join("\n"));
        console.log("split", file.replace(/.*StoryMapJS\//, ""));
    }
}
