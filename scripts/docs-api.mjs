/**
 * Generate the TypeDoc API reference into public/docs/api.
 *
 * TypeDoc failures are reported as warnings rather than build failures. The
 * generated API reference is documentation, and a docs-only problem should
 * not prevent the library, demo pages, or other site assets from building.
 * If generation fails, any previous public/docs/api output is left alone; a
 * stale API reference is preferable to a missing one.
 *
 * Usage: node scripts/docs-api.mjs [-- additional typedoc arguments]
 */
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const typedocBin = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../node_modules/typedoc/bin/typedoc",
);
const result = spawnSync(process.execPath, [typedocBin, ...process.argv.slice(2)], {
    stdio: "inherit",
});

if (result.error) {
    console.warn(
        `docs:api: unable to start TypeDoc (${result.error.message}). Continuing without API docs; the site's API docs link may 404 or use stale output.`,
    );
    process.exit(0);
}

if (typeof result.status === "number" && result.status !== 0) {
    const detail = result.signal ? ` (signal ${result.signal})` : "";
    console.warn(
        `docs:api: TypeDoc exited with status ${result.status}${detail}. Continuing without API docs; the site's API docs link may 404 or use stale output.`,
    );
}

process.exit(0);
