// Compiles each src/scss/fonts/font.*.scss theme to dist/css/fonts/font.*.css.
// @fontsource packages are resolved through node and their font binaries
// are emitted to dist/css/fonts/files/.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { readdirSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import * as sass from "sass";

const req = createRequire(import.meta.url);
const root = process.cwd();
const outDir = join(root, "dist/css/fonts");
const filesDir = join(outDir, "files");

mkdirSync(filesDir, { recursive: true });

// Resolve bare "@fontsource/..." imports through node_modules
const nodeImporter = {
    findFileUrl(url) {
        if (!url.startsWith("@")) return null;
        try {
            return new URL("file://" + req.resolve(url));
        } catch {
            return null;
        }
    },
};

function findFontFile(baseName) {
    for (const scope of ["@fontsource", "@fontsource-variable"]) {
        const dir = join(root, "node_modules", scope);
        if (!existsSync(dir)) continue;
        for (const pkg of readdirSync(dir)) {
            const candidates = [
                join(dir, pkg, "files", baseName),
                join(dir, pkg, "files", baseName.replace(/\.woff2?$/, ".woff")),
            ];
            for (const c of candidates) {
                if (existsSync(c)) return c;
            }
        }
    }
    return null;
}

const fontDir = join(root, "src/scss/fonts");
const themes = readdirSync(fontDir).filter((f) => /^font\.[\w-]+\.scss$/.test(f));

for (const theme of themes) {
    const source = readFileSync(join(fontDir, theme), "utf8");
    const result = sass.compileString(source, {
        importers: [nodeImporter],
        loadPaths: [fontDir, join(root, "src/scss")],
        url: new URL("file://" + join(fontDir, theme)),
    });

    let css = result.css;

    // Rewrite font binary urls and copy the files
    css = css.replace(
        /url\((?:['"])?(\.\.?\/)?[^)"']*?([\w@.-]+\.woff2?|[\w@.-]+\.ttf|[\w@.-]+\.eot|[\w@.-]+\.svg)(?:['"])?\)/g,
        (m, rel, baseName) => {
            // skip data urls handled by regex shape already
            const found = findFontFile(baseName);
            if (!found) {
                console.warn(`  ! font binary not found: ${baseName}`);
                return m;
            }
            copyFileSync(found, join(filesDir, basename(found)));
            return `url(files/${basename(found)})`;
        },
    );

    writeFileSync(join(outDir, theme.replace(/\.scss$/, ".css")), css);
    console.log(`FONT CSS compiled ${theme}`);
}
