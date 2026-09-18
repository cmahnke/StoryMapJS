// One-shot Less -> SCSS converter for src/scss
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("find src/scss -name '*.scss'", { encoding: "utf8" }).split("\n").filter(Boolean);

// Pass 1: collect variable names declared anywhere
const varNames = new Set();
for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/^\s*@([\w-]+)\s*:/gm)) varNames.add(m[1]);
    for (const m of src.matchAll(/[@{]([\w-]+)[:}]/g)) varNames.add(m[1]); // interpolated + inline
    for (const m of src.matchAll(/\.([a-z-]+)\(@/g)) varNames.add(m[1]); // mixin params
}

// Pass 2: transform
for (const f of files) {
    let src = readFileSync(f, "utf8");

    // Interpolation @{x} -> #{$x}
    src = src.replace(/@\{([\w-]+)\}/g, "#{$$$1}");

    // LESS escape/format e(%("...")) lines: strip IE filter lines entirely
    src = src.replace(/^\s*filter:\s*e\(%\(.*\)\s*;?$/gm, "");
    src = src.replace(/^\s*filter:\s*e\(.*\)\s*;?$/gm, "");

    // property merge "+" (transition+: ...) -> plain property
    src = src.replace(/([-\w]+)\+:/g, "$1:");

    // LESS color function spin() -> adjust-hue()
    src = src.replace(/spin\(/g, "adjust-hue(");

    // @import of local less files -> extensionless (scss resolution)
    src = src.replace(/^(\s*)@import\s+"([^"]+)\.less";?/gm, '$1@import "$2";');

    // Mixin definitions: .name(@p: default, @p2: x) { -> @mixin name($p: default, $p2: x) {
    src = src.replace(/^(\s*)\.([a-z][\w-]*)\s*\(([^)]*)\)\s*\{/gm, (m, indent, name, params) => {
        if (params.trim() === "") return `${indent}@mixin ${name} {`;
        const scssParams = params
            .split(";")
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) =>
                p.split(",").map((part) => {
                    const mm = part.match(/^@([\w-]+)\s*:\s*(.*)$/);
                    if (mm) return `\$${mm[1]}: ${mm[2]}`;
                    return part.replace(/^@([\w-]+)\s*$/, "$$$1").trim();
                }).join(", ")
            )
            .join(", ");
        return `${indent}@mixin ${name}(${scssParams}) {`;
    });

    // Namespaced mixin calls (Dark theme): #gradient > .horizontal(...) -> @include gradient-horizontal(...)
    src = src.replace(/#gradient\s*>\s*\.([a-z-]+)\(([^;]*)\);?/g, (m, name, args) => {
        const a = args.split(";").map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/^@([\w-]+)\s*:\s*/, "").trim()).join(", ");
        return `@include gradient-${name}(${a});`;
    });

    // Mixin calls: line is only .name(args) or .name(args); or .name;
    src = src.replace(/^(\s*)\.([a-z][\w-]*)\s*\((.+)\)\s*;?\s*$/gm, (m, indent, name, args) => {
        if (!varNames.has(name) && !isKnownMixin(name)) return m;
        return `${indent}@include ${name}(${args.trim()});`.replace(/\(\s*\);$/, ");");
    });
    src = src.replace(/^(\s*)\.([a-z][\w-]*)\s*;\s*$/gm, (m, indent, name) => {
        if (!isKnownMixin(name)) return m;
        return `${indent}@include ${name};`;
    });

    // Variable declarations remaining: @name: -> $name:
    src = src.replace(/^(\s*)@([\w-]+)(\s*:\s*)/gm, "$1$$$2$3");

    // Variable references: @name where name is a known variable -> $name
    src = src.replace(/@([\w-]+)/g, (m, name) => {
        if (varNames.has(name)) return `$${name}`;
        return m; // @media, @import etc
    });

    writeFileSync(f, src);
    console.log("converted", f);
}

function isKnownMixin(name) {
    return [
        "animation-timing-cubic-bezier", "property-animation", "opacity", "background-opacity",
        "background-color-opacity", "slide-text-shadow", "border-radius", "border-top-radius",
        "border-right-radius", "border-bottom-radius", "border-left-radius", "box-shadow",
        "transform", "transition", "hyphens", "user-select", "clearfix", "translucent-background",
        "reset-filter", "center-block", "gradient-vertical", "gradient-horizontal", "gradient-vertical",
        "gradient-directional", "gradient-horizontal-three-colors", "gradient-vertical-three-colors",
        "gradient-radial", "gradient-striped", "background", "border", "horizontal", "vertical",
    ].includes(name);
}
