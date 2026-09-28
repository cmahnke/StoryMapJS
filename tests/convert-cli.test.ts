import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * The convert:iiif CLI as a black box. These spawn node in a temp working
 * directory, so the repo's own public/examples-iiif/ is never touched —
 * which is precisely the hazard under test.
 */
describe("convert:iiif CLI", () => {
    const CLI = join(process.cwd(), "scripts/convert-to-iiif.mjs");

    function run(cwd: string, args: string[]): { status: number; output: string } {
        try {
            const output = execFileSync(
                process.execPath,
                ["--experimental-strip-types", CLI, ...args],
                { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
            );
            return { status: 0, output };
        } catch (err) {
            const e = err as { status?: number; stdout?: string; stderr?: string };
            return { status: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
        }
    }

    function writeStory(dir: string, rel: string, storymap: unknown): string {
        const path = join(dir, rel);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, JSON.stringify({ storymap }));
        return path;
    }

    function freshDir(): string {
        const dir = join(
            tmpdir(),
            `storymap-cli-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        );
        mkdirSync(dir, { recursive: true });
        return dir;
    }

    test("two inputs with the same basename fail loudly and write nothing", () => {
        const dir = freshDir();
        const one = writeStory(dir, "one/x.json", { map_type: "osm", slides: [] });
        const two = writeStory(dir, "two/x.json", { map_type: "iiif", slides: [] });

        const { status, output } = run(dir, [one, two]);

        // both inputs wanted public/examples-iiif/x.json; the first must not
        // be silently overwritten by the second
        expect(status).toBe(1);
        expect(output).toContain("x.json");
        expect(existsSync(join(dir, "public/examples-iiif/x.json"))).toBe(false);
    });

    test("a malformed input fails without leaving partial output", () => {
        const dir = freshDir();
        const good = writeStory(dir, "good.json", { map_type: "osm", slides: [] });
        const bad = join(dir, "bad.json");
        writeFileSync(bad, "{ not json");

        const { status } = run(dir, [good, bad]);

        expect(status).toBe(1);
        expect(existsSync(join(dir, "public/examples-iiif/good.json"))).toBe(false);
    });

    test("a single file converts and exits zero", () => {
        const dir = freshDir();
        const one = writeStory(dir, "one.json", { map_type: "osm", slides: [] });

        const { status, output } = run(dir, [one]);

        expect(status).toBe(0);
        expect(output).toContain("Converted 1 storymap(s)");
        expect(existsSync(join(dir, "public/examples-iiif/one.json"))).toBe(true);
    });
});
