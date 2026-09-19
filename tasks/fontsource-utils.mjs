// Converts font theme @fontsource css imports to @fontsource-utils/scss faces() mixins.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("grep -rl 'fontsource' src/scss/fonts --include='*.scss'", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);

const aliasFor = (pkg) => pkg.replace(/^@fontsource(-variable)?\//, "").replace(/-/g, "_");

for (const file of files) {
    const src = readFileSync(file, "utf8");
    const lines = src.split("\n");
    const pkgs = [];
    for (const line of lines) {
        const m = line.match(/^@import "@(fontsource(?:-variable)?)\/([^/"]+)/);
        if (m) {
            const full = "@" + m[1] + "/" + m[2];
            if (!pkgs.includes(full)) pkgs.push(full);
        }
    }
    if (pkgs.length === 0) continue;

    const useLines = ['@use "pkg:@fontsource-utils/scss" as fontsource;'];
    const includeLines = [];
    for (const pkg of pkgs) {
        const alias = aliasFor(pkg);
        useLines.push(`@use "pkg:${pkg}/scss" as ${alias};`);
        includeLines.push(`@include fontsource.faces($metadata: ${alias}.$metadata, $weights: all, $styles: all);`);
    }
    void useLines;

    // replace the import lines with the @use/@include block, placed before everything else
    const filtered = lines.filter(
        (l) => !/^@import "@fontsource/.test(l) && !/^@import "@fontsource-variable/.test(l)
    );
    const out = [...useLines, "", ...includeLines, "", ...filtered];
    writeFileSync(file, out.join("\n"));
    console.log("converted", file.replace(/.*src\/scss\//, ""), "->", pkgs.join(", "));
}
