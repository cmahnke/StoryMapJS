// Replace Google Fonts / TypeNetwork @import url(...) with @fontsource imports
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("find src/scss/fonts -name 'font.*.scss'", { encoding: "utf8" }).split("\n").filter(Boolean);

// key: distinctive substring of the googleapis URL -> fontsource import lines
const MAPPING = [
    [/Abril\+Fatface/, ["@fontsource/abril-fatface"]],
    [/Noto\+Sans:ital@0;1/, ["@fontsource/noto-sans", "@fontsource/noto-sans/400-italic.css"]],
    [/Amatic\+SC:wght@400;700/, ["@fontsource/amatic-sc/400.css", "@fontsource/amatic-sc/700.css"]],
    [/Andika:ital@0;1/, ["@fontsource/andika", "@fontsource/andika/400-italic.css"]],
    [/Average\+Sans/, ["@fontsource/average-sans"]],
    [/Fjalla\+One/, ["@fontsource/fjalla-one"]],
    [/Bitter:ital,wght@0,100\.\.900/, ["@fontsource-variable/bitter", "@fontsource-variable/bitter/wght-italic.css"]],
    [/Raleway:ital,wght@0,100\.\.900/, ["@fontsource-variable/raleway", "@fontsource-variable/raleway/wght-italic.css"]],
    [/Clicker\+Script/, ["@fontsource/clicker-script"]],
    [/EB\+Garamond/, ["@fontsource-variable/eb-garamond", "@fontsource-variable/eb-garamond/wght-italic.css"]],
    [/Dancing\+Script:wght@400\.\.700/, ["@fontsource-variable/dancing-script"]],
    [/Ledger/, ["@fontsource/ledger"]],
    [/Fauna\+One/, ["@fontsource/fauna-one"]],
    [/Playfair\+Display\+SC/, ["@fontsource/playfair-display-sc", "@fontsource/playfair-display-sc/400-italic.css"]],
    [/Playfair\+Display:ital,wght@0,400\.\.900/, ["@fontsource-variable/playfair-display", "@fontsource-variable/playfair-display/wght-italic.css"]],
    [/Unica\+One/, ["@fontsource/unica-one"]],
    [/Gentium\+Book\+Plus:ital,wght@0,400;0,700/, ["@fontsource/gentium-book-plus/400.css", "@fontsource/gentium-book-plus/700.css", "@fontsource/gentium-book-plus/400-italic.css", "@fontsource/gentium-book-plus/700-italic.css"]],
    [/Open\+Sans:ital,wght@0,300\.\.800/, ["@fontsource-variable/open-sans", "@fontsource-variable/open-sans/wght-italic.css"]],
    [/Lato:ital,wght@0,400;0,700;1,300/, ["@fontsource/lato/400.css", "@fontsource/lato/700.css", "@fontsource/lato/300-italic.css", "@fontsource/lato/400-italic.css", "@fontsource/lato/700-italic.css"]],
    [/Lato:ital,wght@0,400;0,700;1,400/, ["@fontsource/lato/400.css", "@fontsource/lato/700.css", "@fontsource/lato/400-italic.css", "@fontsource/lato/700-italic.css"]],
    [/Lustria/, ["@fontsource/lustria"]],
    [/Medula\+One/, ["@fontsource/medula-one"]],
    [/Megrim/, ["@fontsource/megrim"]],
    [/Roboto\+Slab:wght@100\.\.900/, ["@fontsource-variable/roboto-slab"]],
    [/Old\+Standard\+TT/, ["@fontsource/old-standard-tt/400.css", "@fontsource/old-standard-tt/700.css", "@fontsource/old-standard-tt/400-italic.css"]],
    [/PT\+Sans\&family=PT\+Sans\+Narrow:wght@700\&family=PT\+Serif:ital@0;1/, ["@fontsource/pt-sans", "@fontsource/pt-sans/700.css", "@fontsource/pt-sans-narrow/700.css", "@fontsource/pt-serif", "@fontsource/pt-serif/400-italic.css"]],
    [/Rufina:wght@400;700/, ["@fontsource/rufina/400.css", "@fontsource/rufina/700.css"]],
    [/Sintony:wght@400;700/, ["@fontsource/sintony/400.css", "@fontsource/sintony/700.css"]],
    [/Ubuntu:ital,wght@0,300;0,500/, ["@fontsource/ubuntu/300.css", "@fontsource/ubuntu/500.css", "@fontsource/ubuntu/300-italic.css", "@fontsource/ubuntu/500-italic.css"]],
    [/Vollkorn:ital,wght@0,400\.\.900/, ["@fontsource-variable/vollkorn", "@fontsource-variable/vollkorn/wght-italic.css"]],
    [/typenetwork\.com/, ["@fontsource/bitter", "@fontsource-variable/roboto-slab", "@fontsource-variable/open-sans"]], // knightlab theme substitutes
];

for (const f of files) {
    let src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    const out = [];
    for (const line of lines) {
        if (/@import\s+url\(.*(googleapis|typenetwork)/.test(line)) {
            for (const [re, imports] of MAPPING) {
                if (re.test(line)) {
                    out.push(`@import "${imports[0]}";`);
                    if (imports.length > 1) out.push(imports.slice(1).map((i) => `@import "${i}";`).join("\n"));
                }
            }
            continue;
        }
        out.push(line);
    }
    if (out.join("\n") !== src) {
        writeFileSync(f, out.join("\n"));
        console.log("fonts converted:", f);
    }
}
