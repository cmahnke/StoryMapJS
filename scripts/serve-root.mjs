/**
 * Minimal static file server for the repository root.
 * Used by the Playwright suite to serve contrib/examples/, which load the
 * built artifacts from ../../dist/ relative to their own location.
 *
 * Usage: node scripts/serve-root.mjs [port]  (default 8300)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());
const port = Number(process.argv[3] ?? 8300);

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".mp3": "audio/mpeg",
};

const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url ?? "/", "http://localhost");
        let pathname = decodeURIComponent(url.pathname);
        if (pathname.endsWith("/")) pathname += "index.html";
        const file = normalize(join(root, pathname));
        if (!file.startsWith(root)) {
            res.writeHead(403).end();
            return;
        }
        const body = await readFile(file);
        res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
        res.end(body);
    } catch {
        res.writeHead(404).end("not found");
    }
});

server.listen(port, () => {
    console.log(`serving ${root} on http://localhost:${port}`);
});
