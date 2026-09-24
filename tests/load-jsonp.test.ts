import { test, expect } from "vitest";
// Vitest runs in the jsdom environment (vitest.config.ts): appended scripts
// never execute, so tests drive the registered window globals directly.

const { loadJSONP, uniqueGlobalName } = await import("../src/core/Load");
const {
    parseWikipediaUrl,
    wikipediaCallbackBase,
    wikipediaApiUrl,
} = await import("../src/media/types/Wikipedia");

type Globals = Record<string, unknown>;

const globals = (window as unknown as Globals);
const payload = (name: string) => (globals[name] as (d: unknown) => void);

/*	uniqueGlobalName
================================================== */

test("uniqueGlobalName returns the base name when free", () => {
    expect(uniqueGlobalName("wikipediaCallback_FreeTitle")).toBe("wikipediaCallback_FreeTitle");
});

test("uniqueGlobalName suffixes taken names", () => {
    (globals["wikipediaCallback_Taken"] as unknown) = () => {};
    const claimed = uniqueGlobalName("wikipediaCallback_Taken");
    expect(claimed).not.toBe("wikipediaCallback_Taken");
    expect(claimed.startsWith("wikipediaCallback_Taken_")).toBe(true);
    delete globals["wikipediaCallback_Taken"];
});

/*	loadJSONP
================================================== */

test("loadJSONP resolves with the callback payload and cleans up", async () => {
    const promise = loadJSONP("https://example.com/api?callback=cb_load_ok", "cb_load_ok");
    payload("cb_load_ok")({ query: 1 });
    await expect(promise).resolves.toEqual({ query: 1 });
    expect("cb_load_ok" in globals).toBe(false);
});

test("concurrent loads sharing a base name resolve with their own payloads", async () => {
    // Same-article overlap: without unique slots the second load would
    // clobber the first handler and the loser's script would call a deleted
    // global (Uncaught ReferenceError: wikipediaCallback_* is not defined).
    const first = loadJSONP("https://example.com/a?callback=cb_shared", "cb_shared");
    const secondName = uniqueGlobalName("cb_shared");
    expect(secondName).not.toBe("cb_shared");
    const second = loadJSONP(`https://example.com/b?callback=${secondName}`, secondName);
    payload("cb_shared")("A");
    payload(secondName)("B");
    await expect(first).resolves.toBe("A");
    await expect(second).resolves.toBe("B");
});

test("a late script after timeout calls a stub instead of throwing", async () => {
    const promise = loadJSONP("https://example.com/slow?callback=cb_late", "cb_late", {
        timeout: 20,
    });
    await expect(promise).rejects.toThrow(/timed out/);
    // The abandoned slot holds a self-deleting stub: the already-fetched
    // script executes harmlessly instead of throwing a ReferenceError.
    expect(() => payload("cb_late")({ query: 1 })).not.toThrow();
    expect("cb_late" in globals).toBe(false);
});

test("abort leaves a harmless stub for an in-flight script", async () => {
    const controller = new AbortController();
    const promise = loadJSONP("https://example.com/x?callback=cb_abort", "cb_abort", {
        signal: controller.signal,
    });
    controller.abort();
    await expect(promise).rejects.toThrow(/abort/i);
    expect(() => payload("cb_abort")({ query: 1 })).not.toThrow();
});

/*	Wikipedia URL helpers
================================================== */

test("parseWikipediaUrl decodes underscores and percent-encoding, strips hashes", () => {
    expect(parseWikipediaUrl("https://en.wikipedia.org/wiki/Abraham_Lincoln")).toEqual({
        title: "Abraham Lincoln",
        language: "en",
    });
    expect(parseWikipediaUrl("https://en.wikipedia.org/wiki/New_York_City")).toEqual({
        title: "New York City",
        language: "en",
    });
    expect(parseWikipediaUrl("https://de.wikipedia.org/wiki/Albert%20Einstein#Leben")).toEqual({
        title: "Albert Einstein",
        language: "de",
    });
});

test("wikipediaCallbackBase keeps alphanumerics without %20 artifacts", () => {
    // Before the fix the %20-encoded id leaked "%" stripping into names
    // like wikipediaCallback_Abraham20Lincoln.
    expect(wikipediaCallbackBase("Abraham Lincoln")).toBe("wikipediaCallback_AbrahamLincoln");
    expect(wikipediaCallbackBase("New York City")).toBe("wikipediaCallback_NewYorkCity");
});

test("wikipediaApiUrl encodes the title and names the claimed callback", () => {
    const url = wikipediaApiUrl("en", "Abraham Lincoln", "wikipediaCallback_AbrahamLincoln");
    expect(url).toContain("titles=Abraham%20Lincoln");
    expect(url).toContain("callback=wikipediaCallback_AbrahamLincoln");
    expect(url.startsWith("https://en.wikipedia.org/w/api.php")).toBe(true);
});
