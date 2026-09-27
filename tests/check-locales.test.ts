import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import {
    copyFileSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * scripts/check-locales.mjs is wired into CI, so its enforcement needs to be
 * covered: a locale gap that is not in the baseline must fail, and a baseline
 * entry that has been filled in must also fail so the baseline cannot rot.
 */
function runChecker(cwd: string, ...args: string[]) {
    try {
        const stdout = execFileSync(
            "node",
            [join(cwd, "scripts/check-locales.mjs"), "--strict", ...args],
            {
                cwd,
                encoding: "utf8",
                stdio: ["ignore", "pipe", "pipe"],
            },
        );
        return { code: 0, out: stdout, err: "" };
    } catch (err) {
        const e = err as { status: number; stdout: string; stderr: string };
        return { code: e.status, out: e.stdout, err: e.stderr };
    }
}

/** Copy the real repo's script + locales into a scratch dir we may mutate. */
function makeRepo() {
    const root = mkdtempSync(join(tmpdir(), "locale-check-"));
    const source = process.cwd();
    mkdirSync(join(root, "scripts"), { recursive: true });
    mkdirSync(join(root, "src/language/locale"), { recursive: true });
    copyFileSync(
        join(source, "scripts/check-locales.mjs"),
        join(root, "scripts/check-locales.mjs"),
    );
    for (const file of readdirSync(join(source, "src/language/locale"))) {
        if (!file.startsWith(".") && file.endsWith(".json")) {
            copyFileSync(
                join(source, "src/language/locale", file),
                join(root, "src/language/locale", file),
            );
        }
    }
    copyFileSync(
        join(source, "src/language/locale/.expected-gaps.json"),
        join(root, "src/language/locale/.expected-gaps.json"),
    );
    return root;
}

function localePath(root: string, locale: string) {
    return join(root, "src/language/locale", `${locale}.json`);
}

function readJson(path: string) {
    return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(path: string, value: unknown) {
    writeFileSync(path, JSON.stringify(value, null, 4), "utf8");
}

describe("check-locales enforcement", () => {
    it("passes on the real repository as committed", () => {
        const result = runChecker(process.cwd());
        expect(result.code, result.err).toBe(0);
    });

    it("fails when a complete locale loses a key", () => {
        const root = makeRepo();
        try {
            // de is complete, so it has no baseline entry: losing a key is a
            // regression, not a shrink of an accepted gap
            const data = readJson(localePath(root, "de"));
            delete data.messages.error;
            writeJson(localePath(root, "de"), data);

            const result = runChecker(root);
            expect(result.code).toBe(1);
            expect(result.err).toContain("newly missing");
            expect(result.err).toContain("messages.error");
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("fails when the baseline lists a gap that has been translated", () => {
        const root = makeRepo();
        try {
            const data = readJson(localePath(root, "et"));
            data.messages.error = "Viga laadimisel";
            writeJson(localePath(root, "et"), data);

            const result = runChecker(root);
            expect(result.code).toBe(1);
            expect(result.err).toContain("now translated");
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("fails on a key a locale invented", () => {
        const root = makeRepo();
        try {
            const data = readJson(localePath(root, "de"));
            data.messages.typo = "x";
            writeJson(localePath(root, "de"), data);

            const result = runChecker(root);
            expect(result.code).toBe(1);
            expect(result.err).toContain("not in en.json");
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("--write-baseline records the current gaps and then passes", () => {
        const root = makeRepo();
        try {
            const data = readJson(localePath(root, "de"));
            delete data.messages.error;
            writeJson(localePath(root, "de"), data);

            expect(runChecker(root).code).toBe(1);
            const write = runChecker(root, "--write-baseline");
            expect(write.code, write.err).toBe(0);
            expect(runChecker(root).code).toBe(0);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });

    it("does not treat .expected-gaps.json as a locale", () => {
        const root = makeRepo();
        try {
            const result = runChecker(root);
            expect(result.out).not.toContain("expected-gaps");
            expect(result.out).toMatch(/\d+ locales,/);
        } finally {
            rmSync(root, { recursive: true, force: true });
        }
    });
});
