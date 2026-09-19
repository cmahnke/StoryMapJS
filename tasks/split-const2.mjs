// prefer-const (strict): split out `name = value` declarators that are entirely
// on ONE line of the declaration statement. Multi-line declarators are reported
// for hand-fixing.
import { readFileSync, writeFileSync } from "node:fs";

const results = JSON.parse(readFileSync(0, "utf8"));
const byFile = new Map();
for (const r of results) {
    for (const m of r.messages) {
        if (m.ruleId !== "prefer-const") continue;
        const name = (m.message.match(/'([^']+)' is/) || [])[1];
        if (!name) continue;
        if (!byFile.has(r.filePath)) byFile.set(r.filePath, []);
        byFile.get(r.filePath).push({ line: m.line, col: m.column, name });
    }
}

for (const [file, sites] of byFile) {
    const lines = readFileSync(file, "utf8").split("\n");
    let changed = false;
    // process from bottom up so line numbers stay valid
    sites.sort((a, b) => b.line - a.line || b.col - a.col);

    for (const s of sites) {
        const line = lines[s.line - 1];
        if (!line) continue;
        // declarator starts at column (s.col - 1): `name = value`
        const idx = line.indexOf(s.name + " =", s.col - 1 <= 1 ? 0 : s.col - 1 - 10);
        const at = line.indexOf(s.name + " =");
        if (at === -1) continue;
        // the declarator must end on the same line: find next top-level comma or statement end
        const after = line.slice(at + s.name.length + 1);
        const depth = (line.slice(0, at).match(/\(|\[/g) || []).length - (line.slice(0, at).match(/\)|\]/g) || []).length;
        // simplistic: require no unbalanced brackets in `after` up to the next comma/semicolon
        const endComma = after.search(/(?<=\)|\]|[\w'"\)])\s*,\s*$|,\s*(?=[\w$'"{\[])/);
        const endSemi = after.indexOf(";");
        const declaratorEnd =
            endSemi !== -1 && (endComma === -1 || endSemi < endComma)
                ? at + s.name.length + 1 + endSemi + 1
                : endComma !== -1
                  ? at + s.name.length + 1 + endComma + 1
                  : -1;
        if (declaratorEnd === -1 || depth !== 0) {
            console.log("HAND:", file.replace(/.*StoryMapJS\//, ""), s.line, s.name);
            continue;
        }
        const declarator = line.slice(at, declaratorEnd);
        const kwMatch = line.match(/^\s*(let|var)\s/);
        if (!kwMatch) continue;
        const indent = line.match(/^\s*/)[0];
        if (at === kwMatch[0].length + indent.length - (kwMatch[0].length - kwMatch[0].trimStart().length)) {
            // flagged declarator is FIRST in the chain: convert keyword to const
            // only if the REST of the chain is on this same line and ends with , or ;
            const rest = line.slice(kwMatch[0].length + s.name.length).trim();
            if (rest.startsWith(",")) {
                const newRest = rest.slice(1).trim();
                const nextKw = /^\s*$/.test(newRest) ? "" : "let ";
                lines[s.line - 1] = `${indent}const ${declarator};\n${indent}${nextKw}${newRest}`;
                changed = true;
            } else if (rest.endsWith(";")) {
                lines[s.line - 1] = `${indent}const ${declarator};`;
                changed = true;
            } else {
                console.log("HAND:", file.replace(/.*StoryMapJS\//, ""), s.line, s.name);
            }
        } else {
            // declarator is NOT first: split it out
            const before = line.slice(0, at).replace(/,\s*$/, ";");
            const tail = line.slice(declaratorEnd).trim();
            const tailDecl = tail.startsWith(",") ? tail.slice(1).trim() : "";
            let newLines;
            if (tailDecl) {
                newLines = [`${indent}const ${declarator};`, `${indent}let ${tailDecl}`];
            } else {
                newLines = [`${indent}const ${declarator};`, tail.replace(/;$/, "") + ";"];
            }
            lines.splice(s.line - 1, 1, ...newLines);
            changed = true;
        }
    }
    if (changed) {
        writeFileSync(file, lines.join("\n"));
        console.log("split-const:", file.replace(/.*StoryMapJS\//, ""));
    }
}
